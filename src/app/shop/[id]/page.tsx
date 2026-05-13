'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useProducts } from '../../../hooks/useProducts';
import { useCart } from '../../../hooks/useCart';
import { Heart, Share2, Loader, ChevronDown, ChevronUp, ChevronLeft, ChevronRight } from 'lucide-react';
import { formatPrice, createSlug } from '../../../utils/format';
import SEO from '../../../components/SEO';

export default function ProductPage() {
    const params = useParams();
    const id = params.id as string;

    const { products, loading, error: productsError } = useProducts();
    const { addToCart } = useCart();

    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [quantity, setQuantity] = useState(1);
    const [isLiked, setIsLiked] = useState(false);
    const [selectedSize, setSelectedSize] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const [activeAccordion, setActiveAccordion] = useState<string | null>('materials');

    const product = products.find(p => createSlug(p.name) === id || p.id === id);

    useEffect(() => {
        setCurrentImageIndex(0);
        setQuantity(1);
        setSelectedSize(null);
        setError(null);
    }, [product]);

    const nextImage = () => {
        if (product) {
            setCurrentImageIndex((prev) => (prev + 1) % product.images.length);
        }
    };

    const previousImage = () => {
        if (product) {
            setCurrentImageIndex((prev) =>
                prev === 0 ? product.images.length - 1 : prev - 1
            );
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center pt-24">
                <Loader className="w-8 h-8 animate-spin text-charcoal" />
            </div>
        );
    }

    if (productsError || !product) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center pt-24">
                <div className="text-center">
                    <h1 className="font-serif text-3xl mb-4 text-charcoal">Producto no encontrado</h1>
                    <p className="text-warm-gray mb-6">El producto que buscas no existe o ha sido removido.</p>
                    <Link href="/shop" className="btn-primary inline-block">Volver a la tienda</Link>
                </div>
            </div>
        );
    }

    const handleAddToCart = () => {
        if (!selectedSize) {
            setError('Por favor selecciona una talla');
            return;
        }

        addToCart(product, selectedSize, quantity);

        const button = document.getElementById('add-to-cart-btn');
        if (button) {
            const originalText = button.textContent;
            button.textContent = 'Agregado ✓';
            setTimeout(() => {
                if (button) button.textContent = originalText || 'Agregar al carrito';
            }, 1500);
        }
    };

    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: product.name,
                text: product.description,
                url: window.location.href,
            });
        } else {
            navigator.clipboard.writeText(window.location.href);
            alert('Enlace copiado al portapapeles');
        }
    };

    const handleWhatsAppOrder = () => {
        if (!selectedSize) {
            setError('Por favor selecciona una talla');
            return;
        }

        const isMTO = product?.isMadeToOrder || (product?.variants?.find(v => v.size === selectedSize)?.stock === 0);
        const messageText = isMTO ? ' (sobre pedido)' : '';
        const message = `Hola, me interesa encargar el producto${messageText}: ${product.name} en talla ${selectedSize.replace(' MX', '')}.`;
        const whatsappUrl = `https://wa.me/5215510821369?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
    };

    const defaultMadeToOrderSizes = ['3', '3.5', '4', '4.5', '5', '5.5', '6', '6.5'].map(size => ({
        id: `mto-${size}`,
        size: `${size} MX`,
        stock: 999
    }));

    const sortedVariants = product.isMadeToOrder && (!product.variants || product.variants.length === 0)
        ? defaultMadeToOrderSizes
        : product.variants?.slice().sort((a, b) => a.size.localeCompare(b.size, undefined, { numeric: true })) || [];

    const toggleAccordion = (section: string) => {
        setActiveAccordion(prev => prev === section ? null : section);
    };

    const isSelectedOutOfStock = !product?.isMadeToOrder && selectedSize &&
        (sortedVariants.find(v => v.size === selectedSize)?.stock === 0);

    const showWhatsAppButton = product?.isMadeToOrder || isSelectedOutOfStock;

    return (
        <div className="min-h-screen bg-white pt-20 pb-16 animate-fade-in">
            <SEO title={`${product.name} | H de Helena`} description={product.description} url={`/shop/${createSlug(product.name)}`} />

            {/* Breadcrumbs */}
            <div className="max-w-7xl mx-auto px-6 lg:px-8 py-6 text-xs font-sans uppercase tracking-widest text-warm-gray">
                <Link href="/" className="hover:text-charcoal transition-colors">Inicio</Link>
                <span className="mx-2">/</span>
                <Link href="/shop" className="hover:text-charcoal transition-colors">Tienda</Link>
                <span className="mx-2">/</span>
                <span className="text-charcoal font-medium">{product.name}</span>
            </div>

            <div className="max-w-7xl mx-auto px-6 lg:px-8">
                <div className="lg:grid lg:grid-cols-2 lg:gap-x-12 xl:gap-x-16 lg:items-stretch">
                    {/* Left Column: Images */}
                    <div className="flex flex-col-reverse lg:flex-row gap-4 lg:gap-6 h-full">
                        {/* Thumbnails (vertical on desktop, horizontal on mobile) */}
                        <div className="flex lg:flex-col gap-3 overflow-x-auto lg:overflow-y-auto no-scrollbar lg:w-20 xl:w-24 shrink-0 py-2 lg:py-0 max-h-[600px] xl:max-h-[700px]">
                            {product.images.map((img, index) => (
                                <button
                                    key={index}
                                    onClick={() => setCurrentImageIndex(index)}
                                    className={`relative aspect-[4/5] lg:aspect-square w-20 lg:w-full shrink-0 overflow-hidden transition-all duration-300 border-2 ${index === currentImageIndex
                                        ? 'border-charcoal opacity-100'
                                        : 'border-transparent opacity-60 hover:opacity-100 hover:border-warm-gray/30'
                                        }`}
                                >
                                    <img
                                        src={img}
                                        alt={`${product.name} - Vista ${index + 1}`}
                                        className="w-full h-full object-contain bg-white"
                                    />
                                </button>
                            ))}
                        </div>

                        {/* Main Image */}
                        <div className="flex-1 w-full bg-stone/5 relative rounded-xl overflow-hidden flex items-center justify-center min-h-[400px]">
                            <img
                                src={product.images[currentImageIndex]}
                                alt={product.name}
                                className="w-full h-full object-contain mix-blend-multiply scale-100"
                            />

                            {/* Image Navigation */}
                            {product.images.length > 1 && (
                                <>
                                    <button
                                        onClick={previousImage}
                                        className="absolute left-2 lg:left-4 top-1/2 -translate-y-1/2 w-10 h-10 transition-colors duration-300 flex items-center justify-center text-charcoal/40 hover:text-charcoal"
                                    >
                                        <ChevronLeft size={36} strokeWidth={1} />
                                    </button>

                                    <button
                                        onClick={nextImage}
                                        className="absolute right-2 lg:right-4 top-1/2 -translate-y-1/2 w-10 h-10 transition-colors duration-300 flex items-center justify-center text-charcoal/40 hover:text-charcoal"
                                    >
                                        <ChevronRight size={36} strokeWidth={1} />
                                    </button>
                                </>
                            )}

                            {/* Badges Overlay */}
                            {product.isFeatured && (
                                <div className="absolute top-4 left-4">
                                    <span className="bg-charcoal text-cream px-3 py-1.5 text-xs font-montserrat uppercase tracking-widest shadow-sm">
                                        Destacado
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column: Product Details (Row 1) */}
                    <div className="mt-10 lg:mt-0 flex flex-col justify-end lg:justify-start">
                        <div>
                            <h1 className="font-serif text-4xl lg:text-5xl text-charcoal mb-2 leading-tight">
                                {product.name}
                            </h1>
                            <p className="font-sans uppercase text-2xl text-warm-gray font-light tracking-wide mb-8">
                                {formatPrice(product.price)}
                            </p>

                            <p className="text-warm-gray text-base font-light leading-relaxed mb-10">
                                {product.description}
                            </p>

                            {/* Size Selector */}
                            <div className="mb-8">
                                <div className="flex justify-between items-end mb-4">
                                    <h3 className="font-montserrat text-sm uppercase tracking-widest text-charcoal font-medium">
                                        Talla (MX)
                                    </h3>
                                    <button className="text-xs text-warm-gray underline underline-offset-4 hover:text-charcoal transition-colors">
                                        Guía de tallas
                                    </button>
                                </div>
                                {product.isMadeToOrder && (
                                    <p className="text-sm font-sans text-warm-gray mb-4">
                                        Producto de edición por encargo. Elige tu talla y mándanos un mensaje.
                                    </p>
                                )}
                                {!product.isMadeToOrder && isSelectedOutOfStock && (
                                    <div className="bg-stone-50 p-4 rounded-lg mb-4 text-sm text-charcoal border border-stone-200 shadow-sm animate-fade-in">
                                        <p><strong>Talla bajo pedido:</strong> Esta talla está agotada pero podemos fabricarla especialmente para ti. El tiempo aproximado de fabricación es de <strong>3 semanas</strong>.</p>
                                    </div>
                                )}
                                {sortedVariants.length > 0 ? (
                                    <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                                        {sortedVariants.map((variant) => (
                                            <button
                                                key={variant.id}
                                                onClick={() => {
                                                    setSelectedSize(variant.size);
                                                    setError(null);
                                                }}
                                                className={`h-12 border rounded-md transition-all duration-300 flex items-center justify-center text-sm font-medium
                                                    ${selectedSize === variant.size
                                                        ? 'bg-charcoal text-cream border-charcoal shadow-md scale-[1.02]'
                                                        : 'bg-white text-charcoal border-warm-gray/30 hover:border-charcoal hover:bg-stone/5'
                                                    }
                                                    ${!product.isMadeToOrder && variant.stock === 0 && selectedSize !== variant.size ? 'opacity-50 border-dashed bg-stone-50' : ''}
                                                `}
                                            >
                                                {variant.size.replace(' MX', '')}
                                            </button>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-warm-gray italic">No hay tallas disponibles</p>
                                )}
                                {error && <p className="text-red-600 text-xs font-medium mt-3 animate-pulse">{error}</p>}
                            </div>

                            {/* Quantity (Only for normal products in stock) */}
                            {!product.isMadeToOrder && !isSelectedOutOfStock && (
                                <div className="mb-8">
                                    <h3 className="font-montserrat text-sm uppercase tracking-widest text-charcoal font-medium mb-4">
                                        Cantidad
                                    </h3>
                                    <div className="inline-flex items-center border border-warm-gray/30 rounded-full bg-white">
                                        <button
                                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                            className="w-12 h-12 flex items-center justify-center text-warm-gray hover:text-charcoal transition-colors rounded-l-full"
                                        >
                                            -
                                        </button>
                                        <span className="w-12 text-center font-medium text-charcoal text-sm">
                                            {quantity}
                                        </span>
                                        <button
                                            onClick={() => setQuantity(quantity + 1)}
                                            className="w-12 h-12 flex items-center justify-center text-warm-gray hover:text-charcoal transition-colors rounded-r-full"
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="flex flex-col sm:flex-row gap-4 mb-0">
                                {showWhatsAppButton ? (
                                    <button
                                        onClick={handleWhatsAppOrder}
                                        disabled={!selectedSize}
                                        className={`w-full sm:flex-1 h-14 shrink-0 bg-[#25D366] hover:bg-[#128C7E] text-white rounded-full font-montserrat text-xs uppercase font-semibold tracking-widest flex items-center justify-center gap-3 transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5
                                            ${!selectedSize ? 'opacity-60 cursor-not-allowed hover:transform-none hover:shadow-lg hover:bg-[#25D366]' : ''}
                                        `}
                                    >
                                        <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                                        </svg>
                                        Pedir por WhatsApp
                                    </button>
                                ) : (
                                    <button
                                        id="add-to-cart-btn"
                                        onClick={handleAddToCart}
                                        disabled={!selectedSize}
                                        className={`w-full sm:flex-1 h-14 shrink-0 bg-charcoal text-cream rounded-full font-montserrat text-xs uppercase font-semibold tracking-widest flex items-center justify-center transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5 hover:bg-stone-800
                                            ${!selectedSize ? 'opacity-60 cursor-not-allowed hover:transform-none hover:shadow-lg hover:bg-charcoal' : ''}
                                        `}
                                    >
                                        Agregar al Carrito
                                    </button>
                                )}

                                <div className="flex gap-4 sm:w-auto">
                                    <button
                                        onClick={() => setIsLiked(!isLiked)}
                                        className={`h-14 w-14 rounded-full border flex items-center justify-center transition-all duration-300 shrink-0
                                            ${isLiked ? 'border-red-200 bg-red-50 text-red-500 shadow-sm' : 'border-warm-gray/30 text-warm-gray hover:border-charcoal hover:text-charcoal'}`}
                                    >
                                        <Heart
                                            size={20}
                                            className={`transition-transform duration-300 ${isLiked ? 'fill-current scale-110' : ''}`}
                                        />
                                    </button>
                                    <button
                                        onClick={handleShare}
                                        className="h-14 w-14 rounded-full border border-warm-gray/30 text-warm-gray hover:border-charcoal hover:text-charcoal flex items-center justify-center transition-all duration-300 shrink-0"
                                    >
                                        <Share2 size={20} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Accordions (Row 2) */}
                    <div className="lg:col-start-2 mt-12 lg:mt-16">
                        {/* Accordions */}
                        <div className="border-t border-stone-200">
                            {/* Materials Accordion */}
                            <div className="border-b border-stone-200">
                                <button
                                    className="w-full py-5 flex items-center justify-between text-left focus:outline-none group"
                                    onClick={() => toggleAccordion('materials')}
                                >
                                    <span className="font-montserrat text-xs uppercase tracking-widest font-medium text-charcoal group-hover:text-stone-600 transition-colors">
                                        Detalles y Materiales
                                    </span>
                                    {activeAccordion === 'materials' ? (
                                        <ChevronUp size={16} className="text-warm-gray" />
                                    ) : (
                                        <ChevronDown size={16} className="text-warm-gray" />
                                    )}
                                </button>
                                <div className={`overflow-hidden transition-all duration-500 ease-in-out ${activeAccordion === 'materials' ? 'max-h-96 opacity-100 pb-5' : 'max-h-0 opacity-0'}`}>
                                    <div className="text-sm font-light text-warm-gray space-y-2">
                                        <p>Este par es un trabajo de artesanía, diseñado para brindar comodidad y estilo.</p>
                                        {product.materials && product.materials.length > 0 && (
                                            <ul className="list-disc pl-4 space-y-1 mt-2">
                                                {product.materials.map((mat, idx) => (
                                                    <li key={idx}>{mat}</li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Shipping Accordion */}
                            <div className="border-b border-stone-200">
                                <button
                                    className="w-full py-5 flex items-center justify-between text-left focus:outline-none group"
                                    onClick={() => toggleAccordion('shipping')}
                                >
                                    <span className="font-montserrat text-xs uppercase tracking-widest font-medium text-charcoal group-hover:text-stone-600 transition-colors">
                                        Envíos y Devoluciones
                                    </span>
                                    {activeAccordion === 'shipping' ? (
                                        <ChevronUp size={16} className="text-warm-gray" />
                                    ) : (
                                        <ChevronDown size={16} className="text-warm-gray" />
                                    )}
                                </button>
                                <div className={`overflow-hidden transition-all duration-500 ease-in-out ${activeAccordion === 'shipping' ? 'max-h-96 opacity-100 pb-5' : 'max-h-0 opacity-0'}`}>
                                    <div className="text-sm font-light text-warm-gray space-y-2">
                                        <p>• <strong>Envío gratuito</strong> en compras dentro de México.</p>
                                        <p>• Los pedidos estándar se procesan entre 1-3 días hábiles.</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}
