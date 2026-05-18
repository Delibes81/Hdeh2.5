import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import ProductionConfirmationEmail from '../../../components/emails/ProductionConfirmation';

// Utilizamos la variable de entorno para la API Key de Resend
const resend = new Resend(process.env.RESEND_API_KEY || 're_placeholder');

export async function POST(request: Request) {
    try {
        const { email, customerName, orderId } = await request.json();

        if (!email || !orderId) {
            return NextResponse.json(
                { error: 'Faltan parámetros requeridos (email, orderId)' },
                { status: 400 }
            );
        }

        const data = await resend.emails.send({
            from: 'H de Helena <pedidos@hdehelena.com>',
            to: [email],
            subject: `¡Tu pedido #${orderId.slice(0, 8)} está en fabricación!`,
            react: ProductionConfirmationEmail({
                customerName: customerName || 'Cliente',
                orderId,
            }),
        });

        return NextResponse.json({ success: true, data });
    } catch (error: any) {
        console.error('Error enviando email de fabricación:', error);
        return NextResponse.json(
            { error: error.message || 'Hubo un error al enviar el correo.' },
            { status: 500 }
        );
    }
}
