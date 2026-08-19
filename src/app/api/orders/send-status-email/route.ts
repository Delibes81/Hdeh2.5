import { timingSafeEqual } from 'node:crypto';
import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import OrderConfirmationEmail from '@/components/emails/OrderConfirmation';
import ProductionConfirmationEmail from '@/components/emails/ProductionConfirmation';
import PreparingShippingEmail from '@/components/emails/PreparingShipping';
import ShippingConfirmationEmail from '@/components/emails/ShippingConfirmation';

const orderStatuses = ['paid', 'en_fabricacion', 'preparando_envio', 'enviado'] as const;
type OrderStatus = (typeof orderStatuses)[number];

interface EmailRequestBody {
    orderId?: unknown;
    status?: unknown;
    trackingNumber?: unknown;
    carrier?: unknown;
}

interface OrderRecord {
    id: string;
    status: string;
    contact_email: string | null;
    shipping_address: unknown;
}

const isOrderStatus = (value: unknown): value is OrderStatus =>
    typeof value === 'string' && orderStatuses.includes(value as OrderStatus);

const secretsMatch = (provided: string, expected: string) => {
    const providedBuffer = Buffer.from(provided);
    const expectedBuffer = Buffer.from(expected);

    return providedBuffer.length === expectedBuffer.length
        && timingSafeEqual(providedBuffer, expectedBuffer);
};

const getCustomerName = (shippingAddress: unknown) => {
    if (
        shippingAddress
        && typeof shippingAddress === 'object'
        && 'name' in shippingAddress
        && typeof shippingAddress.name === 'string'
        && shippingAddress.name.trim()
    ) {
        return shippingAddress.name.trim();
    }

    return 'Cliente';
};

async function getAuthorizedClient(request: Request): Promise<SupabaseClient | null> {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
        return null;
    }

    const expectedInternalSecret = process.env.ORDER_EMAIL_API_SECRET;
    const providedInternalSecret = request.headers.get('x-order-email-secret');

    if (
        expectedInternalSecret
        && providedInternalSecret
        && secretsMatch(providedInternalSecret, expectedInternalSecret)
    ) {
        const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
        if (!serviceRoleKey) {
            throw new Error('SUPABASE_SERVICE_ROLE_KEY no está configurada');
        }

        return createClient(supabaseUrl, serviceRoleKey, {
            auth: { persistSession: false, autoRefreshToken: false },
        });
    }

    const authorization = request.headers.get('authorization');
    if (!authorization?.startsWith('Bearer ')) {
        return null;
    }

    const accessToken = authorization.slice('Bearer '.length).trim();
    if (!accessToken) {
        return null;
    }

    const authenticatedClient = createClient(supabaseUrl, supabaseAnonKey, {
        auth: { persistSession: false, autoRefreshToken: false },
        global: { headers: { Authorization: `Bearer ${accessToken}` } },
    });

    const { data: { user }, error } = await authenticatedClient.auth.getUser(accessToken);
    if (error || !user) return null;

    const { data: adminMembership, error: adminError } = await authenticatedClient
        .from('admin_users')
        .select('user_id')
        .eq('user_id', user.id)
        .maybeSingle();

    return adminError || !adminMembership ? null : authenticatedClient;
}

export async function POST(request: Request) {
    try {
        const resendApiKey = process.env.RESEND_API_KEY;
        if (!resendApiKey) {
            return NextResponse.json(
                { error: 'El servicio de correo no está configurado' },
                { status: 503 },
            );
        }

        const supabase = await getAuthorizedClient(request);
        if (!supabase) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }

        const body = await request.json() as EmailRequestBody;
        const orderId = typeof body.orderId === 'string' ? body.orderId.trim() : '';

        if (!orderId || !isOrderStatus(body.status)) {
            return NextResponse.json(
                { error: 'orderId y status válido son requeridos' },
                { status: 400 },
            );
        }

        const trackingNumber = typeof body.trackingNumber === 'string'
            ? body.trackingNumber.trim()
            : '';
        const carrier = typeof body.carrier === 'string' && body.carrier.trim()
            ? body.carrier.trim()
            : 'Paquetería';

        if (body.status === 'enviado' && !trackingNumber) {
            return NextResponse.json(
                { error: 'El número de rastreo es requerido para un pedido enviado' },
                { status: 400 },
            );
        }

        const { data, error: orderError } = await supabase
            .from('orders')
            .select('id, status, contact_email, shipping_address')
            .eq('id', orderId)
            .single();

        if (orderError || !data) {
            return NextResponse.json({ error: 'Pedido no encontrado' }, { status: 404 });
        }

        const order = data as OrderRecord;
        if (order.status !== body.status) {
            return NextResponse.json(
                { error: 'El estado solicitado no coincide con el estado actual del pedido' },
                { status: 409 },
            );
        }

        if (!order.contact_email) {
            return NextResponse.json(
                { error: 'El pedido no tiene un correo de contacto' },
                { status: 422 },
            );
        }

        const customerName = getCustomerName(order.shipping_address);
        const shortOrderId = order.id.slice(0, 8);
        let subject: string;
        let emailContent: React.ReactElement;

        switch (body.status) {
            case 'paid':
                subject = `¡Hemos recibido tu pedido #${shortOrderId}!`;
                emailContent = OrderConfirmationEmail({ customerName, orderId: order.id });
                break;
            case 'en_fabricacion':
                subject = `¡Tu pedido #${shortOrderId} está en fabricación!`;
                emailContent = ProductionConfirmationEmail({ customerName, orderId: order.id });
                break;
            case 'preparando_envio':
                subject = `¡Tu pedido #${shortOrderId} se está preparando!`;
                emailContent = PreparingShippingEmail({ customerName, orderId: order.id });
                break;
            case 'enviado':
                subject = `¡Tu pedido #${shortOrderId} va en camino!`;
                emailContent = ShippingConfirmationEmail({
                    customerName,
                    orderId: order.id,
                    trackingNumber,
                    carrier,
                });
                break;
        }

        const resend = new Resend(resendApiKey);
        const { data: emailData, error: emailError } = await resend.emails.send({
            from: 'H de Helena <pedidos@hdehelena.com>',
            to: [order.contact_email],
            subject,
            react: emailContent,
        });

        if (emailError) {
            console.error('Error de Resend al enviar actualización de pedido:', emailError);
            return NextResponse.json({ error: emailError.message }, { status: 502 });
        }

        return NextResponse.json({ success: true, data: emailData });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Error inesperado';
        console.error('Error enviando actualización de pedido:', error);
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
