import { Link } from 'react-router-dom';
import { CheckCircle, ArrowRight } from 'lucide-react';
import { useEffect } from 'react';
import { useCart } from '../hooks/useCart';

export default function Success() {
    const { clearCart } = useCart();

    useEffect(() => {
        // Clear cart on successful purchase
        clearCart();
    }, []);

    return (
        <div className="min-h-[80vh] flex flex-col items-center justify-center p-4 text-center">
            <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center mb-6 animate-bounce-slow">
                <CheckCircle className="text-emerald-500 w-12 h-12" />
            </div>

            <h1 className="font-serif text-4xl text-charcoal mb-4">¡Gracias por tu compra!</h1>
            <p className="text-warm-gray max-w-md mb-8">
                Tu pedido ha sido procesado correctamente. Recibirás un correo de confirmación en breve.
            </p>

            <Link
                to="/shop"
                className="btn-primary bg-charcoal text-cream hover:bg-warm-gray inline-flex items-center gap-2"
            >
                Volver a la tienda <ArrowRight size={18} />
            </Link>
        </div>
    );
}
