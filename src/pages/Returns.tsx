import SEO from '../components/SEO';
import { RefreshCw, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

export default function Returns() {
    return (
        <div className="min-h-screen bg-white">
            <SEO title="Devoluciones y Cambios" description="Política de devoluciones y cambios de H de Helena." url="/returns" />

            {/* Header Section */}
            <section className="relative pt-32 pb-12 lg:pt-40 lg:pb-16 bg-gradient-to-br from-pale-pink via-white to-pale-pink overflow-hidden">
                <div className="absolute inset-0 opacity-5">
                    <div className="absolute top-10 left-10 w-72 h-72 bg-charcoal rounded-full blur-3xl"></div>
                    <div className="absolute bottom-10 right-10 w-96 h-96 bg-warm-gray rounded-full blur-3xl"></div>
                </div>

                <div className="relative max-w-7xl mx-auto px-6 lg:px-8 text-center">
                    <h1 className="font-serif font-light text-5xl lg:text-7xl text-charcoal mb-6">
                        Devoluciones y Cambios
                    </h1>
                    <p className="text-xl text-warm-gray font-light max-w-2xl mx-auto">
                        Tu satisfacción es nuestra prioridad. Hacemos el proceso fácil y transparente.
                    </p>
                </div>
            </section>

            {/* Content Section */}
            <section className="py-16 lg:py-24">
                <div className="max-w-4xl mx-auto px-6 lg:px-8">

                    {/* Steps */}
                    <div className="mb-20">
                        <h2 className="font-serif text-3xl text-charcoal mb-10 text-center">¿Cómo realizar una devolución?</h2>
                        <div className="grid md:grid-cols-3 gap-8">
                            <div className="text-center p-6">
                                <div className="w-16 h-16 bg-cream rounded-full flex items-center justify-center mx-auto mb-4 text-charcoal font-serif text-2xl border border-warm-gray/20">1</div>
                                <h3 className="font-medium text-lg text-charcoal mb-2">Solicita la devolución</h3>
                                <p className="text-warm-gray font-light text-sm">Escríbenos a devoluciones@hdehelena.com con tu número de pedido.</p>
                            </div>
                            <div className="text-center p-6">
                                <div className="w-16 h-16 bg-cream rounded-full flex items-center justify-center mx-auto mb-4 text-charcoal font-serif text-2xl border border-warm-gray/20">2</div>
                                <h3 className="font-medium text-lg text-charcoal mb-2">Prepara el paquete</h3>
                                <p className="text-warm-gray font-light text-sm">Empaqueta los artículos en su caja original y pega la etiqueta que te enviaremos.</p>
                            </div>
                            <div className="text-center p-6">
                                <div className="w-16 h-16 bg-cream rounded-full flex items-center justify-center mx-auto mb-4 text-charcoal font-serif text-2xl border border-warm-gray/20">3</div>
                                <h3 className="font-medium text-lg text-charcoal mb-2">Recibe tu reembolso</h3>
                                <p className="text-warm-gray font-light text-sm">Una vez recibido y verificado, procesaremos tu reembolso en 3-5 días hábiles.</p>
                            </div>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-12">
                        {/* Conditions */}
                        <div className="bg-white border border-warm-gray/20 rounded-xl p-8 shadow-sm">
                            <div className="flex items-center gap-3 mb-6">
                                <CheckCircle className="text-green-600" size={24} />
                                <h3 className="font-serif text-xl text-charcoal">Condiciones Aceptadas</h3>
                            </div>
                            <ul className="space-y-4 text-warm-gray font-light">
                                <li className="flex items-start gap-3">
                                    <span className="w-1.5 h-1.5 rounded-full bg-warm-gray mt-2 flex-shrink-0"></span>
                                    <span>Devolución dentro de los 30 días posteriores a la recepción.</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="w-1.5 h-1.5 rounded-full bg-warm-gray mt-2 flex-shrink-0"></span>
                                    <span>Productos sin usar, sin lavar y con todas las etiquetas originales.</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="w-1.5 h-1.5 rounded-full bg-warm-gray mt-2 flex-shrink-0"></span>
                                    <span>En su embalaje original (caja de zapatos, bolsa de tela, etc.).</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="w-1.5 h-1.5 rounded-full bg-warm-gray mt-2 flex-shrink-0"></span>
                                    <span>Prueba los zapatos sobre una alfombra para no dañar la suela.</span>
                                </li>
                            </ul>
                        </div>

                        {/* Not Accepted */}
                        <div className="bg-white border border-warm-gray/20 rounded-xl p-8 shadow-sm">
                            <div className="flex items-center gap-3 mb-6">
                                <XCircle className="text-red-500" size={24} />
                                <h3 className="font-serif text-xl text-charcoal">No Aceptamos</h3>
                            </div>
                            <ul className="space-y-4 text-warm-gray font-light">
                                <li className="flex items-start gap-3">
                                    <span className="w-1.5 h-1.5 rounded-full bg-warm-gray mt-2 flex-shrink-0"></span>
                                    <span>Productos con signos evidentes de uso o desgaste.</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="w-1.5 h-1.5 rounded-full bg-warm-gray mt-2 flex-shrink-0"></span>
                                    <span>Suelas marcadas o rayadas.</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="w-1.5 h-1.5 rounded-full bg-warm-gray mt-2 flex-shrink-0"></span>
                                    <span>Artículos personalizados o hechos a medida (salvo defecto).</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="w-1.5 h-1.5 rounded-full bg-warm-gray mt-2 flex-shrink-0"></span>
                                    <span>Devoluciones fuera del plazo de 30 días.</span>
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* Change Policy */}
                    <div className="mt-16 bg-cream/30 rounded-xl p-8 border border-warm-gray/10 flex gap-6 items-start">
                        <RefreshCw className="text-charcoal flex-shrink-0 mt-1" size={28} />
                        <div>
                            <h3 className="font-serif text-xl text-charcoal mb-3">¿Necesitas un cambio de talla?</h3>
                            <p className="text-warm-gray font-light leading-relaxed">
                                Si la talla no es la correcta, el primer cambio es <strong>gratuito</strong> (solo península). Simplemente solicita una devolución y especifica que deseas un cambio de talla. Te enviaremos el nuevo par tan pronto recibamos el original.
                            </p>
                        </div>
                    </div>

                    <div className="mt-8 flex gap-6 items-start p-4">
                        <AlertCircle className="text-warm-gray flex-shrink-0 mt-1" size={20} />
                        <p className="text-sm text-warm-gray/80 font-light">
                            Nota: H de Helena se reserva el derecho de rechazar devoluciones que no cumplan con las condiciones mencionadas anteriormente.
                        </p>
                    </div>

                </div>
            </section>
        </div>
    );
}
