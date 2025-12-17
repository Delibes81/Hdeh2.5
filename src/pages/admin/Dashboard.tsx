import { LogOut, Package, ShoppingBag, Settings } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';
import OrderList from './OrderList';

// ... (existing code)

{ currentView === 'products' && <ProductList /> }
{ currentView === 'orders' && <OrderList /> }

type View = 'products' | 'orders' | 'settings';

export default function Dashboard() {
    const navigate = useNavigate();
    const [currentView, setCurrentView] = useState<View>('products');

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate('/admin/login');
    };

    const NavItem = ({ view, icon: Icon, label }: { view: View; icon: any; label: string }) => (
        <button
            onClick={() => setCurrentView(view)}
            className={`flex items-center space-x-3 w-full px-4 py-3 rounded-lg transition-colors ${currentView === view
                ? 'bg-charcoal text-cream'
                : 'text-warm-gray hover:bg-stone/10 hover:text-charcoal'
                }`}
        >
            <Icon size={20} />
            <span className="font-medium">{label}</span>
        </button>
    );

    return (
        <div className="min-h-screen bg-off-white flex">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-stone/10 hidden md:flex flex-col h-screen sticky top-0">
                <div className="p-6 border-b border-stone/10">
                    <h1 className="font-serif text-xl tracking-wide text-charcoal">H de Helena</h1>
                    <p className="text-xs text-warm-gray mt-1 uppercase tracking-widest">Admin Panel</p>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    <NavItem view="products" icon={Package} label="Productos" />
                    <NavItem view="orders" icon={ShoppingBag} label="Pedidos" />
                    <NavItem view="settings" icon={Settings} label="Configuración" />
                </nav>

                <div className="p-4 border-t border-stone/10">
                    <button
                        onClick={handleLogout}
                        className="flex items-center space-x-3 w-full px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                    >
                        <LogOut size={20} />
                        <span className="font-medium">Cerrar Sesión</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-x-hidden">
                {/* Mobile Header */}
                <div className="md:hidden bg-white p-4 border-b border-stone/10 flex justify-between items-center sticky top-0 z-10">
                    <h1 className="font-serif text-lg text-charcoal">H de Helena Admin</h1>
                    <button onClick={handleLogout} className="text-warm-gray"><LogOut size={20} /></button>
                </div>

                <div className="p-6 md:p-8 max-w-7xl mx-auto">
                    {currentView === 'products' && <ProductList />}

                    {currentView === 'orders' && (
                        <div className="flex flex-col items-center justify-center h-96 text-warm-gray">
                            <ShoppingBag size={48} className="mb-4 opacity-50" />
                            <h2 className="text-xl font-medium mb-2">Pedidos</h2>
                            <p>Próximamente: Integración con Stripe</p>
                        </div>
                    )}

                    {currentView === 'settings' && (
                        <div className="flex flex-col items-center justify-center h-96 text-warm-gray">
                            <Settings size={48} className="mb-4 opacity-50" />
                            <h2 className="text-xl font-medium mb-2">Configuración</h2>
                            <p>Opciones de cuenta y tienda</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
