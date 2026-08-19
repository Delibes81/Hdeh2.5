import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import ShippingConfirmationEmail from '../../../components/emails/ShippingConfirmation';

// Utilizamos la variable de entorno para la API Key de Resend
const resend = new Resend(process.env.RESEND_API_KEY || 're_placeholder');

export async function POST(request: Request) {
    try {
        const { email, customerName, orderId, trackingNumber, carrier } = await request.json();

        if (!email || !orderId || !trackingNumber) {
            return NextResponse.json(
                { error: 'Faltan parámetros requeridos (email, orderId, trackingNumber)' },
                { status: 400 }
            );
        }

        const { data, error } = await resend.emails.send({
            from: 'H de Helena <pedidos@hdehelena.com>', // Debe ser un dominio verificado en Resend
            to: [email],
            subject: `¡Tu pedido #${orderId.slice(0, 8)} de H de Helena va en camino!`,
            react: ShippingConfirmationEmail({
                customerName: customerName || 'Cliente',
                orderId,
                trackingNumber,
                carrier,
            }),
        });

        if (error) {
            console.error('Error de Resend:', error);
            return NextResponse.json({ error: error.message }, { status: 400 });
        }

        return NextResponse.json({ success: true, data });
    } catch (error: any) {
        console.error('Error enviando email:', error);
        return NextResponse.json(
            { error: error.message || 'Hubo un error al enviar el correo.' },
            { status: 500 }
        );
    }
}
