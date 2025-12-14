import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Product } from '../../types';
import { Edit, Trash2, Plus, Search, Loader2 } from 'lucide-react';
import ProductForm from './ProductForm';

export default function ProductList() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Modal State
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('products')
                .select(`
          *,
          variants:product_variants(*)
        `)
                .order('created_at', { ascending: false });

            if (error) throw error;

            // Map basic fields, variants are now included
            const mappedProducts: Product[] = (data || []).map(item => ({
                id: item.id,
                name: item.name,
                price: item.price,
                category: item.category,
                images: item.images || [],
                description: item.description,
                isHandcrafted: item.is_handcrafted,
                isFeatured: item.is_featured,
                materials: item.materials || [],
                dimensions: item.dimensions,
                variants: item.variants || []
            }));

            setProducts(mappedProducts);
        } catch (error) {
            console.error('Error fetching products:', error);
            alert('Error cargando productos');
        } finally {
            setLoading(false);
        }
    };

    const calculateTotalStock = (product: Product) => {
        return product.variants?.reduce((acc, curr) => acc + curr.stock, 0) || 0;
    };

    const handleCreate = () => {
        setEditingProduct(null);
        setIsFormOpen(true);
    };

    const handleEdit = (product: Product) => {
        setEditingProduct(product);
        setIsFormOpen(true);
    };

    const handleDelete = async (productId: string) => {
        if (!confirm('¿Estás seguro de eliminar este producto? Esta acción no se puede deshacer y eliminará todas las variantes.')) return;

        try {
            const { error } = await supabase.from('products').delete().eq('id', productId);
            if (error) throw error;

            setProducts(products.filter(p => p.id !== productId));
        } catch (error: any) {
            alert('Error eliminando producto: ' + error.message);
        }
    };

    const handleFormSave = () => {
        fetchProducts(); // Refresh list
        setIsFormOpen(false);
    };

    const filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading && products.length === 0) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="animate-spin text-charcoal" size={48} />
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h2 className="font-serif text-2xl text-charcoal">Inventario</h2>

                <button
                    onClick={handleCreate}
                    className="btn-primary bg-charcoal text-white flex items-center justify-center gap-2"
                >
                    <Plus size={18} />
                    Nuevo Producto
                </button>
            </div>

            <div className="bg-white rounded-lg border border-stone/20 overflow-hidden">
                {/* Search Bar */}
                <div className="p-4 border-b border-stone/10 bg-stone/5">
                    <div className="relative max-w-md">
                        <Search className="absolute left-3 top-2.5 text-warm-gray/50" size={18} />
                        <input
                            type="text"
                            placeholder="Buscar por nombre o categoría..."
                            className="w-full pl-10 pr-4 py-2 border border-stone/20 rounded focus:outline-none focus:border-charcoal"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-stone/5 text-warm-gray text-xs uppercase tracking-wider">
                                <th className="p-4 font-medium">Producto</th>
                                <th className="p-4 font-medium">Categoría</th>
                                <th className="p-4 font-medium">Precio</th>
                                <th className="p-4 font-medium">Stock Total</th>
                                <th className="p-4 font-medium text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-stone/10">
                            {filteredProducts.map(product => {
                                const totalStock = calculateTotalStock(product);
                                const isLowStock = totalStock < 5;
                                const isOutStock = totalStock === 0;

                                return (
                                    <tr key={product.id} className="hover:bg-off-white/50 transition-colors">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 bg-stone/10 rounded overflow-hidden flex-shrink-0">
                                                    {product.images[0] && (
                                                        <img src={product.images[0]} alt="" className="w-full h-full object-cover" />
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-charcoal">{product.name}</p>
                                                    <p className="text-xs text-warm-gray truncate max-w-[200px]">{product.description}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className="capitalize px-2 py-1 bg-stone/10 text-warm-gray text-xs rounded-full">
                                                {product.category}
                                            </span>
                                        </td>
                                        <td className="p-4 font-medium text-charcoal">${product.price}</td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-2">
                                                <span className={`w-2 h-2 rounded-full ${isOutStock ? 'bg-red-500' : isLowStock ? 'bg-amber-500' : 'bg-emerald-500'}`}></span>
                                                <span className={isOutStock ? 'text-red-600' : isLowStock ? 'text-amber-600' : 'text-emerald-700'}>
                                                    {totalStock} unidades
                                                </span>
                                            </div>
                                            <div className="text-xs text-warm-gray mt-1">
                                                {product.variants?.map(v => `${v.size.replace(' MX', '')}: ${v.stock}`).join(', ')}
                                            </div>
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => handleEdit(product)}
                                                    className="p-2 text-warm-gray hover:text-charcoal hover:bg-stone/10 rounded transition-colors"
                                                >
                                                    <Edit size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(product.id)}
                                                    className="p-2 text-warm-gray hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {filteredProducts.length === 0 && !loading && (
                    <div className="p-12 text-center text-warm-gray">
                        No se encontraron productos.
                    </div>
                )}
            </div>

            {isFormOpen && (
                <ProductForm
                    product={editingProduct}
                    onClose={() => setIsFormOpen(false)}
                    onSave={handleFormSave}
                />
            )}
        </div>
    );
}
