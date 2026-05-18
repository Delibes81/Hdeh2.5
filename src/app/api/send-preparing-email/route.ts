import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import PreparingShippingEmail from '../../../components/emails/PreparingShipping';

// Usamos un placeholder en build time o si la llave no está configurada, para no romper el compilador.
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
            subject: `¡Tu pedido #${orderId.slice(0, 8)} de H de Helena se está preparando!`,
            react: PreparingShippingEmail({
                customerName: customerName || 'Cliente',
                orderId,
            }),
        });

        if (error) {
            console.error('Error de Resend:', error);
            return NextResponse.json({ error: error.message }, { status: 400 });
        }

        return NextResponse.json({ success: true, data });
    } catch (error: any) {
        console.error('Error enviando email de preparación de envío:', error);
        return NextResponse.json(
            { error: error.message || 'Hubo un error al enviar el correo.' },
            { status: 500 }
        );
    }
}
