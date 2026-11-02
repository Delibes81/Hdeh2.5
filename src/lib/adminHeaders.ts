import { supabase } from './supabase';

// Headers para llamar a las rutas /api/send-*-email desde el panel de admin:
// incluye el token de la sesión para que el servidor verifique que es un admin.
export async function adminHeaders(): Promise<Record<string, string>> {
    const { data: { session } } = await supabase.auth.getSession();
    return {
        'Content-Type': 'application/json',
        ...(session ? { Authorization: `Bearer ${session.access_token}` } : {}),
    };
}
