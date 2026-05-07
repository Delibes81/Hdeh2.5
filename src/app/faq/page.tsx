'use client';
import { useState } from 'react';
import { Plus, Minus } from 'lucide-react';
import SEO from '../../components/SEO';

export default function FAQ() {
    const faqs = [
        {
            question: "¿Cuáles son los tiempos de envío?",
            answer: "Nuestros tiempos de envío estándar van de 3 a 5 días hábiles. Para envíos express el tiempo es de 1 a 2 días hábiles. Para pares personalizados el tiempo va de acuerdo al diseño."
        },
        {
            question: "¿Hacen envíos internacionales?",
            answer: "Sí, realizamos envíos a todo el mundo. Los costos y tiempos varían según el destino y si aplican tarifas arancelarias."
        },
        {
            question: "¿Cuál es la política de cambios y devoluciones?",
            answer: "El plazo de cambio es de 30 días naturales a partir de la fecha de compra, siempre que el par se entregue en perfectas condiciones, sin uso y en su empaque original. Cada uno de nuestros pares es elaborado a mano en pequeñas producciones. Por esta razón, no realizamos devoluciones."
        },
        {
            question: "¿Cómo puedo saber mi talla?",
            answer: "Cada uno de nuestros modelos está construido sobre una horma distinta, diseñada específicamente para ese par. Por ello, el ajuste puede variar ligeramente entre estilos. Te recomendamos consultar la guía de tallas disponible en la página de cada modelo, donde encontrarás las medidas y referencias necesarias para elegir tu número con mayor certeza. Si tienes alguna duda adicional, estaremos encantados de orientarte personalmente."
        },
        {
            question: "¿De qué materiales son los zapatos?",
            answer: "Todos nuestros pares están hechos de pieles premium, dándole a este material una doble vida, siendo sostenible por naturaleza y durable a través de los años. La calidad de nuestra selección asegura suavidad, comodidad y un acabado impecable que se perfecciona con el uso."
        },
        {
            question: "¿Qué métodos de pago usan?",
            answer: "Utilizamos Stripe para procesar los pagos de forma 100% segura. Aceptamos pagos con tarjetas de crédito y débito, asegurando que tus datos siempre estén protegidos."
        }
    ];

    const [openIndex, setOpenIndex] = useState<number | null>(null);

    return (
        <div className="min-h-screen bg-white">
            <SEO title="Preguntas Frecuentes" description="Resuelve tus dudas sobre envíos, tallas, devoluciones y más." url="/faq" />

            {/* Header Section */}
            <section className="relative pt-32 pb-6 lg:pt-40 lg:pb-8 bg-gradient-to-br from-pale-pink via-white to-pale-pink overflow-hidden">
                <div className="absolute inset-0 opacity-5">
                    <div className="absolute top-10 left-10 w-72 h-72 bg-charcoal rounded-full blur-3xl"></div>
                    <div className="absolute bottom-10 right-10 w-96 h-96 bg-warm-gray rounded-full blur-3xl"></div>
                </div>

                <div className="relative max-w-7xl mx-auto px-6 lg:px-8 text-center">
                    <h1 className="font-serif font-light text-5xl lg:text-7xl text-charcoal mb-3">
                        Preguntas Frecuentes
                    </h1>
                    <p className="text-xl text-warm-gray font-sans lowercase font-light max-w-2xl mx-auto">
                        Todo lo que necesitas saber sobre H de Helena
                    </p>
                </div>
            </section>

            {/* FAQ Content */}
            <section className="py-8 lg:pt-8 lg:pb-16">
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
                                    <div className="p-6 pt-0 text-warm-gray font-sans lowercase font-light leading-relaxed">
                                        {faq.answer}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-12 text-center bg-cream/50 rounded-2xl p-6 lg:p-8 border border-warm-gray/10">
                        <h3 className="font-serif text-2xl text-charcoal mb-3">¿No encontraste lo que buscabas?</h3>
                        <p className="text-warm-gray mb-6 font-light">
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
