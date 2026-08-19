# Reporte Técnico del Proyecto: H de Helena

## 1. Resumen Ejecutivo
**H de Helena** es una plataforma de comercio electrónico moderna, rápida y elegante diseñada para la venta exclusiva de zapatos de piel artesanales. El proyecto integra un diseño visual premium y minimalista con una arquitectura técnica robusta. Recientemente, la plataforma fue migrada a la arquitectura App Router de Next.js, facilitando una experiencia de compra fluida para los clientes, una optimización superior para motores de búsqueda (SEO) y una gestión eficiente para los administradores.

El sistema permite a los usuarios explorar colecciones, solicitar productos "sobre pedido" vía WhatsApp, gestionar un carrito de compras y realizar pagos seguros mediante Stripe. Para la administración, cuenta con un panel de control protegido que permite la gestión de inventario, cupones de descuento, monitoreo de ventas y actualización de contenidos en tiempo real.

## 2. Pila Tecnológica (Tech Stack)

### Frontend (Cliente y Renderizado de Servidor)
*   **Framework**: Next.js 14+ (App Router)
*   **Librería UI**: React 19
*   **Lenguaje**: TypeScript (Tipado estático estricto)
*   **Estilos**: Tailwind CSS (Diseño responsivo y utilitario) con PostCSS
*   **Iconografía**: Lucide React
*   **Gráficos Analíticos**: Recharts (Para analíticas en el dashboard)
*   **SEO**: Metadatos nativos de Next.js y Sitemap dinámico (`sitemap.xml`)

### Backend & Servicios
*   **Base de Datos & Auth**: Supabase (PostgreSQL)
    *   Gestión de administradores y autenticación
    *   Almacenamiento de datos (Productos, Órdenes, Variantes/Inventario, Cupones)
    *   Row Level Security (RLS) para proteger las transacciones
    *   Supabase Storage para alojamiento de imágenes optimizado
*   **Pagos**: Stripe (Integrado vía Supabase Edge Functions / API Routes)
*   **Despliegue (Hosting)**: Vercel, conectado directamente al dominio oficial `https://hdehelena.com`

## 3. Arquitectura del Proyecto

El proyecto sigue una estructura modular dentro del directorio `src`:

*   **`app/`**: Sistema de enrutamiento principal (App Router).
    *   `page.tsx`: Página de inicio con secciones destacadas ("Filosofía", "Hecho a Mano").
    *   `shop/`: Catálogo completo con filtros por categoría y vista detallada de producto.
    *   `admin/`: Panel de control protegido (`Login`, `Dashboard`, `ProductList`, `OrderList`, `CouponManager`).
    *   `success/`: Confirmación post-compra.
    *   Páginas estáticas de información (`faq/`, `shipping/`, `returns/`, `care/`, etc.).
*   **`components/`**: Bloques de interfaz reutilizables (Botones, Modales, Tarjetas de producto, Navegación).
*   **`hooks/`**: Lógica de negocio encapsulada y estado global (`useCart`, `useProducts`).
*   **`lib/`**: Configuraciones de clientes externos (`supabase.ts`).
*   **`utils/`**: Funciones auxiliares (`format.ts` para precios, slugs, fechas).

## 4. Funcionalidades Clave

### Para el Cliente Final
1.  **Exploración Visual**: Página de inicio impactante con animaciones "reveal on scroll" y fotografía de alta calidad.
2.  **Catálogo Organizado**: Filtrado por categorías (Zapatos Bajos, Altos, Botas).
3.  **Detalle de Producto**: Vista rápida y detallada con selección de tallas.
4.  **Pedidos Personalizados (Made to Order)**: 
    *   Detección de productos "Bajo pedido" o sin stock inmediato.
    *   Redirección a WhatsApp con mensajes pre-cargados que incluyen nombre y talla.
5.  **Carrito de Compras**:
    *   Persistencia de sesión.
    *   Modificación de cantidades y límite de stock en tiempo real.
6.  **Checkout Seguro**: Integración transparente con Stripe Checkout y soporte para códigos de descuento.

### Para el Administrador
1.  **Panel de Control (Dashboard)**:
    *   Métricas clave: Ventas totales, órdenes pendientes, ticket promedio.
    *   Gráficos visuales de tendencia de ventas (Recharts).
    *   Alertas de bajo stock.
2.  **Gestión de Productos e Inventario**:
    *   Crear, editar y ocultar/mostrar productos.
    *   Control específico de stock por talla (variantes).
    *   Subida de múltiples imágenes por modelo.
3.  **Gestión de Cupones**: Creación de códigos promocionales con límite de fechas y tipos de descuento.
4.  **Gestión de Órdenes**: Seguimiento y actualización del estado de los pedidos (pagado, enviado, etc.).

## 5. Estado Actual y Mejoras Recientes

El proyecto ha completado exitosamente su refactorización principal hacia Next.js.
*   **Migración a Next.js**: Rendimiento superior, eliminación de errores de hidratación y enrutamiento nativo más rápido.
*   **Optimización SEO Avanzada**: Implementación de metadatos robustos (`Metadata` API) en layouts y páginas, además de un `sitemap.xml` para indexación profunda.
*   **Diseño Adaptativo (Responsive)**: Correcciones en la interfaz móvil para asegurar que botones, navegación y gráficas se comporten correctamente en cualquier pantalla.
*   **Seguridad**: Políticas RLS (Row Level Security) estrictas en la base de datos para garantizar la privacidad de datos.

## 6. Recomendaciones y Próximos Pasos

Para la entrega final o evolución del producto:
1.  **Analítica web**: Conectar Google Analytics 4 (GA4) o Vercel Analytics para medir tráfico y conversiones.
2.  **Emails Transaccionales**: Configurar envío de correos automáticos (Ej. vía Resend o SendGrid) para enviar comprobantes y números de rastreo.
3.  **Testing E2E**: Implementar pruebas automáticas (Ej. Cypress o Playwright) para el flujo de pago crítico.
