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

interface ProductionConfirmationProps {
  customerName: string;
  orderId: string;
}

export const ProductionConfirmationEmail = ({
  customerName,
  orderId,
}: ProductionConfirmationProps) => (
  <Html>
    <Head />
    <Preview>¡Tu pedido de H de Helena está en fabricación!</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>¡Hola, {customerName}!</Heading>
        <Text style={text}>
          Queremos informarte que tu pedido <strong>#{orderId.slice(0, 8)}</strong> acaba de entrar a nuestro taller y ya se encuentra <strong>en proceso de fabricación</strong>.
        </Text>
        
        <Section style={infoSection}>
          <Text style={infoText}>
            Como sabes, este es un trabajo artesanal. El tiempo aproximado de fabricación es de 3 semanas.
          </Text>
          <Text style={infoText}>
            Te enviaremos un nuevo correo con tu número de rastreo en cuanto tus zapatos estén listos y vayan en camino hacia ti.
          </Text>
        </Section>

        <Text style={text}>
          Agradecemos muchísimo tu paciencia y tu confianza en nuestro trabajo.
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
  backgroundColor: '#f8f5f0',
  padding: '24px',
  borderRadius: '4px',
  border: '1px solid #eaddcf',
  margin: '24px 0',
};

const infoText = {
  margin: '0 0 10px',
  fontSize: '14px',
  color: '#8c7b5b',
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

export default ProductionConfirmationEmail;
