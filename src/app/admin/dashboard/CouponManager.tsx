'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { Plus, Trash2, Edit2, CheckCircle, XCircle } from 'lucide-react';

interface Coupon {
  id: string;
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  is_active: boolean;
  usage_limit: number | null;
  used_count: number;
}

export default function CouponManager() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    code: '',
    discount_type: 'percentage',
    discount_value: '',
    is_active: true,
    usage_limit: ''
  });

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCoupons(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        code: formData.code.toUpperCase().trim(),
        discount_type: formData.discount_type,
        discount_value: Number(formData.discount_value),
        is_active: formData.is_active,
        usage_limit: formData.usage_limit ? Number(formData.usage_limit) : null
      };

      if (editingId) {
        const { error } = await supabase.from('coupons').update(payload).eq('id', editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('coupons').insert([payload]);
        if (error) throw error;
      }
      
      setFormData({
        code: '',
        discount_type: 'percentage',
        discount_value: '',
        is_active: true,
        usage_limit: ''
      });
      setEditingId(null);
      setIsFormOpen(false);
      fetchCoupons();
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
  };

  const toggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('coupons')
        .update({ is_active: !currentStatus })
        .eq('id', id);

      if (error) throw error;
      fetchCoupons();
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
  };

  const deleteCoupon = async (id: string) => {
    if (!window.confirm('¿Seguro que deseas eliminar este cupón?')) return;
    try {
      const { error } = await supabase
        .from('coupons')
        .delete()
        .eq('id', id);

      if (error) throw error;
      fetchCoupons();
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
  };

  const handleEditClick = (coupon: Coupon) => {
    setEditingId(coupon.id);
    setFormData({
      code: coupon.code,
      discount_type: coupon.discount_type,
      discount_value: coupon.discount_value.toString(),
      is_active: coupon.is_active,
      usage_limit: coupon.usage_limit ? coupon.usage_limit.toString() : ''
    });
    setIsFormOpen(true);
  };

  const handleCancel = () => {
    setIsFormOpen(false);
    setEditingId(null);
    setFormData({
      code: '',
      discount_type: 'percentage',
      discount_value: '',
      is_active: true,
      usage_limit: ''
    });
  };

  if (loading) return <div>Cargando cupones...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-serif text-charcoal">Gestión de Cupones</h2>
          <p className="text-sm text-warm-gray">Crea y administra los códigos de descuento.</p>
        </div>
        <button
          onClick={() => {
            setEditingId(null);
            setFormData({ code: '', discount_type: 'percentage', discount_value: '', is_active: true, usage_limit: '' });
            setIsFormOpen(!isFormOpen);
          }}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={16} /> Nuevo Cupón
        </button>
      </div>

      {isFormOpen && (
        <form onSubmit={handleSaveCoupon} className="bg-stone-50 p-6 rounded-lg border border-stone-200 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs uppercase text-charcoal font-medium mb-1">Código</label>
            <input
              type="text"
              required
              placeholder="Ej. VERANO20"
              value={formData.code}
              onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})}
              className="w-full border border-stone-200 rounded p-2 text-sm uppercase"
            />
          </div>
          <div>
            <label className="block text-xs uppercase text-charcoal font-medium mb-1">Tipo de Descuento</label>
            <select
              value={formData.discount_type}
              onChange={(e) => setFormData({...formData, discount_type: e.target.value})}
              className="w-full border border-stone-200 rounded p-2 text-sm"
            >
              <option value="percentage">Porcentaje (%)</option>
              <option value="fixed">Monto Fijo ($)</option>
            </select>
          </div>
          <div>
            <label className="block text-xs uppercase text-charcoal font-medium mb-1">Valor</label>
            <input
              type="number"
              required
              min="1"
              step="0.01"
              value={formData.discount_value}
              onChange={(e) => setFormData({...formData, discount_value: e.target.value})}
              className="w-full border border-stone-200 rounded p-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs uppercase text-charcoal font-medium mb-1">Límite de Uso (Opcional)</label>
            <input
              type="number"
              min="1"
              placeholder="Dejar vacío para ilimitado"
              value={formData.usage_limit}
              onChange={(e) => setFormData({...formData, usage_limit: e.target.value})}
              className="w-full border border-stone-200 rounded p-2 text-sm"
            />
          </div>
          <div className="col-span-full pt-4 border-t border-stone-200 flex justify-end gap-2">
            <button type="button" onClick={handleCancel} className="px-4 py-2 text-sm text-warm-gray hover:text-charcoal transition-colors">Cancelar</button>
            <button type="submit" className="btn-primary">{editingId ? 'Actualizar Cupón' : 'Guardar Cupón'}</button>
          </div>
        </form>
      )}

      <div className="bg-white border border-stone-200 rounded-lg overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-stone-50 border-b border-stone-200 text-charcoal">
            <tr>
              <th className="p-4 font-medium uppercase tracking-wider text-xs">Código</th>
              <th className="p-4 font-medium uppercase tracking-wider text-xs">Descuento</th>
              <th className="p-4 font-medium uppercase tracking-wider text-xs">Usos</th>
              <th className="p-4 font-medium uppercase tracking-wider text-xs text-center">Estado</th>
              <th className="p-4 font-medium uppercase tracking-wider text-xs text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {coupons.map(coupon => (
              <tr key={coupon.id} className="hover:bg-stone-50 transition-colors">
                <td className="p-4 font-medium text-charcoal">{coupon.code}</td>
                <td className="p-4 text-warm-gray">
                  {coupon.discount_type === 'percentage' ? `${coupon.discount_value}%` : `$${coupon.discount_value} MXN`}
                </td>
                <td className="p-4 text-warm-gray">
                  {coupon.usage_limit ? `${coupon.used_count} / ${coupon.usage_limit}` : `${coupon.used_count} / Ilimitado`}
                </td>
                <td className="p-4 text-center">
                  <button onClick={() => toggleActive(coupon.id, coupon.is_active)} className="inline-flex">
                    {coupon.is_active ? <CheckCircle size={20} className="text-green-500" /> : <XCircle size={20} className="text-stone-300" />}
                  </button>
                </td>
                <td className="p-4 text-right flex justify-end gap-2">
                  <button onClick={() => handleEditClick(coupon)} className="text-warm-gray hover:text-charcoal p-2 rounded-full hover:bg-stone-100 transition-colors">
                    <Edit2 size={16} />
                  </button>
                  <button onClick={() => deleteCoupon(coupon.id)} className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-50 transition-colors">
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
            {coupons.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-warm-gray italic">No hay cupones creados</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
