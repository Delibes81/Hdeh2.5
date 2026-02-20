import { useState } from 'react';
import { Plus, Minus } from 'lucide-react';
import SEO from '../components/SEO';

export default function FAQ() {
    const faqs = [
        {
            question: "¿Cuáles son los tiempos de envío?",
            answer: "Nuestros envíos estándar tardan entre 3 y 5 días hábiles. Para envíos express, el tiempo es de 1 a 2 días hábiles. Recibirás un número de seguimiento tan pronto como tu pedido sea despachado."
        },
        {
            question: "¿Hacen envíos internacionales?",
            answer: "Sí, realizamos envíos a todo el mundo. Los costos y tiempos varían según el destino. Puedes ver el costo exacto al momento de finalizar tu compra."
        },
        {
            question: "¿Cuál es su política de devolución?",
            answer: "Aceptamos devoluciones dentro de los 30 días posteriores a la compra, siempre que el producto esté sin uso y en su empaque original. Los gastos de envío de la devolución corren por cuenta del cliente, a menos que sea un error nuestro."
        },
        {
            question: "¿Cómo puedo saber mi talla?",
            answer: "Disponemos de una guía de tallas detallada en cada producto. Te recomendamos medir tu pie y compararlo con nuestra tabla. Si tienes dudas, contáctanos y te asesoraremos."
        },
        {
            question: "¿Los zapatos son de piel auténtica?",
            answer: "Sí, todos nuestros zapatos están fabricados con piel 100% auténtica de la más alta calidad, seleccionada cuidadosamente para garantizar durabilidad y confort."
        },
        {
            question: "¿Qué métodos de pago aceptan?",
            answer: "Utilizamos Stripe para procesar los pagos de forma 100% segura. Aceptamos todas las principales tarjetas de crédito y débito (Visa, Mastercard, American Express) y Apple Pay / Google Pay. No almacenamos tus datos de pago."
        }
    ];

    const [openIndex, setOpenIndex] = useState<number | null>(null);

    return (
        <div className="min-h-screen bg-white">
            <SEO title="Preguntas Frecuentes" description="Resuelve tus dudas sobre envíos, tallas, devoluciones y más." url="/faq" />

            {/* Header Section */}
            <section className="relative pt-32 pb-12 lg:pt-40 lg:pb-16 bg-gradient-to-br from-pale-pink via-white to-pale-pink overflow-hidden">
                <div className="absolute inset-0 opacity-5">
                    <div className="absolute top-10 left-10 w-72 h-72 bg-charcoal rounded-full blur-3xl"></div>
                    <div className="absolute bottom-10 right-10 w-96 h-96 bg-warm-gray rounded-full blur-3xl"></div>
                </div>

                <div className="relative max-w-7xl mx-auto px-6 lg:px-8 text-center">
                    <h1 className="font-serif font-light text-5xl lg:text-7xl text-charcoal mb-6">
                        Preguntas Frecuentes
                    </h1>
                    <p className="text-xl text-warm-gray font-light max-w-2xl mx-auto">
                        Todo lo que necesitas saber sobre H de Helena
                    </p>
                </div>
            </section>

            {/* FAQ Content */}
            <section className="py-16 lg:py-24">
                <div className="max-w-3xl mx-auto px-6 lg:px-8">
                    <div className="space-y-4">
                        {faqs.map((faq, index) => (
                            <div
                                key={index}
                                className="border border-warm-gray/20 rounded-lg overflow-hidden transition-all duration-300 hover:border-charcoal/30 bg-white"
                            >
                                <button
                                    onClick={() => setOpenIndex(openIndex === index ? null : index)}
                                    className="w-full flex items-center justify-between p-6 text-left focus:outline-none"
                                >
                                    <span className={`font-serif text-xl text-charcoal pr-8 ${openIndex === index ? 'font-medium' : ''}`}>
                                        {faq.question}
                                    </span>
                                    <span className={`flex-shrink-0 transition-transform duration-300 ${openIndex === index ? 'rotate-180' : ''}`}>
                                        {openIndex === index ? (
                                            <Minus className="text-charcoal" size={20} />
                                        ) : (
                                            <Plus className="text-warm-gray" size={20} />
                                        )}
                                    </span>
                                </button>

                                <div
                                    className={`transition-all duration-300 ease-in-out overflow-hidden ${openIndex === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                                        }`}
                                >
                                    <div className="p-6 pt-0 text-warm-gray font-light leading-relaxed">
                                        {faq.answer}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-16 text-center bg-cream/50 rounded-2xl p-8 lg:p-12 border border-warm-gray/10">
                        <h3 className="font-serif text-2xl text-charcoal mb-4">¿No encontraste lo que buscabas?</h3>
                        <p className="text-warm-gray mb-8 font-light">
                            Estamos aquí para ayudarte. Contáctanos directamente.
                        </p>
                        <a
                            href="mailto:hola@hdehelena.com"
                            className="inline-block bg-charcoal text-cream px-8 py-3 rounded-full hover:bg-charcoal/90 transition-colors duration-300 font-medium tracking-wide"
                        >
                            Escríbenos un email
                        </a>
                    </div>
                </div>
            </section>
        </div>
    );
}
