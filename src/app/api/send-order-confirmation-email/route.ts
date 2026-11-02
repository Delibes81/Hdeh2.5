import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import OrderConfirmationEmail from '../../../components/emails/OrderConfirmation';
import AdminOrderNotificationEmail from '../../../components/emails/AdminOrderNotification';
import { hasEmailWebhookSecret, isAdminRequest, unauthorized } from '../../../lib/apiAuth';

const resendApiKey = process.env.RESEND_API_KEY || 're_placeholder';
const resend = new Resend(resendApiKey);

// Correo de la tienda que recibe el aviso de cada nueva compra
const ADMIN_NOTIFICATION_EMAIL =
    process.env.ADMIN_NOTIFICATION_EMAIL || 'hdehelenamx@gmail.com';

export async function POST(req: Request) {
    // Solo el webhook de Stripe (con la clave compartida) o un admin con sesión
    const fromWebhook = hasEmailWebhookSecret(req);
    if (!fromWebhook && !(await isAdminRequest(req))) return unauthorized();

    try {
        const body = await req.json();
        const {
            email,
            customerName,
            orderId,
            notifyAdmin,
            customerPhone,
            totalAmount,
            items,
            shippingAddress,
        } = body;

        if (!email || !orderId) {
            return NextResponse.json(
                { error: 'Email y orderId son requeridos' },
                { status: 400 }
            );
        }

        const { data, error } = await resend.emails.send({
            from: 'H de Helena <pedidos@hdehelena.com>',
            to: [email],
            subject: `¡Hemos recibido tu pedido #${orderId.slice(0, 8)}!`,
            react: OrderConfirmationEmail({
                customerName: customerName || 'Cliente',
                orderId,
            }),
        });

        // Aviso interno de nueva compra (lo pide el webhook de Stripe, o un admin
        // desde el botón "Reset (Test)"). Si falla, no bloquea la confirmación al cliente.
        let adminNotified = false;
        if (notifyAdmin) {
            try {
                const { error: adminError } = await resend.emails.send({
                    from: 'H de Helena <pedidos@hdehelena.com>',
                    to: [ADMIN_NOTIFICATION_EMAIL],
                    replyTo: email,
                    subject: `🛍️ Nueva compra #${orderId.slice(0, 8)} - ${customerName || 'Cliente'}`,
                    react: AdminOrderNotificationEmail({
                        orderId,
                        customerName: customerName || 'Cliente',
                        customerEmail: email,
                        customerPhone,
                        totalAmount,
                        items: Array.isArray(items) ? items : [],
                        shippingAddress,
                    }),
                });
                if (adminError) {
                    console.error('Error de Resend al avisar a la tienda:', adminError);
                } else {
                    adminNotified = true;
                }
            } catch (adminErr) {
                console.error('Error enviando aviso de compra a la tienda:', adminErr);
            }
        }

        if (error) {
            console.error('Error de Resend al confirmar compra:', error);
            return NextResponse.json({ error: error.message, adminNotified }, { status: 400 });
        }

        return NextResponse.json({ success: true, data, adminNotified });
    } catch (error: any) {
        console.error('Error enviando email de confirmación de compra:', error);
        return NextResponse.json(
            { error: error.message || 'Hubo un error al enviar el correo.' },
            { status: 500 }
        );
    }
}
