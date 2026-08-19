'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';
import { Loader2 } from 'lucide-react';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const [loading, setLoading] = useState(true);
    const [authorized, setAuthorized] = useState(false);
    const router = useRouter();

    useEffect(() => {
        let active = true;

        const checkAdminAccess = async (userId?: string) => {
            if (!userId) {
                if (active) {
                    setAuthorized(false);
                    setLoading(false);
                }
                return;
            }

            const { data: adminMembership, error } = await supabase
                .from('admin_users')
                .select('user_id')
                .eq('user_id', userId)
                .maybeSingle();

            if (active) {
                setAuthorized(!error && Boolean(adminMembership));
                setLoading(false);
            }

            if (error || !adminMembership) {
                await supabase.auth.signOut();
            }
        };

        const checkAuth = async () => {
            const { data: { session }, error } = await supabase.auth.getSession();

            if (error) {
                if (active) {
                    setAuthorized(false);
                    setLoading(false);
                }
                return;
            }

            await checkAdminAccess(session?.user.id);
        };

        void checkAuth();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            window.setTimeout(() => {
                void checkAdminAccess(session?.user.id);
            }, 0);
        });

        return () => {
            active = false;
            subscription.unsubscribe();
        };
    }, []);

    useEffect(() => {
        if (!loading && !authorized) {
            router.replace('/admin/login');
        }
    }, [loading, authorized, router]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-off-white">
                <Loader2 className="animate-spin text-charcoal" size={48} />
            </div>
        );
    }

    return authorized ? <>{children}</> : null;
}
