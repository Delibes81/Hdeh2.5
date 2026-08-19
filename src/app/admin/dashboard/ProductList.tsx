import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { Product } from '../../../types';
import { Edit, Trash2, Plus, Search, Loader2, ArrowUpDown, ChevronDown, ChevronLeft, ChevronRight, X } from 'lucide-react';
import ProductForm from './ProductForm';
import { formatPrice } from '../../../utils/format';

export default function ProductList() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortOption, setSortOption] = useState('date-desc');

    // Modal State
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

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
                featuredOrder: item.featured_order || 0,
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
    ).sort((a, b) => {
        switch (sortOption) {
            case 'price-asc':
                return a.price - b.price;
            case 'price-desc':
                return b.price - a.price;
            case 'name-asc':
                return a.name.localeCompare(b.name);
            case 'name-desc':
                return b.name.localeCompare(a.name);
            case 'stock-asc':
                return calculateTotalStock(a) - calculateTotalStock(b);
            case 'stock-desc':
                return calculateTotalStock(b) - calculateTotalStock(a);
            default:
                return 0; // Keep original order (created_at desc from query)
        }
    });

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
                <h2 className="font-serif text-2xl font-light uppercase tracking-wide text-charcoal">Inventario</h2>

                <button
                    onClick={handleCreate}
                    className="btn-primary flex items-center justify-center gap-2"
                >
                    <Plus size={18} strokeWidth={1.5} />
                    Nuevo Producto
                </button>
            </div>

            <div className="bg-white rounded-lg border border-stone/20 overflow-hidden">
                {/* Filter Bar */}
                <div className="p-4 border-b border-stone/20 bg-stone/5 flex flex-col md:flex-row gap-4 justify-between">
                    <div className="relative max-w-md w-full">
                        <Search className="absolute left-3 top-2.5 text-warm-gray/50" size={18} />
                        <input
                            type="text"
                            placeholder="Buscar por nombre o categoría..."
                            className="w-full pl-10 pr-10 py-2 border border-stone/20 rounded focus:outline-none focus:border-charcoal"
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setCurrentPage(1); // Reset to first page on filter change
                            }}
                        />
                        {searchTerm && (
                            <button
                                onClick={() => {
                                    setSearchTerm('');
                                    setCurrentPage(1);
                                }}
                                className="absolute right-3 top-2.5 text-warm-gray/50 hover:text-charcoal transition-colors"
                            >
                                <X size={18} />
                            </button>
                        )}
                    </div>

                    <div className="relative w-full md:w-48">
                        <ArrowUpDown className="absolute left-3 top-2.5 text-warm-gray/50" size={18} />
                        <select
                            value={sortOption}
                            onChange={(e) => setSortOption(e.target.value)}
                            className="w-full pl-10 pr-8 py-2 border border-stone/20 rounded bg-white appearance-none cursor-pointer focus:outline-none focus:border-charcoal text-sm text-charcoal"
                        >
                            <option value="date-desc">Más recientes</option>
                            <option value="price-asc">Menor Precio</option>
                            <option value="price-desc">Mayor Precio</option>
                            <option value="stock-asc">Menor Stock</option>
                            <option value="stock-desc">Mayor Stock</option>
                            <option value="name-asc">Nombre (A-Z)</option>
                            <option value="name-desc">Nombre (Z-A)</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-2.5 text-warm-gray/50 pointer-events-none" size={16} />
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-stone/5 text-warm-gray text-xs uppercase tracking-wider font-sans">
                                <th className="p-4 font-medium">Producto</th>
                                <th className="p-4 font-medium">Categoría</th>
                                <th className="p-4 font-medium">Precio</th>
                                <th className="p-4 font-medium">Stock Total</th>
                                <th className="p-4 font-medium text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-stone/20">
                            {/* Pagination Logic */}
                            {(() => {
                                const indexOfLastItem = currentPage * itemsPerPage;
                                const indexOfFirstItem = indexOfLastItem - itemsPerPage;
                                const currentItems = filteredProducts.slice(indexOfFirstItem, indexOfLastItem);

                                return currentItems.map(product => {
                                    const totalStock = calculateTotalStock(product);
                                    const isLowStock = totalStock < 5;
                                    const isOutStock = totalStock === 0;

                                    return (
                                        <tr key={product.id} className="hover:bg-off-white/50 transition-colors">
                                            <td className="p-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-12 aspect-[4/5] bg-white rounded overflow-hidden flex-shrink-0">
                                                        {product.images[0] && (
                                                            <img src={product.images[0]} alt="" className="w-full h-full object-contain p-1" />
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
                                                    {product.category === 'zapatos-bajos' ? 'Zapatos bajos' :
                                                        product.category === 'zapatos-altos' ? 'Zapatos Altos' :
                                                            product.category === 'botas' ? 'Botas' : product.category}
                                                </span>
                                            </td>
                                            <td className="p-4 font-medium text-charcoal">{formatPrice(product.price)}</td>
                                            <td className="p-4">
                                                <div className="mb-2">
                                                    <span className={`text-xs font-sans font-bold px-3 py-1 rounded-full border inline-block ${isOutStock ? 'border-charcoal bg-charcoal text-cream' : isLowStock ? 'border-stone/20 bg-stone/5 text-charcoal' : 'border-stone/20 bg-transparent text-warm-gray'
                                                        }`}>
                                                        {totalStock} unidades
                                                    </span>
                                                </div>
                                                <div className="text-xs text-warm-gray">
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
                                });
                            })()}
                        </tbody>
                    </table>
                </div>

                {filteredProducts.length === 0 && !loading && (
                    <div className="p-12 text-center text-warm-gray">
                        No se encontraron productos.
                    </div>
                )}

                {/* Pagination Controls */}
                {filteredProducts.length > 0 && (
                    <div className="p-4 border-t border-stone/20 flex items-center justify-between">
                        <div className="text-sm text-warm-gray">
                            Mostrando <span className="font-medium text-charcoal">{Math.min((currentPage * itemsPerPage), filteredProducts.length)}</span> de <span className="font-medium text-charcoal">{filteredProducts.length}</span> productos
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className="p-2 border border-stone/20 rounded hover:bg-stone/5 disabled:opacity-50 disabled:cursor-not-allowed text-charcoal transition-colors"
                            >
                                <ChevronLeft size={18} />
                            </button>
                            {Array.from({ length: Math.ceil(filteredProducts.length / itemsPerPage) }).map((_, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setCurrentPage(idx + 1)}
                                    className={`w-9 h-9 border rounded text-sm font-medium transition-colors ${currentPage === idx + 1
                                        ? 'bg-charcoal text-white border-charcoal'
                                        : 'border-stone/20 text-charcoal hover:bg-stone/5'
                                        }`}
                                >
                                    {idx + 1}
                                </button>
                            ))}
                            <button
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(filteredProducts.length / itemsPerPage)))}
                                disabled={currentPage === Math.ceil(filteredProducts.length / itemsPerPage)}
                                className="p-2 border border-stone/20 rounded hover:bg-stone/5 disabled:opacity-50 disabled:cursor-not-allowed text-charcoal transition-colors"
                            >
                                <ChevronRight size={18} />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {
                isFormOpen && (
                    <ProductForm
                        product={editingProduct}
                        onClose={() => setIsFormOpen(false)}
                        onSave={handleFormSave}
                    />
                )
            }
        </div >
    );
}

