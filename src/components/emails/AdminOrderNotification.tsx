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

export interface AdminOrderItem {
  description: string;
  quantity: number;
}

export interface AdminShippingAddress {
  name?: string;
  address?: {
    line1?: string | null;
    line2?: string | null;
    city?: string | null;
    state?: string | null;
    postal_code?: string | null;
    country?: string | null;
  } | null;
}

interface AdminOrderNotificationProps {
  orderId: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string | null;
  totalAmount?: number | null;
  items?: AdminOrderItem[];
  shippingAddress?: AdminShippingAddress | null;
}

const formatMoney = (amount: number) =>
  new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(amount);

const formatAddress = (shipping?: AdminShippingAddress | null) => {
  const a = shipping?.address;
  if (!a) return null;
  return [a.line1, a.line2, [a.postal_code, a.city].filter(Boolean).join(' '), a.state, a.country]
    .filter(Boolean)
    .join(', ');
};

export const AdminOrderNotificationEmail = ({
  orderId,
  customerName,
  customerEmail,
  customerPhone,
  totalAmount,
  items = [],
  shippingAddress,
}: AdminOrderNotificationProps) => {
  const address = formatAddress(shippingAddress);

  return (
    <Html>
      <Head />
      <Preview>Nueva compra #{orderId.slice(0, 8)} de {customerName}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Nueva compra recibida</Heading>
          <Text style={text}>
            Se registró un nuevo pedido pagado en la tienda: <strong>#{orderId.slice(0, 8)}</strong>
          </Text>

          <Section style={infoSection}>
            <Text style={infoText}><strong>Cliente:</strong> {customerName}</Text>
            <Text style={infoText}><strong>Correo:</strong> {customerEmail}</Text>
            {customerPhone ? (
              <Text style={infoText}><strong>Teléfono:</strong> {customerPhone}</Text>
            ) : null}
            {address ? (
              <Text style={infoText}><strong>Dirección de envío:</strong> {address}</Text>
            ) : null}
            {typeof totalAmount === 'number' ? (
              <Text style={infoText}><strong>Total:</strong> {formatMoney(totalAmount)}</Text>
            ) : null}
          </Section>

          {items.length > 0 ? (
            <Section>
              <Text style={{ ...text, fontWeight: 'bold' }}>Productos</Text>
              {items.map((item, i) => (
                <Text key={i} style={itemText}>
                  {item.quantity} × {item.description}
                </Text>
              ))}
            </Section>
          ) : null}

          <Hr style={hr} />
          <Text style={footer}>
            ID completo del pedido: {orderId}
            <br />
            Revisa los detalles en el panel de administración.
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

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

const itemText = {
  margin: '0 0 6px',
  fontSize: '14px',
  color: '#52525b',
};

const infoSection = {
  backgroundColor: '#f4f4f5',
  padding: '24px',
  borderRadius: '4px',
  border: '1px solid #e4e4e7',
  margin: '24px 0',
};

const infoText = {
  margin: '0 0 10px',
  fontSize: '14px',
  color: '#52525b',
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

export default AdminOrderNotificationEmail;
