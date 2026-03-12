import SEO from '../components/SEO';
import { Truck, Globe, Clock, Package } from 'lucide-react';

export default function Shipping() {
    return (
        <div className="min-h-screen bg-white">
            <SEO title="Envíos y Entregas" description="Información sobre nuestros métodos de envío, tiempos y costos." url="/shipping" />

            {/* Header Section */}
            <section className="relative pt-32 pb-6 lg:pt-40 lg:pb-8 bg-gradient-to-br from-pale-pink via-white to-pale-pink overflow-hidden">
                <div className="absolute inset-0 opacity-5">
                    <div className="absolute top-10 left-10 w-72 h-72 bg-charcoal rounded-full blur-3xl"></div>
                    <div className="absolute bottom-10 right-10 w-96 h-96 bg-warm-gray rounded-full blur-3xl"></div>
                </div>

                <div className="relative max-w-7xl mx-auto px-6 lg:px-8 text-center">
                    <h1 className="font-serif font-light text-5xl lg:text-7xl text-charcoal mb-3">
                        Envíos y Entregas
                    </h1>
                    <p className="text-xl text-warm-gray font-sans lowercase font-light max-w-2xl mx-auto">
                        Te llevamos la artesanía directamente a tu puerta
                    </p>
                </div>
            </section>

            {/* Content Section */}
            <section className="py-8 lg:pt-8 lg:pb-16">
                <div className="max-w-4xl mx-auto px-6 lg:px-8">

                    {/* Features Grid */}
                    <div className="grid md:grid-cols-2 gap-8 mb-12">
                        <div className="bg-cream/30 p-8 rounded-xl border border-warm-gray/10">
                            <Truck className="text-charcoal mb-4" size={32} strokeWidth={1} />
                            <h3 className="font-serif text-xl text-charcoal mb-2">Envíos Nacionales (Estándar)</h3>
                            <p className="text-warm-gray font-sans lowercase font-light mb-2">
                                Podemos realizar entregas en un rango de 3 a 5 días hábiles.
                            </p>
                            <p className="text-warm-gray font-sans lowercase font-medium">
                                *Dentro de CDMX y república mexicana: costo de envío gratis
                            </p>
                        </div>
                        <div className="bg-cream/30 p-8 rounded-xl border border-warm-gray/10">
                            <Clock className="text-charcoal mb-4" size={32} strokeWidth={1} />
                            <h3 className="font-serif text-xl text-charcoal mb-2">Envíos Express (Día siguiente)</h3>
                            <p className="text-warm-gray font-sans lowercase font-light mb-2">
                                Posible si hay stock disponible.
                            </p>
                            <ul className="text-warm-gray font-sans lowercase font-light list-disc pl-5">
                                <li>CDMX: $100.00 MXN</li>
                                <li>Afueras de CDMX o Foráneo (Rep. Mex.): $250.00 MXN</li>
                            </ul>
                        </div>
                        <div className="bg-cream/30 p-8 rounded-xl border border-warm-gray/10">
                            <Globe className="text-charcoal mb-4" size={32} strokeWidth={1} />
                            <h3 className="font-serif text-xl text-charcoal mb-2">Envíos Internacionales</h3>
                            <p className="text-warm-gray font-sans lowercase font-light">
                                Realizamos envíos a todo el mundo. Los costos y tiempos varían según el destino y si aplican tarifas arancelarias.
                            </p>
                        </div>
                        <div className="bg-cream/30 p-8 rounded-xl border border-warm-gray/10">
                            <Package className="text-charcoal mb-4" size={32} strokeWidth={1} />
                            <h3 className="font-serif text-xl text-charcoal mb-2">Seguimiento</h3>
                            <p className="text-warm-gray font-sans lowercase font-light">
                                Recibirás un email con tu código de seguimiento en cuanto tu pedido salga de nuestro taller.
                            </p>
                        </div>
                    </div>

                    {/* Detailed Info */}
                    <div className="space-y-12 text-lg font-sans lowercase font-light text-warm-gray leading-relaxed">
                        <div>
                            <h2 className="font-serif text-2xl text-charcoal mb-4">Procesamiento del Pedido</h2>
                            <p>
                                Todos nuestros pedidos son preparados con mucho cuidado en nuestro taller. Los pedidos realizados antes de las 13:00h (Hora Central) se procesan el mismo día. Los pedidos realizados después de esa hora, en fines de semana o festivos, se procesarán al siguiente día laborable.
                            </p>
                        </div>

                        <div>
                            <h2 className="font-serif text-2xl text-charcoal mb-4">Costos de Aduana</h2>
                            <p>
                                Para envíos fuera de México, es posible que se apliquen aranceles o impuestos de importación al llegar al país de destino. Estos costos corren por cuenta del cliente y varían según la legislación local.
                            </p>
                        </div>

                        <div>
                            <h2 className="font-serif text-2xl text-charcoal mb-4">Embalaje Sostenible</h2>
                            <p>
                                Nos preocupamos por el medio ambiente. Utilizamos materiales reciclados y reciclables en nuestros empaquetados, minimizando el uso de plásticos sin comprometer la protección de tu producto.
                            </p>
                        </div>
                    </div>

                </div>
            </section>
        </div>
    );
}
