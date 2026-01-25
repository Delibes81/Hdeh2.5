import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { DollarSign, ShoppingBag, TrendingUp, AlertTriangle, Loader2, Calendar } from 'lucide-react';

export default function DashboardHome() {
    const [loading, setLoading] = useState(true);
    const [salesData, setSalesData] = useState<any[]>([]);
    const [lowStockItems, setLowStockItems] = useState<any[]>([]);
    const [timeRange, setTimeRange] = useState('7d');
    const [filteredData, setFilteredData] = useState<any[]>([]);
    const [stats, setStats] = useState({
        totalSales: 0,
        pendingOrders: 0,
        avgTicket: 0
    });

    useEffect(() => {
        fetchStats();
    }, []);

    useEffect(() => {
        filterData();
    }, [salesData, timeRange]);

    const filterData = () => {
        if (!salesData.length) return;

        const now = new Date();
        const cutoff = new Date();

        if (timeRange === '7d') {
            cutoff.setDate(now.getDate() - 7);
        } else if (timeRange === '30d') {
            cutoff.setDate(now.getDate() - 30);
        } else {
            setFilteredData(salesData);
            return;
        }

        const filtered = salesData.filter(item => {
            // item.date is "DD MMM", we need to parse or use original timestamp if available.
            // For simplicity, let's rely on the fact that salesData is sorted chronologically
            // and we slice the array if we want strictly by count, BUT for dates we need the timestamp.
            // Better approach: Store timestamp in salesData too.
            return item.timestamp >= cutoff.getTime();
        });
        setFilteredData(filtered);
    };

    const fetchStats = async () => {
        try {
            setLoading(true);

            // 1. Fetch Orders Logic (Paid & Shipped)
            // Fetch created_at to group by date
            const { data: orders, error: ordersError } = await supabase
                .from('orders')
                .select('created_at, total_amount, status')
                .order('created_at', { ascending: true });

            if (ordersError) throw ordersError;

            // Filter valid orders (completed sales)
            const validOrders = orders?.filter(o => o.status === 'paid' || o.status === 'enviado') || [];

            // Calculate Stats
            const pendingOrders = validOrders.filter(o => o.status === 'paid').length;
            const completedOrders = validOrders.length;
            const totalSales = validOrders.reduce((acc, curr) => acc + curr.total_amount, 0);
            const avgTicket = completedOrders > 0 ? totalSales / completedOrders : 0;

            // 2. Fetch Low Stock Logic (Detailed)
            const { data: variants, error: variantsError } = await supabase
                .from('product_variants')
                .select(`
                    id, 
                    stock, 
                    size, 
                    product_id,
                    products (name, images)
                `)
                .lt('stock', 5)
                .order('stock', { ascending: true })
                .limit(10);

            if (variantsError) throw variantsError;

            // Ensure types are safe
            const lowStockList = variants || [];

            setStats({
                totalSales,
                pendingOrders, // Only count 'paid', not 'paid' + 'enviado' for this metric
                avgTicket
            });
            setLowStockItems(lowStockList);

            // 3. Process Chart Data
            const salesMap = new Map<string, { amount: number, timestamp: number }>();

            validOrders.forEach(order => {
                const dateObj = new Date(order.created_at);
                const dateKey = dateObj.toLocaleDateString('es-MX', {
                    day: 'numeric',
                    month: 'short'
                }); // e.g. "15 oct"

                // Keep the timestamp of the first occurrence for sorting/filtering
                const existing = salesMap.get(dateKey);
                salesMap.set(dateKey, {
                    amount: (existing?.amount || 0) + order.total_amount,
                    timestamp: existing?.timestamp || dateObj.getTime()
                });
            });

            // Convert Map to Array for Recharts
            const chartData = Array.from(salesMap, ([date, data]) => ({
                date,
                amount: data.amount,
                timestamp: data.timestamp
            })).sort((a, b) => a.timestamp - b.timestamp);

            setSalesData(chartData);

        } catch (error) {
            console.error('Error fetching dashboard stats:', error);
        } finally {
            setLoading(false);
        }
    };

    const StatCard = ({ title, value, subtext, icon: Icon, colorClass }: any) => (
        <div className="bg-white p-6 rounded-xl border border-stone/10 shadow-sm flex items-start justify-between">
            <div>
                <p className="text-sm font-medium text-warm-gray mb-1">{title}</p>
                <h3 className="text-2xl font-serif text-charcoal">{value}</h3>
                {subtext && <p className="text-xs text-warm-gray mt-2">{subtext}</p>}
            </div>
            <div className={`p-3 rounded-lg ${colorClass}`}>
                <Icon size={24} />
            </div>
        </div>
    );

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="animate-spin text-charcoal" size={48} />
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-fade-in">
            <div>
                <h2 className="font-serif text-2xl text-charcoal">Resumen</h2>
                <p className="text-warm-gray text-sm mt-1">Vista general del rendimiento de tu tienda.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard
                    title="Ventas Totales"
                    value={`$${stats.totalSales.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`}
                    subtext="Ingresos brutos"
                    icon={DollarSign}
                    colorClass="bg-emerald-100 text-emerald-700"
                />
                <StatCard
                    title="Pendientes de Envío"
                    value={stats.pendingOrders}
                    subtext="Pedidos para preparar"
                    icon={ShoppingBag}
                    colorClass="bg-amber-100 text-amber-700"
                />
                <StatCard
                    title="Ticket Promedio"
                    value={`$${stats.avgTicket.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`}
                    subtext="Por pedido"
                    icon={TrendingUp}
                    colorClass="bg-blue-100 text-blue-700"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Sales Chart (2/3 width) */}
                <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-stone/10 shadow-sm">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-serif text-charcoal">Tendencia de Ventas</h3>
                        <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-warm-gray" size={14} />
                            <select
                                value={timeRange}
                                onChange={(e) => setTimeRange(e.target.value)}
                                className="pl-9 pr-8 py-1.5 bg-stone/5 border-none rounded-lg text-xs font-medium text-warm-gray focus:ring-1 focus:ring-charcoal/20 cursor-pointer"
                            >
                                <option value="7d">Últimos 7 días</option>
                                <option value="30d">Últimos 30 días</option>
                                <option value="all">Todo el tiempo</option>
                            </select>
                        </div>
                    </div>

                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={filteredData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E5E5" />
                                <XAxis
                                    dataKey="date"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#78716C', fontSize: 12 }}
                                    dy={10}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#78716C', fontSize: 12 }}
                                    tickFormatter={(value) => `$${value}`}
                                />
                                <Tooltip
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    formatter={(value: number) => [`$${value.toFixed(2)}`, 'Ventas']}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="amount"
                                    stroke="#1C1917"
                                    strokeWidth={2}
                                    dot={{ fill: '#1C1917', r: 4 }}
                                    activeDot={{ r: 6 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Low Stock List (1/3 width) */}
                <div className="bg-white p-6 rounded-xl border border-stone/10 shadow-sm flex flex-col">
                    <div className="flex items-center gap-2 mb-6">
                        <AlertTriangle className="text-amber-500" size={20} />
                        <h3 className="text-lg font-serif text-charcoal">Alertas de Stock</h3>
                    </div>

                    {lowStockItems.length === 0 ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-warm-gray text-center py-8">
                            <p>¡Todo en orden!</p>
                            <p className="text-xs mt-1">No hay productos con bajo inventario.</p>
                        </div>
                    ) : (
                        <div className="space-y-4 overflow-y-auto max-h-[320px] pr-2 custom-scrollbar">
                            {lowStockItems.map((item) => (
                                <div key={item.id} className="flex items-center gap-3 p-3 rounded-lg bg-stone/5 border border-stone/10">
                                    <div className="w-10 h-10 bg-white rounded overflow-hidden flex-shrink-0 border border-stone/10">
                                        {item.products?.images?.[0] && (
                                            <img
                                                src={item.products.images[0]}
                                                alt=""
                                                className="w-full h-full object-cover"
                                            />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-charcoal truncate">
                                            {item.products?.name}
                                        </p>
                                        <p className="text-xs text-warm-gray">
                                            Talla: {item.size?.replace(' MX', '')}
                                        </p>
                                    </div>
                                    <div className={`text-xs font-bold px-2 py-1 rounded-full ${item.stock === 0 ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-700'
                                        }`}>
                                        {item.stock} u.
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
