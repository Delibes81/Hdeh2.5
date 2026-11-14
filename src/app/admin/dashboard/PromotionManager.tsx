'use client';
import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase';
import { Plus, Trash2, Edit2, AlertTriangle } from 'lucide-react';

// Gestión de promociones de toda la tienda (tabla "promotions", ver promotions.sql).
// La página y la función de pago de Stripe leen esta tabla: lo que se guarda aquí
// cambia los precios mostrados y los cobrados.

interface PromotionRow {
    id: string;
    name: string;
    discount_percent: number;
    banner_text: string | null;
    starts_at: string;
    ends_at: string | null;
    is_active: boolean;
    allow_coupons: boolean;
    created_at: string;
    applies_to?: 'all' | 'selected' | null;
    promotion_products?: { product_id: string | number }[] | null;
}

interface ProductOption {
    id: string;
    name: string;
    price: number;
    image: string | null;
}

const appliesToOf = (p: PromotionRow) => (p.applies_to === 'selected' ? 'selected' : 'all');
const productIdsOf = (p: PromotionRow) => (p.promotion_products || []).map(pp => String(pp.product_id));

type Status = 'vigente' | 'programada' | 'terminada' | 'desactivada';

const STATUS_STYLES: Record<Status, string> = {
    vigente: 'bg-green-50 text-green-700 border-green-200',
    programada: 'bg-blue-50 text-blue-700 border-blue-200',
    terminada: 'bg-stone-100 text-warm-gray border-stone-200',
    desactivada: 'bg-stone-100 text-warm-gray border-stone-200',
};

const STATUS_LABELS: Record<Status, string> = {
    vigente: 'Vigente',
    programada: 'Programada',
    terminada: 'Terminada',
    desactivada: 'Desactivada',
};

const MAX_PERCENT = 90;

function getStatus(p: PromotionRow, now = Date.now()): Status {
    if (!p.is_active) return 'desactivada';
    if (new Date(p.starts_at).getTime() > now) return 'programada';
    if (p.ends_at && new Date(p.ends_at).getTime() <= now) return 'terminada';
    return 'vigente';
}

