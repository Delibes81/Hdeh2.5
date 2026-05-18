import { Resend } from 'resend';

const resend = new Resend('re_GvgP7HfL_Gzqp3FTvNhLUtv2yNEfhmWDz');

async function test() {
  try {
    console.log('Intentando enviar correo de prueba...');
    const data = await resend.emails.send({
      from: 'H de Helena <pedidos@hdehelena.com>',
      to: ['conexiongraf@gmail.com'], // using the email from your git commit config
      subject: 'Prueba de Diagnóstico Resend',
      html: '<p>Este es un correo de prueba para verificar la conexión de Resend.</p>'
    });
    console.log('Respuesta de Resend:', data);
  } catch (error) {
    console.error('Error detectado:', error);
  }
}

test();
