'use client';
import { Scale, FileCheck, ShieldCheck, CreditCard } from 'lucide-react';

export default function Terms() {
    return (
        <div className="min-h-screen bg-white">

            {/* Header Section */}
            <section className="relative pt-32 pb-12 lg:pt-40 lg:pb-16 bg-gradient-to-br from-pale-pink via-white to-pale-pink overflow-hidden">
                <div className="absolute inset-0 opacity-5">
                    <div className="absolute top-10 left-10 w-72 h-72 bg-charcoal rounded-full blur-3xl"></div>
                    <div className="absolute bottom-10 right-10 w-96 h-96 bg-warm-gray rounded-full blur-3xl"></div>
                </div>

                <div className="relative max-w-7xl mx-auto px-6 lg:px-8 text-center">
                    <h1 className="font-serif font-light text-5xl lg:text-7xl text-charcoal mb-6">
                        Términos y Condiciones
                    </h1>
                    <p className="text-xl text-warm-gray font-sans lowercase font-light max-w-2xl mx-auto">
                        Por favor, lee atentamente nuestras condiciones de uso.
                    </p>
                </div>
            </section>

            {/* Content Section */}
            <section className="py-16 lg:py-24">
                <div className="max-w-4xl mx-auto px-6 lg:px-8">

                    <div className="space-y-16">

                        {/* Section 1 */}
                        <div className="flex gap-6">
                            <div className="w-12 h-12 bg-cream/50 rounded-full flex items-center justify-center shrink-0 text-charcoal">
                                <Scale size={24} strokeWidth={1.5} />
                            </div>
                            <div>
                                <h2 className="font-serif text-2xl text-charcoal mb-4">1. Ámbito de Aplicación</h2>
                                <p className="text-warm-gray font-sans lowercase font-light leading-relaxed">
                                    Estas condiciones generales de venta se aplican a todas las ventas realizadas a través del sitio web H de Helena. Al realizar un pedido, aceptas estas condiciones sin reservas. Nos reservamos el derecho de modificar estos términos en cualquier momento.
                                </p>
                            </div>
                        </div>

                        {/* Section 2 */}
                        <div className="flex gap-6">
                            <div className="w-12 h-12 bg-cream/50 rounded-full flex items-center justify-center shrink-0 text-charcoal">
                                <FileCheck size={24} strokeWidth={1.5} />
                            </div>
                            <div>
                                <h2 className="font-serif text-2xl text-charcoal mb-4">2. Productos y Disponibilidad</h2>
                                <p className="text-warm-gray font-sans lowercase font-light leading-relaxed">
                                    Nuestros productos son artesanales y pueden presentar ligeras variaciones respecto a las fotografías. Nos esforzamos por mostrar los colores y texturas con la mayor precisión posible. La disponibilidad de los productos se indica en tiempo real, pero en caso de error de stock, te contactaremos para ofrecerte una solución o reembolso.
                                </p>
                            </div>
                        </div>

                        {/* Section 3 */}
                        <div className="flex gap-6">
                            <div className="w-12 h-12 bg-cream/50 rounded-full flex items-center justify-center shrink-0 text-charcoal">
                                <CreditCard size={24} strokeWidth={1.5} />
                            </div>
                            <div>
                                <h2 className="font-serif text-2xl text-charcoal mb-4">3. Precios y Pagos</h2>
                                <p className="text-warm-gray font-sans lowercase font-light leading-relaxed">
                                    Los precios se muestran en Pesos Mexicanos (MXN) e incluyen el IVA aplicable. Los gastos de envío se añaden al final del pedido. El pago se realiza de forma segura a través de Stripe, líder mundial en pagos online. Tus datos bancarios son encriptados y nunca se almacenan en nuestros servidores.
                                </p>
                            </div>
                        </div>

                        {/* Section 4 */}
                        <div className="flex gap-6">
                            <div className="w-12 h-12 bg-cream/50 rounded-full flex items-center justify-center shrink-0 text-charcoal">
                                <ShieldCheck size={24} strokeWidth={1.5} />
                            </div>
                            <div>
                                <h2 className="font-serif text-2xl text-charcoal mb-4">4. Garantía y Responsabilidad</h2>
                                <p className="text-warm-gray font-sans lowercase font-light leading-relaxed">
                                    Todos nuestros productos cuentan con la garantía legal de conformidad. H de Helena no se hace responsable de los daños resultantes del mal uso de los productos o del incumplimiento de las instrucciones de cuidado proporcionadas.
                                </p>
                            </div>
                        </div>

                        {/* Section 5 */}
                        <div className="flex gap-6">
                            <div className="w-12 h-12 bg-cream/50 rounded-full flex items-center justify-center shrink-0 text-charcoal">
                                <Scale size={24} strokeWidth={1.5} />
                            </div>
                            <div>
                                <h2 className="font-serif text-2xl text-charcoal mb-4">5. Ley Aplicable</h2>
                                <p className="text-warm-gray font-sans lowercase font-light leading-relaxed">
                                    Estas condiciones se rigen por las leyes de México. En caso de litigio, las partes se someten a la jurisdicción de los tribunales de la Ciudad de México, renunciando a cualquier otro fuero que pudiera corresponderles.
                                </p>
                            </div>
                        </div>

                    </div>

                </div>
            </section>
        </div>
    );
}
