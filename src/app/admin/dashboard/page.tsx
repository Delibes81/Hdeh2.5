'use client';
import { LogOut, Package, ShoppingBag, Settings, LayoutDashboard } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '../../../components/admin/ProtectedRoute';
import OrderList from './OrderList';
import ProductList from './ProductList';
import DashboardHome from './DashboardHome';
import CouponManager from './CouponManager';
import { useState } from 'react';
import type { LucideIcon } from 'lucide-react';

type View = 'home' | 'products' | 'orders' | 'settings';

export default function Dashboard() {
    const router = useRouter();
    
    const [currentView, setCurrentView] = useState<View>('home');

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/admin/login');
    };

    const NavItem = ({ view, icon: Icon, label }: { view: View; icon: LucideIcon; label: string }) => (
        <button
            onClick={() => setCurrentView(view)}
            className={`flex items-center space-x-3 w-full px-4 py-3 transition-colors font-sans uppercase text-sm tracking-wide font-medium ${currentView === view
                ? 'text-charcoal bg-stone/5 border-r-2 border-charcoal'
                : 'text-warm-gray/60 hover:bg-stone/5 hover:text-charcoal'
                }`}
        >
            <Icon size={18} strokeWidth={1.5} />
            <span>{label}</span>
        </button>
    );

    return (
        <ProtectedRoute>
        <div className="min-h-screen bg-white flex">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-stone/20 hidden md:flex flex-col h-screen sticky top-0">
                <div className="p-6 border-b border-stone/20">
                    <h1 className="font-serif text-xl tracking-wide text-charcoal">H de Helena</h1>
                    <p className="text-xs text-warm-gray mt-1 uppercase tracking-widest">Admin Panel</p>
                </div>

                <nav className="flex-1 p-4 space-y-1">
                    <NavItem view="home" icon={LayoutDashboard} label="Inicio" />
                    <NavItem view="products" icon={Package} label="Productos" />
                    <NavItem view="orders" icon={ShoppingBag} label="Pedidos" />
                    <NavItem view="settings" icon={Settings} label="Configuración" />
                </nav>

                <div className="p-4 border-t border-stone/20">
                    <button
                        onClick={handleLogout}
                        className="flex items-center space-x-3 w-full px-4 py-3 font-sans uppercase text-sm tracking-wide font-medium text-red-600 hover:bg-red-50 transition-colors"
                    >
                        <LogOut size={18} strokeWidth={1.5} />
                        <span>Cerrar Sesión</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-x-hidden">
                {/* Mobile Header */}
                <div className="md:hidden bg-white p-4 border-b border-stone/20 flex justify-between items-center sticky top-0 z-10">
                    <h1 className="font-serif text-lg text-charcoal">H de Helena Admin</h1>
                    <button onClick={handleLogout} className="text-warm-gray"><LogOut size={20} /></button>
                </div>

                <div className="p-6 md:p-8 max-w-7xl mx-auto">
                    {currentView === 'home' && <DashboardHome />}
                    {currentView === 'products' && <ProductList />}

                    {currentView === 'orders' && <OrderList />}

                    {currentView === 'settings' && (
                        <CouponManager />
                    )}
                </div>
            </main>
        </div>
        </ProtectedRoute>
    );
}
