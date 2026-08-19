import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase';
import { Package, Calendar, MapPin, ChevronDown, ChevronUp, Search, Filter, ArrowUpDown, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { formatPrice } from '../../../utils/format';

interface OrderItem {
    id: string;
    quantity: number;
    price_at_purchase: number;
    size: string;
    inventory_quantity: number;
    production_quantity: number;
    products: {
        name: string;
        images: string[];
    };
}

interface Order {
    id: string;
    created_at: string;
    status: string;
    total_amount: number;
    contact_email: string;
    contact_phone?: string;
    shipping_address: {
        name: string;
        address: {
            line1: string;
            line2?: string;
            city: string;
            state: string;
            postal_code: string;
            country: string;
        };
    };
    order_items: OrderItem[];
}

type NotifiableOrderStatus = 'paid' | 'en_fabricacion' | 'preparando_envio' | 'enviado';

export default function OrderList() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

    // Tracking Modal State
    const [trackingModalOpen, setTrackingModalOpen] = useState(false);
    const [selectedOrderForTracking, setSelectedOrderForTracking] = useState<Order | null>(null);
    const [trackingNumber, setTrackingNumber] = useState('');
    const [carrier, setCarrier] = useState('Estafeta / FedEx');
    const [isSendingEmail, setIsSendingEmail] = useState(false);

    // Filter & Sort State
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [sortOption, setSortOption] = useState('date-desc');

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            console.log('Fetching orders...');
            // Corrección: Consultamos 'products' directamente, ya que order_items tiene product_id
            // y 'size' está guardado directamente en order_items.
            const { data, error } = await supabase
                .from('orders')
                .select(`
          *,
          order_items (
            id,
            quantity,
            price_at_purchase,
            size,
            inventory_quantity,
            production_quantity,
            products (
                name,
                images
            )
          )
        `)
                .order('created_at', { ascending: false });

            console.log('Orders Response - Data:', data);
            console.log('Orders Response - Error:', error);

            if (error) throw error;
            setOrders(data || []);
        } catch (error) {
            console.error('Error fetching orders:', error);
        } finally {
            setLoading(false);
        }
    };

    // --- Filter & Sort Logic ---
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, statusFilter, sortOption]);

    const filteredOrders = orders.filter((order) => {
        const matchesSearch =
            order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.contact_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.shipping_address?.name?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = statusFilter === 'all' || order.status === statusFilter;

        return matchesSearch && matchesStatus;
    }).sort((a, b) => {
        switch (sortOption) {
            case 'date-asc':
                return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
            case 'date-desc':
                return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
            case 'amount-asc':
                return a.total_amount - b.total_amount;
            case 'amount-desc':
                return b.total_amount - a.total_amount;
            default:
                return 0;
        }
    });

    // --- Pagination Logic ---
    const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
    const paginatedOrders = filteredOrders.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );



    const updateStatus = async (orderId: string, newStatus: string) => {
        console.log(`Updating status for ${orderId} to ${newStatus}`);
        const { error } = await supabase
            .from('orders')
            .update({ status: newStatus })
            .eq('id', orderId);

        if (error) {
            console.error('Supabase update error:', error);
            throw error;
        }

        await fetchOrders();
    };

    const sendStatusEmail = async (
        orderId: string,
        status: NotifiableOrderStatus,
        details?: { trackingNumber?: string; carrier?: string },
    ) => {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError || !session?.access_token) {
            throw new Error('La sesión administrativa expiró. Inicia sesión nuevamente.');
        }

        const response = await fetch('/api/orders/send-status-email', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${session.access_token}`,
            },
            body: JSON.stringify({ orderId, status, ...details }),
        });

        if (!response.ok) {
            const result = await response.json().catch(() => null) as { error?: string } | null;
            throw new Error(result?.error || 'No se pudo enviar el correo');
        }
    };

    const updateStatusAndNotifyProduction = async (order: Order) => {
        if (!confirm('¿Marcar pedido como "En fabricación" y notificar al cliente por correo?')) return;
        
        try {
            await updateStatus(order.id, 'en_fabricacion');
            await sendStatusEmail(order.id, 'en_fabricacion');
            alert('Pedido marcado en fabricación y correo enviado exitosamente.');
        } catch (error: unknown) {
            console.error(error);
            const message = error instanceof Error ? error.message : 'Error inesperado';
            alert(`No se pudo completar la notificación de fabricación: ${message}`);
        }
    };

    const updateStatusAndNotifyPreparing = async (order: Order) => {
        if (!confirm('¿Marcar pedido como "Preparando envío" y notificar al cliente por correo?')) return;
        
        try {
            await updateStatus(order.id, 'preparando_envio');
            await sendStatusEmail(order.id, 'preparando_envio');
            alert('Pedido marcado en preparación y correo enviado exitosamente.');
        } catch (error: unknown) {
            console.error(error);
            const message = error instanceof Error ? error.message : 'Error inesperado';
            alert(`No se pudo completar la notificación de preparación: ${message}`);
        }
    };

    const resetAndNotifyPayment = async (order: Order) => {
        if (!confirm('¿Reiniciar estado a "Pagado" y enviar correo de confirmación de compra de prueba?')) return;
        
        try {
            await updateStatus(order.id, 'paid');
            await sendStatusEmail(order.id, 'paid');
            alert('Pedido reiniciado a Pagado y correo de confirmación enviado exitosamente.');
        } catch (error: unknown) {
            console.error(error);
            const message = error instanceof Error ? error.message : 'Error inesperado';
            alert(`No se pudo completar el reinicio del pedido: ${message}`);
        }
    };

    const handleMarkAsShipped = (order: Order) => {
        setSelectedOrderForTracking(order);
        setTrackingModalOpen(true);
    };

    const confirmShippingAndSendEmail = async () => {
        if (!selectedOrderForTracking || !trackingNumber) {
            alert('Por favor ingresa un número de rastreo');
            return;
        }
        setIsSendingEmail(true);

        try {
            await updateStatus(selectedOrderForTracking.id, 'enviado');
            await sendStatusEmail(selectedOrderForTracking.id, 'enviado', {
                trackingNumber,
                carrier,
            });

            setTrackingModalOpen(false);
            setTrackingNumber('');
            setCarrier('Estafeta / FedEx');
            alert('Pedido marcado como enviado y correo enviado exitosamente.');
        } catch (error: unknown) {
            console.error(error);
            const message = error instanceof Error ? error.message : 'Error inesperado';
            alert(`No se pudo completar la confirmación de envío: ${message}`);
        } finally {
            setIsSendingEmail(false);
            setSelectedOrderForTracking(null);
        }
    };

    const toggleExpand = (orderId: string) => {
        setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('es-MX', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) return <div className="p-8 text-center text-warm-gray">Cargando pedidos...</div>;

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="font-serif text-2xl font-light uppercase tracking-wide text-charcoal">Pedidos</h2>
                    <p className="text-warm-gray text-sm mt-1 font-sans">Gestiona tus ventas y envíos</p>
                </div>
                <div className="bg-white px-4 py-2 rounded-lg border border-stone/10 text-sm font-medium text-charcoal">
                    Total: {filteredOrders.length} pedidos
                </div>
            </div>

            {/* Controls Bar */}
            <div className="bg-white p-4 rounded-lg border border-stone/20 flex flex-col md:flex-row gap-4 items-center justify-between shadow-sm">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-warm-gray" size={18} />
                    <input
                        type="text"
                        placeholder="Buscar por ID, email o nombre..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-10 py-2 bg-stone/5 border-none rounded-lg focus:ring-1 focus:ring-charcoal/20 text-sm"
                    />
                    {searchTerm && (
                        <button
                            onClick={() => {
                                setSearchTerm('');
                                setCurrentPage(1);
                            }}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-warm-gray/50 hover:text-charcoal transition-colors"
                        >
                            <X size={16} />
                        </button>
                    )}
                </div>

                <div className="flex gap-2 w-full md:w-auto">
                    <div className="relative flex-1 md:flex-none">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-warm-gray" size={16} />
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="w-full pl-9 pr-8 py-2 bg-stone/5 border-none rounded-lg text-sm appearance-none cursor-pointer focus:ring-1 focus:ring-charcoal/20"
                        >
                            <option value="all">Todos los estados</option>
                            <option value="paid">Pagado</option>
                            <option value="en_fabricacion">En fabricación</option>
                            <option value="preparando_envio">Preparando envío</option>
                            <option value="enviado">Enviado</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-warm-gray pointer-events-none" size={14} />
                    </div>

                    <div className="relative flex-1 md:flex-none">
                        <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 text-warm-gray" size={16} />
                        <select
                            value={sortOption}
                            onChange={(e) => setSortOption(e.target.value)}
                            className="w-full pl-9 pr-8 py-2 bg-stone/5 border-none rounded-lg text-sm appearance-none cursor-pointer focus:ring-1 focus:ring-charcoal/20"
                        >
                            <option value="date-desc">Más recientes</option>
                            <option value="date-asc">Más antiguos</option>
                            <option value="amount-desc">Mayor precio</option>
                            <option value="amount-asc">Menor precio</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-warm-gray pointer-events-none" size={14} />
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-stone/20 overflow-hidden">
                {paginatedOrders.length === 0 ? (
                    <div className="p-12 text-center text-warm-gray flex flex-col items-center">
                        <Package size={48} className="mb-4 opacity-30" />
                        <p className="text-lg">No hay pedidos aún.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-stone/10">
                        {paginatedOrders.map((order) => (
                            <div key={order.id} className="transition-colors hover:bg-stone/5">
                                {/* Order Summary Row */}
                                <div
                                    className="p-6 cursor-pointer flex flex-wrap items-center gap-4 md:gap-8"
                                    onClick={() => toggleExpand(order.id)}
                                >
                                    <div className="flex-1 min-w-[200px]">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-mono text-xs text-warm-gray bg-stone/10 px-2 py-0.5 rounded">
                                                #{order.id.slice(0, 8)}
                                            </span>
                                            <span className={`text-xs px-3 py-1 rounded-full font-sans font-bold border inline-block ${
                                                order.status === 'paid' ? 'border-charcoal bg-charcoal text-cream' : 
                                                order.status === 'en_fabricacion' ? 'border-[#b59e75] bg-[#f8f5f0] text-[#b59e75]' : 
                                                order.status === 'preparando_envio' ? 'border-orange-500 bg-orange-50 text-orange-600' : 
                                                'border-stone/20 bg-stone/5 text-charcoal'
                                                }`}>
                                                {order.status === 'paid' ? 'Pagado' : 
                                                 order.status === 'en_fabricacion' ? 'En fabricación' : 
                                                 order.status === 'preparando_envio' ? 'Preparando envío' :
                                                 order.status === 'enviado' ? 'Enviado' : order.status}
                                            </span>
                                        </div>
                                        <p className="font-medium text-charcoal">{order.contact_email}</p>
                                        {order.contact_phone && (
                                            <p className="text-xs text-warm-gray">{order.contact_phone}</p>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-2 text-sm text-warm-gray min-w-[150px]">
                                        <Calendar size={16} />
                                        {formatDate(order.created_at)}
                                    </div>

                                    <div className="flex items-center gap-2">
                                        {order.status === 'paid' && (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    updateStatusAndNotifyProduction(order);
                                                }}
                                                className="btn-secondary text-xs px-2 py-1"
                                            >
                                                En Fabricación
                                            </button>
                                        )}
                                        {(order.status === 'paid' || order.status === 'en_fabricacion') && (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    updateStatusAndNotifyPreparing(order);
                                                }}
                                                className="btn-secondary text-xs px-2 py-1"
                                            >
                                                Preparando Envío
                                            </button>
                                        )}
                                        {(order.status === 'paid' || order.status === 'en_fabricacion' || order.status === 'preparando_envio') && (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleMarkAsShipped(order);
                                                }}
                                                className="btn-secondary text-xs px-2 py-1"
                                            >
                                                Marcar Enviado
                                            </button>
                                        )}
                                        {(order.status === 'en_fabricacion' || order.status === 'preparando_envio' || order.status === 'enviado') && (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    resetAndNotifyPayment(order);
                                                }}
                                                className="text-[10px] px-2 py-1 text-red-500 hover:bg-red-50 border border-red-200 rounded transition-colors uppercase font-semibold tracking-wider"
                                            >
                                                Reset (Test)
                                            </button>
                                        )}
                                    </div>

                                        <div className="text-right min-w-[100px]">
                                            <div className="text-lg font-serif text-charcoal font-medium flex items-baseline justify-end gap-1">
                                                <span className="font-sans text-[0.8em] font-medium">$</span>
                                                {(() => {
                                                    const priceStr = formatPrice(order.total_amount).replace('$', '');
                                                    const parts = priceStr.split(' ');
                                                    return (
                                                        <>
                                                            <span>{parts[0]}</span>
                                                            {parts[1] && <span className="text-xs font-sans text-warm-gray ml-1 font-normal uppercase tracking-normal">{parts[1]}</span>}
                                                        </>
                                                    );
                                                })()}
                                            </div>
                                            <p className="text-xs text-warm-gray mt-1">
                                                {order.order_items.length} {order.order_items.length === 1 ? 'item' : 'items'}
                                            </p>
                                        </div>

                                    <button className="text-charcoal opacity-50 hover:opacity-100">
                                        {expandedOrderId === order.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                    </button>
                                </div>

                                {/* Expanded Details */}
                                {expandedOrderId === order.id && (
                                    <div className="bg-stone/5 p-6 border-t border-stone/10 animate-fade-in">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            {/* Shipping Info */}
                                            <div>
                                                <h4 className="text-sm font-medium text-charcoal mb-3 flex items-center gap-2">
                                                    <MapPin size={16} />
                                                    Dirección de Envío
                                                </h4>
                                                <div className="bg-white p-4 rounded-lg border border-stone/10 text-sm text-warm-gray leading-relaxed">
                                                    <p className="font-medium text-charcoal mb-1">{order.shipping_address?.name || 'Cliente sin nombre'}</p>
                                                    <p>{order.shipping_address?.address?.line1}</p>
                                                    {order.shipping_address?.address?.line2 && <p>{order.shipping_address?.address?.line2}</p>}
                                                    <p>
                                                        {order.shipping_address?.address?.city}, {order.shipping_address?.address?.state} {order.shipping_address?.address?.postal_code}
                                                    </p>
                                                    <p className="font-medium mt-1">{order.shipping_address?.address?.country}</p>
                                                </div>
                                            </div>

                                            {/* Order Items */}
                                            <div>
                                                <h4 className="text-sm font-medium text-charcoal mb-3 flex items-center gap-2">
                                                    <Package size={16} />
                                                    Productos
                                                </h4>
                                                <div className="space-y-3">
                                                    {order.order_items.map((item) => (
                                                        <div key={item.id} className="flex gap-4 bg-white p-3 rounded-lg border border-stone/10">
                                                            <div className="w-12 aspect-[4/5] bg-white rounded overflow-hidden flex-shrink-0">
                                                                {item.products?.images?.[0] ? (
                                                                    <img
                                                                        src={item.products.images[0]}
                                                                        alt={item.products.name}
                                                                        className="w-full h-full object-contain p-1"
                                                                    />
                                                                ) : (
                                                                    <div className="w-full h-full bg-gray-200 flex items-center justify-center text-xs text-gray-400">Sin img</div>
                                                                )}
                                                            </div>
                                                            <div className="flex-1">
                                                                <p className="text-sm font-medium text-charcoal">
                                                                    {item.products?.name || 'Producto Desconocido'}
                                                                </p>
                                                                <p className="text-xs text-warm-gray mt-1">
                                                                    Talla: {item.size} | Cantidad: {item.quantity}
                                                                </p>
                                                                <div className="flex flex-wrap gap-2 mt-2">
                                                                    {item.inventory_quantity > 0 && (
                                                                        <span className="text-[11px] px-2 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                                                                            Inventario: {item.inventory_quantity}
                                                                        </span>
                                                                    )}
                                                                    {item.production_quantity > 0 && (
                                                                        <span className="text-[11px] px-2 py-1 rounded-full bg-amber-50 text-amber-900 border border-amber-200 font-medium">
                                                                            Fabricar: {item.production_quantity}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <p className="text-sm font-medium text-charcoal">
                                                                {formatPrice(item.price_at_purchase * item.quantity)}
                                                            </p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {/* Pagination Controls */}
                {totalPages > 1 && (
                    <div className="p-4 border-t border-stone/10 flex justify-between items-center bg-stone/5">
                        <p className="text-sm text-warm-gray">
                            Mostrando {(currentPage - 1) * itemsPerPage + 1} a {Math.min(currentPage * itemsPerPage, filteredOrders.length)} de {filteredOrders.length}
                        </p>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="p-2 bg-white border border-stone/10 rounded-lg hover:bg-stone/5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronLeft size={16} />
                            </button>
                            <span className="flex items-center px-3 text-sm font-medium text-charcoal bg-white border border-stone/10 rounded-lg">
                                {currentPage} / {totalPages}
                            </span>
                            <button
                                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className="p-2 bg-white border border-stone/10 rounded-lg hover:bg-stone/5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Tracking Modal */}
            {trackingModalOpen && selectedOrderForTracking && (
                <div className="fixed inset-0 bg-charcoal/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-serif text-xl text-charcoal">Confirmar Envío</h3>
                            <button onClick={() => setTrackingModalOpen(false)} className="text-warm-gray hover:text-charcoal transition-colors">
                                <X size={20} />
                            </button>
                        </div>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-sans uppercase tracking-widest text-warm-gray mb-1">
                                    Paquetería
                                </label>
                                <input
                                    type="text"
                                    value={carrier}
                                    onChange={(e) => setCarrier(e.target.value)}
                                    placeholder="Ej. Estafeta, FedEx, DHL"
                                    className="w-full px-4 py-2 bg-stone/5 border border-stone/10 rounded focus:border-charcoal focus:ring-1 focus:ring-charcoal outline-none transition-all text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-sans uppercase tracking-widest text-warm-gray mb-1">
                                    Número de Rastreo (Obligatorio)
                                </label>
                                <input
                                    type="text"
                                    value={trackingNumber}
                                    onChange={(e) => setTrackingNumber(e.target.value)}
                                    placeholder="Escribe el número de rastreo..."
                                    className="w-full px-4 py-2 bg-stone/5 border border-stone/10 rounded focus:border-charcoal focus:ring-1 focus:ring-charcoal outline-none transition-all text-sm"
                                />
                            </div>
                            <div className="pt-4 flex gap-3">
                                <button
                                    onClick={() => setTrackingModalOpen(false)}
                                    className="flex-1 py-3 text-sm font-medium text-warm-gray hover:text-charcoal border border-stone/20 rounded hover:bg-stone/5 transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={confirmShippingAndSendEmail}
                                    disabled={!trackingNumber || isSendingEmail}
                                    className="flex-1 py-3 text-sm font-medium bg-charcoal text-white rounded hover:bg-stone-800 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                                >
                                    {isSendingEmail ? 'Enviando...' : 'Confirmar y Notificar'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div >
    );
}
