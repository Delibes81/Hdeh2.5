'use client';
import { Lock, Eye, FileText, Database } from 'lucide-react';

export default function Privacy() {
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
                        Política de Privacidad
                    </h1>
                    <p className="text-xl text-warm-gray font-light max-w-2xl mx-auto">
                        Tu confianza es lo más importante para nosotros.
                    </p>
                </div>
            </section>

            {/* Content Section */}
            <section className="py-16 lg:py-24">
                <div className="max-w-4xl mx-auto px-6 lg:px-8">

                    <div className="bg-white border border-warm-gray/10 rounded-xl p-8 lg:p-12 shadow-sm space-y-12">

                        {/* Intro */}
                        <div>
                            <h2 className="font-serif text-2xl text-charcoal mb-4 flex items-center gap-3">
                                <Lock className="text-warm-gray" size={24} strokeWidth={1.5} />
                                Introducción
                            </h2>
                            <p className="text-warm-gray font-light leading-relaxed">
                                En H de Helena, nos comprometemos a proteger y respetar tu privacidad. Esta política explica cómo recopilamos, utilizamos y custodiamos tu información personal cuando visitas nuestro sitio web o realizas una compra.
                            </p>
                        </div>

                        {/* Data Collection */}
                        <div>
                            <h2 className="font-serif text-2xl text-charcoal mb-4 flex items-center gap-3">
                                <Database className="text-warm-gray" size={24} strokeWidth={1.5} />
                                Información que Recopilamos
                            </h2>
                            <ul className="list-disc list-inside text-warm-gray font-light space-y-2 ml-2">
                                <li>Información de contacto (nombre, email, teléfono).</li>
                                <li>Dirección de envío y facturación.</li>
                                <li>Información de pago (procesada de forma segura por Stripe, no almacenamos estos datos).</li>
                                <li>Historial de pedidos y preferencias de compra.</li>
                                <li>Datos de navegación (cookies, dirección IP) para mejorar tu experiencia.</li>
                            </ul>
                        </div>

                        {/* Data Usage */}
                        <div>
                            <h2 className="font-serif text-2xl text-charcoal mb-4 flex items-center gap-3">
                                <Eye className="text-warm-gray" size={24} strokeWidth={1.5} />
                                Uso de la Información
                            </h2>
                            <p className="text-warm-gray font-light leading-relaxed mb-4">
                                Utilizamos tus datos principalmente para:
                            </p>
                            <ul className="list-disc list-inside text-warm-gray font-light space-y-2 ml-2">
                                <li>Procesar y enviar tus pedidos.</li>
                                <li>Enviarte actualizaciones sobre el estado de tu compra.</li>
                                <li>Responder a tus consultas de atención al cliente.</li>
                                <li>Enviarte novedades y promociones (solo si has dado tu consentimiento).</li>
                                <li>Mejorar nuestro sitio web y prevenir fraudes.</li>
                            </ul>
                        </div>

                        {/* Your Rights */}
                        <div>
                            <h2 className="font-serif text-2xl text-charcoal mb-4 flex items-center gap-3">
                                <FileText className="text-warm-gray" size={24} strokeWidth={1.5} />
                                Tus Derechos
                            </h2>
                            <p className="text-warm-gray font-light leading-relaxed">
                                Tienes derecho a acceder, rectificar o eliminar tus datos personales en cualquier momento. También puedes oponerte al procesamiento de tus datos o retirar tu consentimiento para comunicaciones de marketing. Para ejercer estos derechos, contáctanos en <a href="mailto:privacidad@hdehelena.com" className="text-charcoal underline hover:text-warm-gray transition-colors">privacidad@hdehelena.com</a>.
                            </p>
                        </div>

                        <div className="pt-8 border-t border-warm-gray/10 text-sm text-warm-gray/60 font-light">
                            Última actualización: Febrero 2026
                        </div>

                    </div>

                </div>
            </section>
        </div>
    );
}
