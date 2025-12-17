import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Package, Calendar, MapPin, ChevronDown, ChevronUp, LogOut } from 'lucide-react';

interface OrderItem {
    id: string;
    quantity: number;
    price_at_purchase: number;
    size: string;
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

export default function OrderList() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

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

    const deleteOrder = async (orderId: string) => {
        if (!confirm('¿Estás seguro de eliminar este pedido duplicado?')) return;

        try {
            // First delete order items (FK constraint)
            const { error: itemsError } = await supabase
                .from('order_items')
                .delete()
                .eq('order_id', orderId);

            if (itemsError) throw itemsError;

            // Then delete the order
            const { error } = await supabase
                .from('orders')
                .delete()
                .eq('id', orderId);

            if (error) throw error;
            fetchOrders();
        } catch (error) {
            console.error('Error deleting order:', error);
            alert('Error al eliminar el pedido: ' + (error as any).message);
        }
    };

    const updateStatus = async (orderId: string, newStatus: string) => {
        console.log(`Updating status for ${orderId} to ${newStatus}`);
        try {
            const { error } = await supabase
                .from('orders')
                .update({ status: newStatus })
                .eq('id', orderId);

            if (error) {
                console.error('Supabase update error:', error);
                throw error;
            }
            // Refetch to update UI
            fetchOrders();
        } catch (error: any) {
            console.error('Error updating status:', error);
            alert('Error al actualizar el estado: ' + error.message);
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
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-serif text-charcoal">Pedidos</h2>
                    <p className="text-warm-gray text-sm mt-1">Gestiona tus ventas y envíos</p>
                </div>
                <div className="bg-white px-4 py-2 rounded-lg border border-stone/10 text-sm font-medium text-charcoal">
                    Total: {orders.length} pedidos
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-stone/10 overflow-hidden">
                {orders.length === 0 ? (
                    <div className="p-12 text-center text-warm-gray flex flex-col items-center">
                        <Package size={48} className="mb-4 opacity-30" />
                        <p className="text-lg">No hay pedidos aún.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-stone/10">
                        {orders.map((order) => (
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
                                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${order.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                                                }`}>
                                                {order.status === 'paid' ? 'Pagado' : order.status}
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
                                                    updateStatus(order.id, 'enviado');
                                                }}
                                                className="px-3 py-1 text-xs font-medium text-blue-700 bg-blue-100 rounded-full hover:bg-blue-200 transition-colors"
                                            >
                                                Marcar Enviado
                                            </button>
                                        )}
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                deleteOrder(order.id);
                                            }}
                                            className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                                            title="Eliminar Pedido"
                                        >
                                            <LogOut size={16} className="rotate-180" />
                                        </button>
                                    </div>

                                    <div className="text-right min-w-[100px]">
                                        <p className="text-lg font-serif text-charcoal font-medium">
                                            ${order.total_amount.toFixed(2)}
                                        </p>
                                        <p className="text-xs text-warm-gray">
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
                                                            <div className="w-12 h-16 bg-stone/10 rounded overflow-hidden flex-shrink-0">
                                                                {item.products?.images?.[0] ? (
                                                                    <img
                                                                        src={item.products.images[0]}
                                                                        alt={item.products.name}
                                                                        className="w-full h-full object-cover"
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
                                                            </div>
                                                            <p className="text-sm font-medium text-charcoal">
                                                                ${(item.price_at_purchase * item.quantity).toFixed(2)}
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
            </div>
        </div >
    );
}
