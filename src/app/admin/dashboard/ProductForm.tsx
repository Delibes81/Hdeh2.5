import { useState, useEffect } from 'react';
import { Product, ProductVariant } from '../../../types';
import { supabase } from '../../../lib/supabase';
import { X, Upload, Plus, Trash2, Loader2, Save, ChevronLeft, ChevronRight, Edit } from 'lucide-react';

const formatBytes = (bytes: number, decimals = 2) => {
    if (!+bytes) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
};

interface ProductFormProps {
    product?: Product | null;
    onClose: () => void;
    onSave: () => void;
}

export default function ProductForm({ product, onClose, onSave }: ProductFormProps) {
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<'details' | 'variants' | 'images'>('details');

    // Form State
    const [name, setName] = useState(product?.name || '');
    const [price, setPrice] = useState(product?.price?.toString() || '');
    const [description, setDescription] = useState(product?.description || '');
    const [category, setCategory] = useState<Product['category']>(product?.category || 'zapatos-bajos');
    const [materials, setMaterials] = useState<string[]>(product?.materials || []);
    const [materialInput, setMaterialInput] = useState('');
    const [images, setImages] = useState<string[]>(product?.images || []);
    const [isFeatured, setIsFeatured] = useState(product?.isFeatured || false);
    const [isMadeToOrder, setIsMadeToOrder] = useState(product?.isMadeToOrder || false);
    const [featuredOrder, setFeaturedOrder] = useState(product?.featuredOrder?.toString() || '0');
    const [uploading, setUploading] = useState(false);
    const [optimizationMsg, setOptimizationMsg] = useState<{ original: number; optimized: number } | null>(null);

    // Variants State
    const [variants, setVariants] = useState<ProductVariant[]>(product?.variants || []);
    const [newSize, setNewSize] = useState('');
    const [newStock, setNewStock] = useState('');
    const [editingVariantIdx, setEditingVariantIdx] = useState<number | null>(null);
    const [editingStock, setEditingStock] = useState<string>('');

    // Save Handler
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Ensure any pending inline edit is applied
            let finalVariants = [...variants];
            if (editingVariantIdx !== null) {
                const parsed = parseInt(editingStock, 10);
                const stock = isNaN(parsed) ? 0 : parsed;
                if (stock >= 0) {
                    finalVariants[editingVariantIdx] = { ...finalVariants[editingVariantIdx], stock };
                    setVariants(finalVariants);
                }
                setEditingVariantIdx(null);
            }

            const productData = {
                name,
                price: parseFloat(price),
                description,
                category,
                materials,
                images,
                // Default flags
                is_handcrafted: product?.isHandcrafted ?? true,
                is_featured: isFeatured,
                is_made_to_order: isMadeToOrder,
                featured_order: parseInt(featuredOrder) || 0,
            };

            let productId = product?.id;

            if (product) {
                // Update
                const { error } = await supabase
                    .from('products')
                    .update(productData)
                    .eq('id', product.id);
                if (error) throw error;
            } else {
                // Create
                const { data, error } = await supabase
                    .from('products')
                    .insert(productData)
                    .select()
                    .single();
                if (error) throw error;
                productId = data.id;
            }

            // Handle Variants (Upsert/Delete strategy is complex, let's keep it simple: Delete all and re-insert for now, or careful upsert)
            // For simplicity in this iteration: We will delete all variants for this product and re-insert current state.
            // NOTE: In production, better to accept IDs to update specific rows to preserve integrity if needed.

            if (productId) {
                // Delete existing variants
                await supabase.from('product_variants').delete().eq('product_id', productId);

                // Insert new variants
                if (finalVariants.length > 0) {
                    const variantsToInsert = finalVariants.map(v => ({
                        product_id: productId,
                        size: v.size.includes('MX') ? v.size : `${v.size} MX`,
                        stock: v.stock
                    }));

                    const { error: variantError } = await supabase
                        .from('product_variants')
                        .insert(variantsToInsert);

                    if (variantError) throw variantError;
                }
            }

            onSave();
            onClose();
        } catch (error: any) {
            alert('Error guardando producto: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleAddMaterial = () => {
        if (materialInput.trim()) {
            setMaterials([...materials, materialInput.trim()]);
            setMaterialInput('');
        }
    };

    const removeMaterial = (index: number) => {
        setMaterials(materials.filter((_, i) => i !== index));
    };

    const handleAddVariant = () => {
        if (newSize && newStock) {
            setVariants([...variants, {
                id: Math.random().toString(), // Temp ID
                size: newSize,
                stock: parseInt(newStock)
            }]);
            setNewSize('');
            setNewStock('');
        }
    };

    const removeVariant = (index: number) => {
        setVariants(variants.filter((_, i) => i !== index));
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;

        setUploading(true);
        setOptimizationMsg(null);
        const file = e.target.files[0];

        try {
            const optimizeImage = (file: File): Promise<{ blob: Blob, originalSize: number, optimizedSize: number }> => {
                return new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                        const img = new Image();
                        img.onload = () => {
                            const canvas = document.createElement('canvas');
                            let width = img.width;
                            let height = img.height;
                            
                            const MAX_SIZE = 1200;
                            if (width > height) {
                                if (width > MAX_SIZE) {
                                    height *= MAX_SIZE / width;
                                    width = MAX_SIZE;
                                }
                            } else {
                                if (height > MAX_SIZE) {
                                    width *= MAX_SIZE / height;
                                    height = MAX_SIZE;
                                }
                            }
                            
                            canvas.width = width;
                            canvas.height = height;
                            const ctx = canvas.getContext('2d');
                            if (!ctx) return reject(new Error('No canvas context'));
                            
                            ctx.drawImage(img, 0, 0, width, height);
                            canvas.toBlob((blob) => {
                                if (blob) {
                                    resolve({
                                        blob,
                                        originalSize: file.size,
                                        optimizedSize: blob.size
                                    });
                                } else {
                                    reject(new Error('Error en toBlob'));
                                }
                            }, 'image/webp', 0.85);
                        };
                        img.onerror = () => reject(new Error('Error cargando imagen para optimizar'));
                        img.src = event.target?.result as string;
                    };
                    reader.onerror = () => reject(new Error('Error leyendo archivo'));
                    reader.readAsDataURL(file);
                });
            };

            const optimized = await optimizeImage(file);
            setOptimizationMsg({ original: optimized.originalSize, optimized: optimized.optimizedSize });
            
            const fileName = `${Math.random().toString(36).substring(2, 15)}.webp`;
            const filePath = `${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('product-images')
                .upload(filePath, optimized.blob, {
                    contentType: 'image/webp'
                });

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('product-images')
                .getPublicUrl(filePath);

            setImages([...images, publicUrl]);
        } catch (error: any) {
            alert('Error subiendo imagen: ' + error.message);
        } finally {
            setUploading(false);
        }
    };

    const moveImage = (index: number, direction: 'left' | 'right') => {
        const newImages = [...images];
        if (direction === 'left') {
            if (index === 0) return;
            [newImages[index - 1], newImages[index]] = [newImages[index], newImages[index - 1]];
        } else {
            if (index === images.length - 1) return;
            [newImages[index], newImages[index + 1]] = [newImages[index + 1], newImages[index]];
        }
        setImages(newImages);
    };

    return (
        <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-lg shadow-sm border border-stone/20 w-full max-w-4xl max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-stone/20">
                    <h2 className="font-serif text-2xl font-light uppercase tracking-wide text-charcoal">
                        {product ? 'Editar Producto' : 'Nuevo Producto'}
                    </h2>
                    <button onClick={onClose} className="text-warm-gray hover:text-charcoal">
                        <X size={24} />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-stone/20 bg-stone/5">
                    <button
                        onClick={() => setActiveTab('details')}
                        className={`flex-1 py-3 text-xs font-sans uppercase tracking-wide font-medium transition-colors ${activeTab === 'details' ? 'bg-white border-t-2 border-charcoal text-charcoal' : 'text-warm-gray hover:text-charcoal'}`}
                    >
                        Detalles
                    </button>
                    <button
                        onClick={() => setActiveTab('variants')}
                        className={`flex-1 py-3 text-xs font-sans uppercase tracking-wide font-medium transition-colors ${activeTab === 'variants' ? 'bg-white border-t-2 border-charcoal text-charcoal' : 'text-warm-gray hover:text-charcoal'}`}
                    >
                        Tallas y Stock
                    </button>
                    <button
                        onClick={() => setActiveTab('images')}
                        className={`flex-1 py-3 text-xs font-sans uppercase tracking-wide font-medium transition-colors ${activeTab === 'images' ? 'bg-white border-t-2 border-charcoal text-charcoal' : 'text-warm-gray hover:text-charcoal'}`}
                    >
                        Imágenes
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    <form id="product-form" onSubmit={handleSubmit} className="space-y-6">

                        {/* DETAILS TAB */}
                        {activeTab === 'details' && (
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-warm-gray mb-1">Nombre</label>
                                        <input
                                            type="text"
                                            required
                                            value={name}
                                            onChange={e => setName(e.target.value)}
                                            className="w-full p-2 border border-stone/20 rounded focus:border-charcoal outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-warm-gray mb-1">Precio</label>
                                        <input
                                            type="number"
                                            required
                                            min="0"
                                            step="0.01"
                                            value={price}
                                            onChange={e => setPrice(e.target.value)}
                                            className="w-full p-2 border border-stone/20 rounded focus:border-charcoal outline-none"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-warm-gray mb-1">Categoría</label>
                                    <select
                                        value={category}
                                        onChange={e => setCategory(e.target.value as any)}
                                        className="w-full p-2 border border-stone/20 rounded focus:border-charcoal outline-none bg-white"
                                    >
                                        <option value="zapatos-bajos">Zapatos bajos</option>
                                        <option value="zapatos-altos">Zapatos Altos</option>
                                        <option value="botas">Botas</option>
                                    </select>
                                </div>
                                <div className="flex items-center gap-2 pt-6">
                                    <input
                                        type="checkbox"
                                        id="isFeatured"
                                        checked={isFeatured}
                                        onChange={e => setIsFeatured(e.target.checked)}
                                        className="w-4 h-4 text-charcoal border-stone/20 rounded focus:ring-charcoal"
                                    />
                                    <label htmlFor="isFeatured" className="text-sm font-medium text-charcoal cursor-pointer">
                                        Destacado (Mostrar en Inicio)
                                    </label>

                                    {isFeatured && (
                                        <div className="ml-8 flex items-center gap-2">
                                            <label className="text-sm font-medium text-warm-gray">Orden:</label>
                                            <input
                                                type="number"
                                                value={featuredOrder}
                                                onChange={e => setFeaturedOrder(e.target.value)}
                                                className="w-16 p-1 border border-stone/20 rounded focus:border-charcoal outline-none text-center"
                                            />
                                            <span className="text-xs text-warm-gray">(1 = Primero)</span>
                                        </div>
                                    )}
                                </div>
                                
                                <div className="flex items-center gap-2 pt-2">
                                    <input
                                        type="checkbox"
                                        id="isMadeToOrder"
                                        checked={isMadeToOrder}
                                        onChange={e => setIsMadeToOrder(e.target.checked)}
                                        className="w-4 h-4 text-charcoal border-stone/20 rounded focus:ring-charcoal"
                                    />
                                    <label htmlFor="isMadeToOrder" className="text-sm font-medium text-charcoal cursor-pointer">
                                        Producto bajo pedido (Requiere encargo por WhatsApp)
                                    </label>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-warm-gray mb-1">Descripción</label>
                                    <textarea
                                        rows={4}
                                        required
                                        value={description}
                                        onChange={e => setDescription(e.target.value)}
                                        className="w-full p-2 border border-stone/20 rounded focus:border-charcoal outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-warm-gray mb-1">Materiales</label>
                                    <div className="flex gap-2 mb-2">
                                        <input
                                            type="text"
                                            value={materialInput}
                                            onChange={e => setMaterialInput(e.target.value)}
                                            className="flex-1 p-2 border border-stone/20 rounded focus:border-charcoal outline-none"
                                            placeholder="Ej: Piel genuina, Suela sintética..."
                                            onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddMaterial())}
                                        />
                                        <button
                                            type="button"
                                            onClick={handleAddMaterial}
                                            className="px-4 py-2 bg-stone/10 hover:bg-stone/20 rounded text-charcoal font-medium"
                                        >
                                            Agregar
                                        </button>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {materials.map((mat, idx) => (
                                            <span key={idx} className="bg-stone/10 px-2 py-1 rounded text-xs flex items-center gap-1">
                                                {mat}
                                                <button type="button" onClick={() => removeMaterial(idx)} className="hover:text-red-600"><X size={12} /></button>
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* VARIANTS TAB */}
                        {activeTab === 'variants' && (
                            <div className="space-y-6">
                                <div className="bg-stone/5 p-4 rounded-lg flex items-end gap-4">
                                    <div>
                                        <label className="block text-xs font-medium text-warm-gray mb-1">Talla (ej: 24, 25.5)</label>
                                        <input
                                            type="text"
                                            value={newSize}
                                            onChange={e => setNewSize(e.target.value)}
                                            className="w-24 p-2 border border-stone/20 rounded outline-none"
                                            placeholder="24"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-warm-gray mb-1">Stock</label>
                                        <input
                                            type="number"
                                            value={newStock}
                                            onChange={e => setNewStock(e.target.value)}
                                            className="w-24 p-2 border border-stone/20 rounded outline-none"
                                            placeholder="10"
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleAddVariant}
                                        className="btn-primary py-2 px-6 flex items-center justify-center gap-2 text-xs"
                                    >
                                        <Plus size={16} strokeWidth={1.5} /> Agregar Talla
                                    </button>
                                </div>

                                <div className="border border-stone/20 rounded-lg overflow-hidden">
                                    <table className="w-full text-left">
                                        <thead className="bg-stone/5 text-xs text-warm-gray uppercase">
                                            <tr>
                                                <th className="p-3">Talla</th>
                                                <th className="p-3">Stock</th>
                                                <th className="p-3 text-right">Acciones</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-stone/10">
                                            {variants.map((variant, idx) => (
                                                <tr key={idx}>
                                                    <td className="p-3 font-medium">{variant.size.replace(' MX', '')}</td>
                                                    <td className="p-3">
                                                        {editingVariantIdx === idx ? (
                                                            <input 
                                                                type="number" 
                                                                min="0"
                                                                className="w-20 p-1 border border-stone/20 rounded outline-none" 
                                                                value={editingStock} 
                                                                onChange={(e) => setEditingStock(e.target.value)}
                                                                autoFocus
                                                            />
                                                        ) : (
                                                            variant.stock
                                                        )}
                                                    </td>
                                                    <td className="p-3 text-right">
                                                        {editingVariantIdx === idx ? (
                                                            <div className="flex justify-end gap-2">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => {
                                                                        const parsed = parseInt(editingStock, 10);
                                                                        const stock = isNaN(parsed) ? 0 : parsed;
                                                                        if (stock >= 0) {
                                                                            const newVariants = [...variants];
                                                                            newVariants[idx] = { ...newVariants[idx], stock };
                                                                            setVariants(newVariants);
                                                                        }
                                                                        setEditingVariantIdx(null);
                                                                    }}
                                                                    className="text-green-600 hover:text-green-700"
                                                                    title="Guardar"
                                                                >
                                                                    <Save size={16} />
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => setEditingVariantIdx(null)}
                                                                    className="text-warm-gray hover:text-charcoal"
                                                                    title="Cancelar"
                                                                >
                                                                    <X size={16} />
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <div className="flex justify-end gap-2">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => {
                                                                        setEditingVariantIdx(idx);
                                                                        setEditingStock(variant.stock.toString());
                                                                    }}
                                                                    className="text-warm-gray hover:text-charcoal"
                                                                    title="Editar stock"
                                                                >
                                                                    <Edit size={16} />
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => removeVariant(idx)}
                                                                    className="text-warm-gray hover:text-red-600"
                                                                    title="Eliminar"
                                                                >
                                                                    <Trash2 size={16} />
                                                                </button>
                                                            </div>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                            {variants.length === 0 && (
                                                <tr>
                                                    <td colSpan={3} className="p-8 text-center text-warm-gray italic">
                                                        No hay tallas configuradas.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* IMAGES TAB */}
                        {activeTab === 'images' && (
                            <div className="space-y-6">
                                <div className="flex items-center justify-center w-full">
                                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-warm-gray/30 border-dashed rounded-lg cursor-pointer bg-stone/5 hover:bg-stone/10 transition-colors">
                                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                            {uploading ? (
                                                <Loader2 className="animate-spin text-charcoal mb-2" size={24} />
                                            ) : (
                                                <Upload className="text-warm-gray mb-2" size={24} />
                                            )}
                                            <p className="mb-2 text-sm text-warm-gray"><span className="font-semibold text-charcoal">Haz clic para subir imagen</span></p>
                                            <p className="text-xs text-warm-gray/60">Formato sugerido: Vertical (4:5)</p>
                                            <p className="text-xs text-warm-gray/60">Se convertirá y optimizará a WebP automáticamente</p>
                                        </div>
                                        <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={uploading} />
                                    </label>
                                </div>

                                {optimizationMsg && (
                                    <div className="bg-green-50 text-green-700 p-3 rounded-lg text-sm flex items-center gap-2 border border-green-200 justify-center">
                                        <span>✅ Imagen optimizada: de <strong>{formatBytes(optimizationMsg.original)}</strong> a <strong>{formatBytes(optimizationMsg.optimized)}</strong> (Reducción del {Math.round((1 - optimizationMsg.optimized / optimizationMsg.original) * 100)}%)</span>
                                    </div>
                                )}

                                <div className="grid grid-cols-3 gap-4">
                                    {images.map((img, idx) => (
                                        <div key={idx} className="relative aspect-[4/5] bg-stone/10 rounded overflow-hidden group">
                                            <img src={img} alt="" className="w-full h-full object-cover" />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                                {idx > 0 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => moveImage(idx, 'left')}
                                                        className="p-1.5 bg-white/20 hover:bg-white/40 text-white rounded-full transition-colors backdrop-blur-sm"
                                                        title="Mover a la izquierda"
                                                    >
                                                        <ChevronLeft size={16} />
                                                    </button>
                                                )}

                                                <button
                                                    type="button"
                                                    onClick={() => setImages(images.filter((_, i) => i !== idx))}
                                                    className="p-2 bg-red-600/80 text-white rounded-full hover:bg-red-700 transition-colors"
                                                    title="Eliminar"
                                                >
                                                    <Trash2 size={16} />
                                                </button>

                                                {idx < images.length - 1 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => moveImage(idx, 'right')}
                                                        className="p-1.5 bg-white/20 hover:bg-white/40 text-white rounded-full transition-colors backdrop-blur-sm"
                                                        title="Mover a la derecha"
                                                    >
                                                        <ChevronRight size={16} />
                                                    </button>
                                                )}
                                            </div>
                                            {idx === 0 && (
                                                <div className="absolute top-2 left-2 px-2 py-1 bg-charcoal/80 text-white text-xs rounded">Principal</div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                    </form>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-stone/20 flex justify-end gap-3 bg-stone/5">
                    <button
                        type="button"
                        onClick={onClose}
                        className="btn-secondary"
                        disabled={loading}
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        form="product-form"
                        disabled={loading}
                        className="btn-primary flex items-center gap-2"
                    >
                        {loading && <Loader2 className="animate-spin" size={16} />}
                        {product ? 'Guardar Cambios' : 'Crear Producto'}
                    </button>
                </div>
            </div>
        </div>
    );
}

