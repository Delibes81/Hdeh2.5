'use client';
import { RefreshCw } from 'lucide-react';

export default function Returns() {
    return (
        <div className="min-h-screen bg-white">

            {/* Header Section */}
            <section className="relative pt-32 pb-6 lg:pt-40 lg:pb-8 bg-gradient-to-br from-pale-pink via-white to-pale-pink overflow-hidden">
                <div className="absolute inset-0 opacity-5">
                    <div className="absolute top-10 left-10 w-72 h-72 bg-charcoal rounded-full blur-3xl"></div>
                    <div className="absolute bottom-10 right-10 w-96 h-96 bg-warm-gray rounded-full blur-3xl"></div>
                </div>

                <div className="relative max-w-7xl mx-auto px-6 lg:px-8 text-center">
                    <h1 className="font-serif font-light text-5xl lg:text-7xl text-charcoal mb-3">
                        Cambios y devoluciones
                    </h1>
                    <p className="text-xl text-warm-gray font-sans lowercase font-light max-w-2xl mx-auto">
                        En H de Helena queremos que encuentres el ajuste perfecto.
                    </p>
                </div>
            </section>

            {/* Content Section */}
            <section className="py-8 lg:pt-8 lg:pb-16">
                <div className="max-w-4xl mx-auto px-6 lg:px-8">

                    <div className="bg-white border border-warm-gray/20 rounded-xl p-6 md:p-8 shadow-sm mb-8">
                        <ul className="space-y-6 text-warm-gray font-sans lowercase font-light leading-relaxed md:text-lg">
                            <li className="flex items-start gap-4">
                                <span className="w-2 h-2 rounded-full bg-charcoal mt-2.5 flex-shrink-0"></span>
                                <div>
                                    <p>
                                        Si la talla que elegiste no fue la correcta, cuentas con un plazo de <strong>30 días naturales</strong> a partir de la fecha de tu pedido para solicitar un <strong>cambio de talla</strong>, siempre que el par se entregue en perfectas condiciones, sin uso y en su empaque original.
                                    </p>
                                </div>
                            </li>
                            <li className="flex items-start gap-4">
                                <span className="w-2 h-2 rounded-full bg-charcoal mt-2.5 flex-shrink-0"></span>
                                <div>
                                    <p>
                                        Cada uno de nuestros pares es elaborado a mano en pequeñas producciones, cuidando cada detalle del proceso. Por esta razón, <strong>no realizamos devoluciones ni reembolsos</strong>.
                                    </p>
                                </div>
                            </li>
                            <li className="flex items-start gap-4">
                                <span className="w-2 h-2 rounded-full bg-charcoal mt-2.5 flex-shrink-0"></span>
                                <div>
                                    <p>
                                        Tampoco aplican cambios en pares únicos ni en modelos pre-order.
                                    </p>
                                </div>
                            </li>
                        </ul>

                        <div className="mt-10 pt-8 border-t border-warm-gray/10 text-warm-gray font-sans lowercase font-light md:text-lg">
                            <p>
                                Si necesitas apoyo para elegir tu talla o iniciar un cambio, estaremos encantados de ayudarte.
                            </p>
                        </div>
                    </div>

                    {/* Change Policy */}
                    <div className="mt-8 bg-cream/30 rounded-xl p-8 md:p-10 border border-warm-gray/10 flex flex-col md:flex-row gap-6 items-start">
                        <RefreshCw className="text-charcoal flex-shrink-0 mt-1" size={32} />
                        <div>
                            <h3 className="font-serif text-2xl text-charcoal mb-4">¿Necesitas un cambio de talla?</h3>
                            <p className="text-warm-gray font-sans lowercase font-light leading-relaxed md:text-lg">
                                Escríbenos a: <a href="mailto:HELP@hdehelena.com.mx" className="text-charcoal font-medium hover:underline">HELP@hdehelena.com.mx</a>, indícanos tu número de orden y el cambio que solicitas. Recibirás las instrucciones de nuestro equipo.
                            </p>
                        </div>
                    </div>

                </div>
            </section>
        </div>
    );
}