// Fecha legible en hora de CDMX
function formatDate(iso: string | null) {
    if (!iso) return 'Sin fecha de fin';
    return new Date(iso).toLocaleString('es-MX', {
        timeZone: 'America/Mexico_City',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

// Las fechas del formulario son siempre hora de CDMX (UTC-6, México no tiene
// horario de verano desde 2022), sin importar la zona de la computadora.
const CDMX_OFFSET = '-06:00';

// ISO → valor para <input type="datetime-local"> en hora de CDMX
function toLocalInput(iso: string | null) {
    if (!iso) return '';
    const parts = new Intl.DateTimeFormat('en-CA', {
        timeZone: 'America/Mexico_City',
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
    }).formatToParts(new Date(iso));
    const get = (type: string) => parts.find(p => p.type === type)?.value || '00';
    return `${get('year')}-${get('month')}-${get('day')}T${get('hour')}:${get('minute')}`;
}

// Valor de <input type="datetime-local"> (hora de CDMX) → Date
function fromLocalInput(value: string) {
    return new Date(`${value}:00${CDMX_OFFSET}`);
}

const emptyForm = () => ({
    name: '',
    discount_percent: '',
    banner_text: '',
    starts_at: toLocalInput(new Date().toISOString()),
    ends_at: '',
    is_active: true,
    allow_coupons: false,
    applies_to: 'all' as 'all' | 'selected',
    product_ids: [] as string[],
});

export default function PromotionManager() {
    const [promotions, setPromotions] = useState<PromotionRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState(emptyForm());
    const [saving, setSaving] = useState(false);
    const [products, setProducts] = useState<ProductOption[]>([]);
    // false si aún no se ejecutó promotions_por_modelo.sql (solo promociones de toda la tienda)
    const [perModelSupported, setPerModelSupported] = useState(true);

    useEffect(() => {
        fetchPromotions();
        fetchProducts();
    }, []);

    const fetchPromotions = async () => {
        setError('');
        const query = (select: string) => supabase
            .from('promotions')
            .select(select)
            .order('starts_at', { ascending: false });

        let { data, error } = await query('*, promotion_products(product_id)');
        let supported = true;
        if (error) {
            supported = false;
            ({ data, error } = await query('*'));
        }
        setPerModelSupported(supported);

        if (error) {
            setError(error.message);
        } else {
            setPromotions(((data || []) as unknown as PromotionRow[]).map(p => ({ ...p, discount_percent: Number(p.discount_percent) })));
        }
        setLoading(false);
    };

    const fetchProducts = async () => {
        const { data } = await supabase.from('products').select('id, name, price, images').order('name');
        setProducts((data || []).map(p => ({
            id: String(p.id),
            name: p.name,
            price: Number(p.price),
            image: Array.isArray(p.images) && p.images.length > 0 ? p.images[0] : null,
        })));
    };

    const productName = (id: string) => products.find(p => p.id === id)?.name || 'Modelo eliminado';

    const toggleProduct = (id: string) => {
        setFormData(f => ({
            ...f,
            product_ids: f.product_ids.includes(id) ? f.product_ids.filter(x => x !== id) : [...f.product_ids, id],
        }));
    };

    const handleCancel = () => {
        setIsFormOpen(false);
        setEditingId(null);
        setFormData(emptyForm());
    };

    const handleEditClick = (p: PromotionRow) => {
        setEditingId(p.id);
        setFormData({
            name: p.name,
            discount_percent: String(p.discount_percent),
            banner_text: p.banner_text || '',
            starts_at: toLocalInput(p.starts_at),
            ends_at: toLocalInput(p.ends_at),
            is_active: p.is_active,
            allow_coupons: p.allow_coupons,
            applies_to: appliesToOf(p),
            product_ids: productIdsOf(p),
        });
        setIsFormOpen(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();

        const percent = Number(formData.discount_percent);
        if (!Number.isFinite(percent) || percent <= 0 || percent > MAX_PERCENT) {
            alert(`El descuento debe ser mayor a 0 y máximo ${MAX_PERCENT}%.`);
            return;
        }
        if (!formData.starts_at) {
            alert('Indica cuándo empieza la promoción.');
            return;
        }
        const startsAt = fromLocalInput(formData.starts_at);
        const endsAt = formData.ends_at ? fromLocalInput(formData.ends_at) : null;
        if (endsAt && endsAt <= startsAt) {
            alert('La fecha de fin debe ser posterior a la de inicio.');
            return;
        }
        const selectedOnly = perModelSupported && formData.applies_to === 'selected';
        if (selectedOnly && formData.product_ids.length === 0) {
            alert('Elige al menos un modelo, o cambia la promoción a "Toda la tienda".');
            return;
        }

        const payload = {
            name: formData.name.trim(),
            discount_percent: percent,
            banner_text: formData.banner_text.trim() || null,
            starts_at: startsAt.toISOString(),
            ends_at: endsAt ? endsAt.toISOString() : null,
            is_active: formData.is_active,
            allow_coupons: formData.allow_coupons,
            ...(perModelSupported ? { applies_to: selectedOnly ? 'selected' : 'all' } : {}),
        };

        setSaving(true);
        try {
            let promotionId = editingId;
            if (editingId) {
                const { error } = await supabase.from('promotions').update(payload).eq('id', editingId);
                if (error) throw error;
            } else {
                const { data, error } = await supabase.from('promotions').insert([payload]).select('id').single();
                if (error) throw error;
                promotionId = data.id;
            }

            // Modelos de la promoción: se reemplaza la lista completa
            if (perModelSupported && promotionId) {
                const { error: delError } = await supabase.from('promotion_products').delete().eq('promotion_id', promotionId);
                if (delError) throw delError;
                if (selectedOnly) {
                    const rows = formData.product_ids.map(product_id => ({ promotion_id: promotionId, product_id }));
                    const { error: insError } = await supabase.from('promotion_products').insert(rows);
                    if (insError) throw insError;
                }
            }
            handleCancel();
            fetchPromotions();
        } catch (err: unknown) {
            alert(`Error al guardar: ${err instanceof Error ? err.message : String(err)}`);
        } finally {
            setSaving(false);
        }
    };

    const toggleActive = async (p: PromotionRow) => {
        const action = p.is_active ? 'desactivar' : 'activar';
        if (!window.confirm(`¿Seguro que quieres ${action} "${p.name}"? Los precios de la tienda cambian de inmediato.`)) return;
        const { error } = await supabase.from('promotions').update({ is_active: !p.is_active }).eq('id', p.id);
        if (error) alert(`Error: ${error.message}`);
        fetchPromotions();
    };

    const deletePromotion = async (p: PromotionRow) => {
        if (!window.confirm(`¿Eliminar la promoción "${p.name}"? Esta acción no se puede deshacer.`)) return;
        const { error } = await supabase.from('promotions').delete().eq('id', p.id);
        if (error) alert(`Error: ${error.message}`);
        fetchPromotions();
    };

    // Promociones vigentes ahora (a cada modelo le toca la de mayor descuento)
    const live = promotions
        .filter(p => getStatus(p) === 'vigente')
        .filter(p => appliesToOf(p) === 'all' || productIdsOf(p).length > 0)
        .sort((a, b) => b.discount_percent - a.discount_percent);
    const describeScope = (p: PromotionRow) => {
        if (appliesToOf(p) === 'all') return 'Toda la tienda';
        const names = productIdsOf(p).map(productName);
        return names.length <= 3 ? names.join(', ') : `${names.slice(0, 3).join(', ')} y ${names.length - 3} más`;
    };

    const previewPercent = Number(formData.discount_percent) || 0;
    const showsBanner = !!formData.banner_text.trim() || !(perModelSupported && formData.applies_to === 'selected');
    const previewText = formData.banner_text.trim() || `${previewPercent || 'X'}% de descuento en toda la tienda`;
    // Aviso si el texto de la franja menciona otro porcentaje
    const bannerPercent = formData.banner_text.match(/(\d+(?:\.\d+)?)\s*%/);
    const bannerMismatch = !!bannerPercent && previewPercent > 0 && Number(bannerPercent[1]) !== previewPercent;

    if (loading) return <div>Cargando promociones...</div>;

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <div>
                    <h2 className="text-xl font-serif text-charcoal">Promociones</h2>
                    <p className="text-sm text-warm-gray">
                        Descuentos en toda la tienda o en modelos seleccionados: precio normal tachado, franja opcional arriba del sitio y cobro con descuento en Stripe.
                    </p>
                </div>
                <button
                    onClick={() => {
                        if (isFormOpen && !editingId) {
                            handleCancel();
                        } else {
                            setEditingId(null);
                            setFormData(emptyForm());
                            setIsFormOpen(true);
                        }
                    }}
                    className="btn-primary flex items-center gap-2 shrink-0"
                >
                    <Plus size={16} /> Nueva promoción
                </button>
            </div>

            {error && (
                <div className="p-4 rounded-lg border border-red-200 bg-red-50 text-sm text-red-700">
                    No se pudieron cargar las promociones: {error}
                </div>
            )}

            {/* Resumen de lo que ve el cliente ahora */}
            <div className={`p-4 rounded-lg border text-sm ${live.length > 0 ? 'border-green-200 bg-green-50 text-green-800' : 'border-stone-200 bg-stone-50 text-warm-gray'}`}>
                {live.length > 0 ? (
                    <>
                        <strong>Ahora mismo:</strong>
                        <ul className="mt-1 space-y-1">
                            {live.map(p => (
                                <li key={p.id}>
                                    <strong>{p.discount_percent}%</strong> en {describeScope(p).toLowerCase() === 'toda la tienda' ? 'toda la tienda' : describeScope(p)}
                                    {' '}({p.name}) · Termina: {p.ends_at ? formatDate(p.ends_at) : 'sin fecha, hasta desactivarla'}
                                    {p.allow_coupons ? ' · Se permiten cupones' : ' · Sin cupones'}
                                </li>
                            ))}
                        </ul>
                        {live.length > 1 && (
                            <p className="mt-2 flex items-center gap-2 text-amber-700">
                                <AlertTriangle size={16} /> Si a un modelo le tocan varias, se aplica la de mayor descuento (no se suman).
                            </p>
                        )}
                    </>
                ) : (
                    <><strong>Ahora mismo:</strong> no hay promoción vigente; la tienda muestra precios normales.</>
                )}
            </div>

            {isFormOpen && (
                <form onSubmit={handleSave} className="bg-stone-50 p-6 rounded-lg border border-stone-200 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <h3 className="col-span-full font-serif text-lg text-charcoal">
                        {editingId ? 'Editar promoción' : 'Nueva promoción'}
                    </h3>

                    <div>
                        <label className="block text-xs uppercase text-charcoal font-medium mb-1">Nombre interno</label>
                        <input
                            type="text"
                            required
                            placeholder="Ej. Descuento diciembre 2026"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full border border-stone-200 rounded p-2 text-sm"
                        />
                        <p className="text-xs text-warm-gray mt-1">Solo lo ven en el panel. Aparece en el registro del pago.</p>
                    </div>

                    <div>
                        <label className="block text-xs uppercase text-charcoal font-medium mb-1">Descuento (%)</label>
                        <input
                            type="number"
                            required
                            min="1"
                            max={MAX_PERCENT}
                            step="1"
                            placeholder="Ej. 20"
                            value={formData.discount_percent}
                            onChange={(e) => setFormData({ ...formData, discount_percent: e.target.value })}
                            className="w-full border border-stone-200 rounded p-2 text-sm"
                        />
                        {previewPercent > 0 && previewPercent <= MAX_PERCENT && (
                            <p className="text-xs text-warm-gray mt-1">
                                Ejemplo: un zapato de $3,800 queda en ${(Math.round(3800 * (100 - previewPercent)) / 100).toLocaleString('es-MX')}.
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="block text-xs uppercase text-charcoal font-medium mb-1">Empieza (hora de CDMX)</label>
                        <input
                            type="datetime-local"
                            required
                            value={formData.starts_at}
                            onChange={(e) => setFormData({ ...formData, starts_at: e.target.value })}
                            className="w-full border border-stone-200 rounded p-2 text-sm"
                        />
                    </div>

                    <div>
                        <label className="block text-xs uppercase text-charcoal font-medium mb-1">Termina (hora de CDMX)</label>
                        <input
                            type="datetime-local"
                            value={formData.ends_at}
                            onChange={(e) => setFormData({ ...formData, ends_at: e.target.value })}
                            className="w-full border border-stone-200 rounded p-2 text-sm"
                        />
                        <p className="text-xs text-warm-gray mt-1">Déjalo vacío para que dure hasta desactivarla.</p>
                    </div>

                    <div className="col-span-full">
                        <span className="block text-xs uppercase text-charcoal font-medium mb-2">¿A qué aplica?</span>
                        {perModelSupported ? (
                            <>
                                <div className="flex flex-wrap gap-2">
                                    {([['all', 'Toda la tienda'], ['selected', 'Modelos seleccionados']] as const).map(([value, label]) => (
                                        <button
                                            key={value}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, applies_to: value })}
                                            className={`px-4 py-2 rounded-full text-sm border transition-colors ${formData.applies_to === value
                                                ? 'bg-charcoal text-cream border-charcoal'
                                                : 'bg-white text-charcoal border-stone-200 hover:border-charcoal'}`}
                                        >
                                            {label}
                                        </button>
                                    ))}
                                </div>
                                {formData.applies_to === 'selected' && (
                                    <div className="mt-3">
                                        <p className="text-xs text-warm-gray mb-2">
                                            {formData.product_ids.length} modelo(s) elegido(s). Toca un modelo para agregarlo o quitarlo.
                                        </p>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 max-h-80 overflow-y-auto p-1">
                                            {products.map(prod => {
                                                const checked = formData.product_ids.includes(prod.id);
                                                return (
                                                    <button
                                                        key={prod.id}
                                                        type="button"
                                                        onClick={() => toggleProduct(prod.id)}
                                                        aria-pressed={checked}
                                                        className={`flex items-center gap-2 p-2 rounded border text-left transition-colors ${checked
                                                            ? 'border-charcoal bg-white ring-1 ring-charcoal'
                                                            : 'border-stone-200 bg-white hover:border-warm-gray'}`}
                                                    >
                                                        <span className="w-10 h-10 shrink-0 bg-stone-50 rounded overflow-hidden flex items-center justify-center">
                                                            {prod.image && <img src={prod.image} alt="" className="w-full h-full object-contain" />}
                                                        </span>
                                                        <span className="min-w-0">
                                                            <span className="block text-xs font-medium text-charcoal truncate">{prod.name}</span>
                                                            <span className="block text-[11px] text-warm-gray">${prod.price.toLocaleString('es-MX')}</span>
                                                        </span>
                                                        <span className={`ml-auto w-4 h-4 shrink-0 rounded-sm border flex items-center justify-center text-[10px] ${checked ? 'bg-charcoal border-charcoal text-cream' : 'border-stone-300'}`}>
                                                            {checked ? '✓' : ''}
                                                        </span>
                                                    </button>
                                                );
                                            })}
                                            {products.length === 0 && <p className="text-sm text-warm-gray italic">No hay productos.</p>}
                                        </div>
                                    </div>
                                )}
                            </>
                        ) : (
                            <p className="text-xs text-amber-700">
                                Solo toda la tienda. Para elegir modelos, ejecuta promotions_por_modelo.sql en Supabase.
                            </p>
                        )}
                    </div>

                    <div className="col-span-full">
                        <label className="block text-xs uppercase text-charcoal font-medium mb-1">Texto de la franja (opcional)</label>
                        <input
                            type="text"
                            maxLength={120}
                            placeholder={formData.applies_to === 'selected' && perModelSupported
                                ? `${previewPercent || 30}% en modelos seleccionados · Hasta el domingo 20 de diciembre`
                                : `${previewPercent || 20}% de descuento en toda la tienda · Hasta el domingo 20 de diciembre`}
                            value={formData.banner_text}
                            onChange={(e) => setFormData({ ...formData, banner_text: e.target.value })}
                            className="w-full border border-stone-200 rounded p-2 text-sm"
                        />
                        <p className="text-xs text-warm-gray mt-1">
                            {formData.applies_to === 'selected' && perModelSupported
                                ? 'En promociones por modelo la franja solo aparece si escribes un texto, ej. "30% en modelos seleccionados".'
                                : 'Vacío = texto automático ("X% de descuento en toda la tienda").'}
                        </p>
                        {bannerMismatch && (
                            <p className="text-xs text-amber-700 mt-1 flex items-center gap-1">
                                <AlertTriangle size={14} /> El texto dice {bannerPercent?.[1]}% pero el descuento es {previewPercent}%.
                            </p>
                        )}
                        {showsBanner ? (
                            <div className="mt-2 h-8 bg-charcoal text-cream flex items-center justify-center px-4 rounded">
                                <p className="font-montserrat text-[10px] sm:text-xs uppercase tracking-widest truncate">{previewText}</p>
                            </div>
                        ) : (
                            <p className="mt-2 text-xs text-warm-gray italic">Sin texto: esta promoción no muestra franja.</p>
                        )}
                    </div>

                    <label className="flex items-center gap-2 text-sm text-charcoal cursor-pointer">
                        <input
                            type="checkbox"
                            checked={formData.is_active}
                            onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                            className="w-4 h-4"
                        />
                        Activa (se aplica en las fechas indicadas)
                    </label>

                    <label className="flex items-center gap-2 text-sm text-charcoal cursor-pointer">
                        <input
                            type="checkbox"
                            checked={formData.allow_coupons}
                            onChange={(e) => setFormData({ ...formData, allow_coupons: e.target.checked })}
                            className="w-4 h-4"
                        />
                        Permitir cupones además del descuento
                    </label>

                    <div className="col-span-full pt-4 border-t border-stone-200 flex justify-end gap-2">
                        <button type="button" onClick={handleCancel} className="px-4 py-2 text-sm text-warm-gray hover:text-charcoal transition-colors">
                            Cancelar
                        </button>
                        <button type="submit" disabled={saving} className="btn-primary disabled:opacity-50">
                            {saving ? 'Guardando...' : editingId ? 'Guardar cambios' : 'Crear promoción'}
                        </button>
                    </div>
                </form>
            )}

            <div className="bg-white border border-stone-200 rounded-lg overflow-x-auto">
                <table className="w-full text-left text-sm min-w-[860px]">
                    <thead className="bg-stone-50 border-b border-stone-200 text-charcoal">
                        <tr>
                            <th className="p-4 font-medium uppercase tracking-wider text-xs">Promoción</th>
                            <th className="p-4 font-medium uppercase tracking-wider text-xs">Descuento</th>
                            <th className="p-4 font-medium uppercase tracking-wider text-xs">Aplica a</th>
                            <th className="p-4 font-medium uppercase tracking-wider text-xs">Vigencia (CDMX)</th>
                            <th className="p-4 font-medium uppercase tracking-wider text-xs">Cupones</th>
                            <th className="p-4 font-medium uppercase tracking-wider text-xs text-center">Estado</th>
                            <th className="p-4 font-medium uppercase tracking-wider text-xs text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                        {promotions.map(p => {
                            const status = getStatus(p);
                            return (
                                <tr key={p.id} className="hover:bg-stone-50 transition-colors align-top">
                                    <td className="p-4">
                                        <p className="font-medium text-charcoal">{p.name}</p>
                                        {p.banner_text && <p className="text-xs text-warm-gray mt-1">{p.banner_text}</p>}
                                    </td>
                                    <td className="p-4 text-charcoal font-medium">{p.discount_percent}%</td>
                                    <td className="p-4 text-warm-gray text-xs max-w-[180px]">
                                        {describeScope(p)}
                                        {appliesToOf(p) === 'selected' && productIdsOf(p).length === 0 && (
                                            <span className="block text-amber-700">Sin modelos: no aplica</span>
                                        )}
                                    </td>
                                    <td className="p-4 text-warm-gray text-xs leading-relaxed">
                                        {formatDate(p.starts_at)}<br />→ {formatDate(p.ends_at)}
                                    </td>
                                    <td className="p-4 text-warm-gray">{p.allow_coupons ? 'Sí' : 'No'}</td>
                                    <td className="p-4 text-center">
                                        <span className={`inline-block text-xs px-2 py-1 rounded-full border ${STATUS_STYLES[status]}`}>
                                            {STATUS_LABELS[status]}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex justify-end items-center gap-2">
                                            <button
                                                onClick={() => toggleActive(p)}
                                                className="text-xs px-3 py-1 rounded border border-stone-200 hover:border-charcoal transition-colors"
                                            >
                                                {p.is_active ? 'Desactivar' : 'Activar'}
                                            </button>
                                            <button
                                                onClick={() => handleEditClick(p)}
                                                title="Editar"
                                                className="text-warm-gray hover:text-charcoal p-2 rounded-full hover:bg-stone-100 transition-colors"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button
                                                onClick={() => deletePromotion(p)}
                                                title="Eliminar"
                                                className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-50 transition-colors"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                        {promotions.length === 0 && (
                            <tr>
                                <td colSpan={7} className="p-8 text-center text-warm-gray italic">No hay promociones creadas</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
