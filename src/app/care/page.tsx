'use client';
import SEO from '../../components/SEO';
import { Sparkles, Droplet, Sun, Shield } from 'lucide-react';

export default function Care() {
    return (
        <div className="min-h-screen bg-white">
            <SEO title="Cuidados y Mantenimiento" description="Guía para cuidar tus zapatos de piel y mantenerlos como nuevos." url="/care" />

            {/* Header Section */}
            <section className="relative pt-32 pb-12 lg:pt-40 lg:pb-16 bg-gradient-to-br from-pale-pink via-white to-pale-pink overflow-hidden">
                <div className="absolute inset-0 opacity-5">
                    <div className="absolute top-10 left-10 w-72 h-72 bg-charcoal rounded-full blur-3xl"></div>
                    <div className="absolute bottom-10 right-10 w-96 h-96 bg-warm-gray rounded-full blur-3xl"></div>
                </div>

                <div className="relative max-w-7xl mx-auto px-6 lg:px-8 text-center">
                    <h1 className="font-serif font-light text-5xl lg:text-7xl text-charcoal mb-6">
                        Cuidados y Mantenimiento
                    </h1>
                    <p className="text-xl text-warm-gray font-sans lowercase font-light max-w-2xl mx-auto">
                        La piel auténtica mejora con el tiempo si se cuida adecuadamente. Aquí te enseñamos cómo.
                    </p>
                </div>
            </section>

            {/* Content Section */}
            <section className="py-16 lg:py-24">
                <div className="max-w-4xl mx-auto px-6 lg:px-8">

                    {/* Intro Text */}
                    <div className="text-center mb-20 max-w-2xl mx-auto">
                        <p className="text-lg text-warm-gray font-sans lowercase font-light leading-relaxed">
                            Nuestros zapatos están hechos con pieles naturales seleccionadas. Es normal que presenten pequeñas variaciones de tono o textura; son marcas de autenticidad, no defectos. Para asegurar su longevidad, sigue estos consejos.
                        </p>
                    </div>

                    {/* Care Steps Grid */}
                    <div className="grid md:grid-cols-2 gap-12">
                        <div className="space-y-6">
                            <div className="flex gap-4">
                                <div className="w-12 h-12 bg-cream rounded-full flex items-center justify-center shrink-0">
                                    <Sparkles className="text-charcoal" size={20} />
                                </div>
                                <div>
                                    <h3 className="font-serif text-xl text-charcoal mb-2">Limpieza Regular</h3>
                                    <p className="text-warm-gray font-sans lowercase font-light leading-relaxed">
                                        Limpia el polvo y la suciedad después de cada uso con un paño de algodón suave y seco. Para manchas más persistentes, utiliza un paño ligeramente húmedo, pero nunca empapado.
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <div className="w-12 h-12 bg-cream rounded-full flex items-center justify-center shrink-0">
                                    <Droplet className="text-charcoal" size={20} />
                                </div>
                                <div>
                                    <h3 className="font-serif text-xl text-charcoal mb-2">Hidratación</h3>
                                    <p className="text-warm-gray font-sans lowercase font-light leading-relaxed">
                                        La piel necesita hidratarse. Aplica una crema incolora o cera específica para calzado de piel cada 15-20 usos. Esto mantendrá la flexibilidad y evitará grietas.
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <div className="w-12 h-12 bg-cream rounded-full flex items-center justify-center shrink-0">
                                    <Sun className="text-charcoal" size={20} />
                                </div>
                                <div>
                                    <h3 className="font-serif text-xl text-charcoal mb-2">Secado y Almacenamiento</h3>
                                    <p className="text-warm-gray font-sans lowercase font-light leading-relaxed">
                                        Nunca seques tus zapatos cerca de una fuente de calor directa (radiador, sol intenso), ya que la piel puede resecarse y deformarse. Guárdalos en un lugar fresco y seco, preferiblemente en sus bolsas de tela.
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <div className="w-12 h-12 bg-cream rounded-full flex items-center justify-center shrink-0">
                                    <Shield className="text-charcoal" size={20} />
                                </div>
                                <div>
                                    <h3 className="font-serif text-xl text-charcoal mb-2">Protección</h3>
                                    <p className="text-warm-gray font-sans lowercase font-light leading-relaxed">
                                        Considera usar un spray protector repelente al agua antes del primer uso, especialmente en colores claros o gamuza.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Additional Tips / Visual */}
                        <div className="bg-warm-gray/5 rounded-2xl p-8 lg:p-10 border border-warm-gray/10 h-full flex flex-col justify-center">
                            <h3 className="font-serif text-2xl text-charcoal mb-6 text-center">Lo que debes evitar</h3>
                            <ul className="space-y-4 text-warm-gray font-sans lowercase font-light">
                                <li className="flex items-center gap-3">
                                    <span className="w-2 h-2 rounded-full bg-red-400"></span>
                                    Uso de lavadora o secadora.
                                </li>
                                <li className="flex items-center gap-3">
                                    <span className="w-2 h-2 rounded-full bg-red-400"></span>
                                    Productos químicos agresivos (Cloro, alcohol).
                                </li>
                                <li className="flex items-center gap-3">
                                    <span className="w-2 h-2 rounded-full bg-red-400"></span>
                                    Exposición prolongada a la humedad extrema.
                                </li>
                                <li className="flex items-center gap-3">
                                    <span className="w-2 h-2 rounded-full bg-red-400"></span>
                                    Guardarlos sucios o húmedos.
                                </li>
                            </ul>

                            <div className="mt-10 pt-8 border-t border-warm-gray/10 text-center">
                                <p className="text-sm font-sans lowercase text-warm-gray/70 italic">
                                    "Un buen zapato te lleva a buenos lugares, cuídalo y te acompañará mucho tiempo."
                                </p>
                            </div>
                        </div>
                    </div>

                </div>
            </section>
        </div>
    );
}
