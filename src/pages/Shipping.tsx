import SEO from '../components/SEO';
import { Truck, Globe, Clock, Package } from 'lucide-react';

export default function Shipping() {
    return (
        <div className="min-h-screen bg-white">
            <SEO title="Envíos y Entregas" description="Información sobre nuestros métodos de envío, tiempos y costos." url="/shipping" />

            {/* Header Section */}
            <section className="relative pt-32 pb-12 lg:pt-40 lg:pb-16 bg-gradient-to-br from-pale-pink via-white to-pale-pink overflow-hidden">
                <div className="absolute inset-0 opacity-5">
                    <div className="absolute top-10 left-10 w-72 h-72 bg-charcoal rounded-full blur-3xl"></div>
                    <div className="absolute bottom-10 right-10 w-96 h-96 bg-warm-gray rounded-full blur-3xl"></div>
                </div>

                <div className="relative max-w-7xl mx-auto px-6 lg:px-8 text-center">
                    <h1 className="font-serif font-light text-5xl lg:text-7xl text-charcoal mb-6">
                        Envíos y Entregas
                    </h1>
                    <p className="text-xl text-warm-gray font-light max-w-2xl mx-auto">
                        llevamos la artesanía directamente a tu puerta
                    </p>
                </div>
            </section>

            {/* Content Section */}
            <section className="py-16 lg:py-24">
                <div className="max-w-4xl mx-auto px-6 lg:px-8">

                    {/* Features Grid */}
                    <div className="grid md:grid-cols-2 gap-8 mb-16">
                        <div className="bg-cream/30 p-8 rounded-xl border border-warm-gray/10">
                            <Truck className="text-charcoal mb-4" size={32} strokeWidth={1} />
                            <h3 className="font-serif text-xl text-charcoal mb-2">Envíos Nacionales</h3>
                            <p className="text-warm-gray font-light">
                                Gratis en compras superiores a $2,500 MXN. Para pedidos menores, el costo es de $150 MXN.
                            </p>
                        </div>
                        <div className="bg-cream/30 p-8 rounded-xl border border-warm-gray/10">
                            <Globe className="text-charcoal mb-4" size={32} strokeWidth={1} />
                            <h3 className="font-serif text-xl text-charcoal mb-2">Envíos Internacionales</h3>
                            <p className="text-warm-gray font-light">
                                Realizamos envíos a todo el mundo. Los costos se calculan al checkout.
                            </p>
                        </div>
                        <div className="bg-cream/30 p-8 rounded-xl border border-warm-gray/10">
                            <Clock className="text-charcoal mb-4" size={32} strokeWidth={1} />
                            <h3 className="font-serif text-xl text-charcoal mb-2">Tiempos de Entrega</h3>
                            <p className="text-warm-gray font-light">
                                Nacionales: 3-5 días hábiles.<br />
                                Estados Unidos y Canadá: 5-7 días hábiles.<br />
                                Resto del Mundo: 7-14 días hábiles.
                            </p>
                        </div>
                        <div className="bg-cream/30 p-8 rounded-xl border border-warm-gray/10">
                            <Package className="text-charcoal mb-4" size={32} strokeWidth={1} />
                            <h3 className="font-serif text-xl text-charcoal mb-2">Seguimiento</h3>
                            <p className="text-warm-gray font-light">
                                Recibirás un email con tu código de seguimiento en cuanto tu pedido salga de nuestro taller.
                            </p>
                        </div>
                    </div>

                    {/* Detailed Info */}
                    <div className="space-y-12 text-lg font-light text-warm-gray leading-relaxed">
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
