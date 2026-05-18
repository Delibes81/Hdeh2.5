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

interface PreparingShippingProps {
  customerName: string;
  orderId: string;
}

export const PreparingShippingEmail = ({
  customerName,
  orderId,
}: PreparingShippingProps) => (
  <Html>
    <Head />
    <Preview>¡Tu paquete de H de Helena se está preparando!</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>¡Hola, {customerName}!</Heading>
        <Text style={text}>
          Tenemos excelentes noticias: tus zapatos de la orden <strong>#{orderId.slice(0, 8)}</strong> ya están listos y se encuentran <strong>en proceso de empaque</strong> en nuestro almacén.
        </Text>
        
        <Section style={infoSection}>
          <Text style={infoText}>
            Estamos revisando que cada detalle esté perfecto antes de que emprendan su viaje hacia ti.
          </Text>
          <Text style={infoText}>
            Muy pronto recibirás otro correo con el número de rastreo de tu paquete para que puedas seguir su recorrido.
          </Text>
        </Section>

        <Text style={text}>
          ¡Ya casi están contigo!
        </Text>

        <Hr style={hr} />
        <Text style={footer}>
          Si tienes alguna pregunta sobre tu pedido, por favor contáctanos respondiendo a este correo o vía WhatsApp.
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
  backgroundColor: '#fff7ed', // Un tono naranja muy sutil
  padding: '24px',
  borderRadius: '4px',
  border: '1px solid #ffedd5',
  margin: '24px 0',
};

const infoText = {
  margin: '0 0 10px',
  fontSize: '14px',
  color: '#c2410c', // Texto naranja cálido
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

export default PreparingShippingEmail;
