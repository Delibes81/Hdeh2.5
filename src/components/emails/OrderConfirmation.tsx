import * as React from 'react';
import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components';

interface OrderConfirmationProps {
  customerName: string;
  orderId: string;
}

export const OrderConfirmationEmail = ({
  customerName,
  orderId,
}: OrderConfirmationProps) => (
  <Html>
    <Head />
    <Preview>¡Hemos recibido tu pedido de H de Helena!</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>¡Gracias por tu compra, {customerName}!</Heading>
        <Text style={text}>
          Queremos confirmarte que hemos recibido tu pago y tu orden <strong>#{orderId.slice(0, 8)}</strong> ha sido procesada con éxito.
        </Text>
        
        <Section style={infoSection}>
          <Text style={infoText}>
            A partir de este momento, nuestro equipo comenzará a trabajar en tu pedido con el mayor cuidado y dedicación.
          </Text>
          <Text style={infoText}>
            Te mantendremos al tanto de cada paso. Recibirás un correo cuando tus zapatos entren a fabricación y otro cuando vayan en camino.
          </Text>
        </Section>

        <Text style={text}>
          ¡Estamos emocionados de que pronto disfrutes tus H de Helena!
        </Text>

        <Hr style={hr} />
        <Text style={footer}>
          Si tienes alguna pregunta sobre tu pedido o necesitas realizar alguna modificación, por favor contáctanos respondiendo a este correo o vía WhatsApp lo antes posible.
          <br />
          <br />
          Con cariño,<br />
          El equipo de H de Helena
        </Text>
      </Container>
    </Body>
  </Html>
);

const main = {
  backgroundColor: '#f5f5f5',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const container = {
  margin: '0 auto',
  padding: '40px 20px',
  backgroundColor: '#ffffff',
  borderRadius: '8px',
  maxWidth: '600px',
  border: '1px solid #eaeaea',
};

const h1 = {
  color: '#1c1917',
  fontSize: '24px',
  fontWeight: '300',
  lineHeight: '40px',
  margin: '0 0 20px',
  fontFamily: 'Georgia, serif',
  textTransform: 'uppercase' as const,
};

const text = {
  color: '#444',
  fontSize: '14px',
  lineHeight: '24px',
};

const infoSection = {
  backgroundColor: '#f4f4f5', // Un tono gris/plata muy suave
  padding: '24px',
  borderRadius: '4px',
  border: '1px solid #e4e4e7',
  margin: '24px 0',
};

const infoText = {
  margin: '0 0 10px',
  fontSize: '14px',
  color: '#52525b', // Texto gris oxford
};

const hr = {
  borderColor: '#eaeaea',
  margin: '40px 0 20px',
};

const footer = {
  color: '#8898aa',
  fontSize: '12px',
  lineHeight: '16px',
};

export default OrderConfirmationEmail;
