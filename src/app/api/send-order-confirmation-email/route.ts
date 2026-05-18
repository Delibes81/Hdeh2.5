import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import OrderConfirmationEmail from '../../../components/emails/OrderConfirmation';

const resendApiKey = process.env.RESEND_API_KEY || 're_placeholder';
const resend = new Resend(resendApiKey);

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { email, customerName, orderId } = body;

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

        if (error) {
            console.error('Error de Resend al confirmar compra:', error);
            return NextResponse.json({ error: error.message }, { status: 400 });
        }

        return NextResponse.json({ success: true, data });
    } catch (error: any) {
        console.error('Error enviando email de confirmación de compra:', error);
        return NextResponse.json(
            { error: error.message || 'Hubo un error al enviar el correo.' },
            { status: 500 }
        );
    }
}
