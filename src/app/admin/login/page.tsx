'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../lib/supabase';
import { Lock, Mail, Loader2 } from 'lucide-react';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) throw error;

            const { data: adminMembership, error: adminError } = await supabase
                .from('admin_users')
                .select('user_id')
                .eq('user_id', data.user.id)
                .maybeSingle();

            if (adminError || !adminMembership) {
                await supabase.auth.signOut();
                throw new Error('Esta cuenta no tiene acceso administrativo.');
            }

            router.push('/admin/dashboard');
        } catch (err: any) {
            setError(err.message || 'Error al iniciar sesión');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white rounded-lg shadow-sm border border-stone/20 overflow-hidden">
                <div className="p-8 bg-charcoal text-cream text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-cream/10 mb-4">
                        <Lock size={32} />
                    </div>
                    <h1 className="font-serif text-3xl font-light uppercase tracking-wide">Admin Access</h1>
                    <p className="text-cream/60 mt-2 text-sm font-sans">H de Helena Management</p>
                </div>

                <div className="p-8">
                    <form onSubmit={handleLogin} className="space-y-6">
                        {error && (
                            <div className="bg-red-50 text-red-800 p-3 rounded-md text-sm border border-red-100">
                                {error}
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-warm-gray mb-1">
                                Usuario
                            </label>
                            <div className="relative">
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-stone/30 rounded focus:border-charcoal focus:ring-1 focus:ring-charcoal outline-none transition-colors"
                                    placeholder="usuario"
                                    required
                                />
                                <Mail className="absolute left-3 top-2.5 text-warm-gray/40" size={18} />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-warm-gray mb-1">
                                Contraseña
                            </label>
                            <div className="relative">
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-stone/30 rounded focus:border-charcoal focus:ring-1 focus:ring-charcoal outline-none transition-colors"
                                    placeholder="contraseña"
                                    required
                                />
                                <Lock className="absolute left-3 top-2.5 text-warm-gray/40" size={18} />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full btn-primary flex items-center justify-center"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="animate-spin mr-2" size={18} />
                                    Verificando...
                                </>
                            ) : (
                                'Ingresar'
                            )}
                        </button>
                    </form>
                </div>

                <div className="px-8 py-4 bg-stone/5 border-t border-stone/10 text-center">
                    <a href="/" className="text-xs text-warm-gray hover:text-charcoal transition-colors">
                        ← Volver al sitio
                    </a>
                </div>
            </div>
        </div>
    );
}
