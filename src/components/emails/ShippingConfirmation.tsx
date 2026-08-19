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

interface ShippingConfirmationProps {
  customerName: string;
  orderId: string;
  trackingNumber: string;
  carrier?: string;
}

export const ShippingConfirmationEmail = ({
  customerName,
  orderId,
  trackingNumber,
  carrier = 'Estafeta / FedEx',
}: ShippingConfirmationProps) => (
  <Html>
    <Head />
    <Preview>¡Tu pedido de H de Helena va en camino!</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>¡Buenas noticias, {customerName}!</Heading>
        <Text style={text}>
          Tu pedido <strong>#{orderId.slice(0, 8)}</strong> ya ha sido procesado y está en camino.
        </Text>
        
        <Section style={trackingSection}>
          <Text style={trackingText}>
            <strong>Paquetería:</strong> {carrier}
          </Text>
          <Text style={trackingText}>
            <strong>Número de rastreo:</strong> {trackingNumber}
          </Text>
        </Section>

        <Text style={text}>
          Puedes usar este número de rastreo en la página oficial de la paquetería para seguir el viaje de tus nuevos zapatos.
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

const trackingSection = {
  backgroundColor: '#fafafa',
  padding: '24px',
  borderRadius: '4px',
  border: '1px solid #eaeaea',
  margin: '24px 0',
};

const trackingText = {
  margin: '0 0 10px',
  fontSize: '14px',
  color: '#1c1917',
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

export default ShippingConfirmationEmail;
