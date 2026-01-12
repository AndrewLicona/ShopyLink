
'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Plus, Package, Search, MoreVertical, Edit2, Trash2, Loader2, Image as ImageIcon, X, DollarSign, Upload } from 'lucide-react';
import { api } from '@/lib/api';
import { createClient } from '@/lib/supabase';
import { storage } from '@/lib/storage';
import { formatCurrency } from '@/lib/utils';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

import { useStore } from '@/contexts/StoreContext';

function ProductsContent() {
    const { activeStore } = useStore();
    const [products, setProducts] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isCatModalOpen, setIsCatModalOpen] = useState(false);
    const [creating, setCreating] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [editingProduct, setEditingProduct] = useState<any>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const searchParams = useSearchParams();

    const storeId = activeStore?.id;

    // Form state
    const [name, setName] = useState('');
    const [price, setPrice] = useState('');
    const [description, setDescription] = useState('');
    const [stock, setStock] = useState('');
    const [imageUrls, setImageUrls] = useState<string[]>([]);
    const [categoryId, setCategoryId] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');

    // Category Form
    const [newCatName, setNewCatName] = useState('');

    // Auto-open modal if action=new is present
    useEffect(() => {
        if (searchParams.get('action') === 'new' && storeId) {
            openCreateModal();
        }
    }, [searchParams, storeId]);

    const loadData = async () => {
        if (!activeStore) return;

        setLoading(true);
        try {
            const [prods, cats] = await Promise.all([
                api.getProducts(activeStore.id),
                api.getCategories(activeStore.id)
            ]);
            setProducts(prods);
            setCategories(cats);
        } catch (err) {
            console.error('Error loading data:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [activeStore]);

    const handleProductImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;

        setUploading(true);
        try {
            const uploadPromises = files.map(file => storage.uploadImage(file, 'products'));
            const urls = await Promise.all(uploadPromises);
            setImageUrls(prev => [...prev, ...urls].slice(0, 5));
        } catch (err: any) {
            console.error('Upload error:', err);
            alert('Error al subir las imágenes');
        } finally {
            setUploading(false);
            if (e.target) e.target.value = '';
        }
    };

    const removeImage = (index: number) => {
        setImageUrls(prev => prev.filter((_, i) => i !== index));
    };

    const handleCreateCategory = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!storeId || !newCatName) return;

        try {
            await api.createCategory({
                name: newCatName,
                slug: newCatName.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, ''),
                storeId
            });
            setNewCatName('');
            const cats = await api.getCategories(storeId);
            setCategories(cats);
        } catch (err) {
            alert('Error al crear categoría');
        }
    };

    const handleDeleteCategory = async (id: string) => {
        if (!confirm('¿Eliminar categoría? Los productos ya no estarán asociados a ella.')) return;
        try {
            await api.deleteCategory(id);
            const cats = await api.getCategories(storeId!);
            setCategories(cats);
            await loadData(); // Reload products to update UI
        } catch (err) {
            alert('Error al eliminar categoría');
        }
    };

    const openCreateModal = () => {
        setEditingProduct(null);
        setName('');
        setPrice('');
        setDescription('');
        setStock('');
        setImageUrls([]);
        setCategoryId('');
        setIsModalOpen(true);
    };

    const openEditModal = (product: any) => {
        setEditingProduct(product);
        setName(product.name);
        setPrice(product.price.toString());
        setDescription(product.description || '');
        setStock(product.inventory?.stock?.toString() || '');
        setImageUrls(product.images || []);
        setCategoryId(product.categoryId || '');
        setIsModalOpen(true);
    };

    const handleSaveProduct = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!storeId) return;
        setCreating(true);

        const productData = {
            name,
            price: parseFloat(price),
            description,
            stock: parseInt(stock) || 0,
            storeId,
            images: imageUrls,
            categoryId: categoryId || null,
            isActive: true
        };

        try {
            if (editingProduct) {
                await api.updateProduct(editingProduct.id, productData);
            } else {
                await api.createProduct(productData);
            }
            setIsModalOpen(false);
            await loadData();
        } catch (err) {
            alert(`Error al guardar producto`);
        } finally {
            setCreating(false);
        }
    };

    const handleDeleteProduct = async (id: string) => {
        if (!confirm('¿Eliminar este producto?')) return;
        setDeletingId(id);
        try {
            await api.deleteProduct(id);
            await loadData();
        } catch (err) {
            alert('Error al eliminar');
        } finally {
            setDeletingId(null);
        }
    };

    const handleToggleStatus = async (product: any) => {
        try {
            await api.updateProduct(product.id, { isActive: !product.isActive });
            await loadData();
        } catch (err) {
            alert('Error al cambiar estado');
        }
    };

    const filteredProducts = products.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.description?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = categoryFilter === 'all' || p.categoryId === categoryFilter;
        return matchesSearch && matchesCategory;
    });

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
                <p className="text-gray-500 font-medium">Cargando catálogo...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-12">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-900">Catalogo</h1>
                    <p className="text-gray-500 mt-1">Administra tus productos y categorías.</p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setIsCatModalOpen(true)}
                        className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 bg-gray-100 text-gray-700 px-6 py-3 rounded-2xl font-bold hover:bg-gray-200 transition-all active:scale-95"
                    >
                        Categorías
                    </button>
                    <button
                        onClick={openCreateModal}
                        className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 active:scale-95"
                    >
                        <Plus className="w-5 h-5" />
                        Nuevo
                    </button>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Buscar producto..."
                        className="w-full pl-12 pr-4 py-3 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-blue-500/20 outline-none text-gray-900 font-medium transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex gap-2">
                    <select
                        className="px-6 py-3 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-blue-500/20 outline-none text-gray-600 font-bold text-sm cursor-pointer"
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                    >
                        <option value="all">Todo</option>
                        {categories.map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Products Grid */}
            {filteredProducts.length === 0 ? (
                <div className="bg-white rounded-[2.5rem] p-16 text-center border border-gray-100 border-dashed">
                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Package className="w-10 h-10 text-gray-300" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">Sin resultados</h3>
                    <p className="text-gray-500 mt-2">Intenta cambiar la búsqueda o categoría.</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                    {filteredProducts.map((product) => (
                        <div key={product.id} className="bg-white rounded-[2rem] p-3 border border-gray-50 shadow-sm hover:shadow-xl transition-all flex flex-col group relative">
                            <div className="aspect-square bg-gray-100 rounded-[1.5rem] flex items-center justify-center relative overflow-hidden">
                                {product.images?.[0] ? (
                                    <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                                ) : (
                                    <ImageIcon className="w-8 h-8 text-gray-200" />
                                )}

                                {/* Quick Actions (Always visible on mobile) */}
                                <div className="absolute top-2 right-2 flex flex-col gap-1 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => openEditModal(product)}
                                        className="p-2 bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-gray-100 text-gray-900 hover:bg-white active:scale-90 transition-all"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDeleteProduct(product.id)}
                                        className="p-2 bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-gray-100 text-red-500 hover:bg-white active:scale-90 transition-all"
                                    >
                                        {deletingId === product.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                                    </button>
                                </div>

                                {/* Status / Category Badges */}
                                <div className="absolute bottom-2 left-2 flex flex-col gap-1">
                                    {product.categoryId && (
                                        <span className="bg-blue-600/90 backdrop-blur-sm text-white px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-tighter">
                                            {categories.find(c => c.id === product.categoryId)?.name}
                                        </span>
                                    )}
                                    <span className={cn(
                                        "px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-tighter self-start",
                                        product.isActive ? "bg-green-500/90 text-white" : "bg-gray-500/90 text-white"
                                    )}>
                                        {product.isActive ? 'Activo' : 'Pausa'}
                                    </span>
                                </div>
                            </div>

                            <div className="mt-4 flex-1 flex flex-col px-1">
                                <div className="flex flex-col">
                                    <h3 className="text-sm font-black text-gray-900 truncate">{product.name}</h3>
                                    <span className="text-base font-black text-blue-600 mt-1">{formatCurrency(product.price)}</span>
                                </div>

                                <div className="mt-3 flex items-center justify-between">
                                    <span className={cn(
                                        "text-[9px] font-black uppercase tracking-widest",
                                        (product.inventory?.stock ?? 0) === 0 ? "text-red-600 font-black" :
                                            (product.inventory?.stock ?? 0) <= 5 ? "text-orange-500" :
                                                "text-gray-400"
                                    )}>
                                        {(product.inventory?.stock ?? 0) === 0 ? 'Sin Stock' : `Stock: ${product.inventory?.stock}`}
                                    </span>
                                    <button onClick={() => handleToggleStatus(product)} className="w-4 h-4 rounded-full bg-gray-100 flex items-center justify-center hover:bg-blue-50 transition-colors">
                                        <div className={cn("w-1.5 h-1.5 rounded-full", product.isActive ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" : "bg-gray-400")} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Manage Categories Modal */}
            {isCatModalOpen && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden p-8 space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-black text-gray-900">Categorías</h2>
                            <button onClick={() => setIsCatModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                                <X className="w-5 h-5 text-gray-400" />
                            </button>
                        </div>

                        <form onSubmit={handleCreateCategory} className="flex gap-2">
                            <input
                                type="text"
                                placeholder="Nueva categoría..."
                                className="flex-1 px-5 py-3 rounded-2xl border-2 border-gray-200 focus:border-blue-500 outline-none font-bold text-gray-900 bg-white"
                                value={newCatName}
                                onChange={(e) => setNewCatName(e.target.value)}
                            />
                            <button type="submit" className="bg-blue-600 text-white px-4 rounded-2xl font-black hover:bg-blue-700 transition-all">
                                <Plus className="w-5 h-5" />
                            </button>
                        </form>

                        <div className="space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar">
                            {categories.length === 0 ? (
                                <p className="text-center text-gray-400 font-medium py-8">Crea categorías para organizar tu tienda.</p>
                            ) : (
                                categories.map(cat => (
                                    <div key={cat.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl group transition-all hover:bg-white hover:ring-2 hover:ring-blue-500/20">
                                        <span className="font-black text-gray-900">{cat.name}</span>
                                        <button onClick={() => handleDeleteCategory(cat.id)} className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Create Product Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-8 border-b border-gray-100 flex items-center justify-between">
                            <h2 className="text-2xl font-black text-gray-900">{editingProduct ? 'Editar' : 'Nuevo'} Producto</h2>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                                <X className="w-6 h-6 text-gray-400" />
                            </button>
                        </div>

                        <form onSubmit={handleSaveProduct} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase tracking-wider text-gray-400 px-1">Nombre</label>
                                        <input
                                            type="text" required value={name} onChange={(e) => setName(e.target.value)}
                                            className="w-full px-5 py-3 rounded-2xl border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-bold text-gray-900"
                                            placeholder="Ej: Café Late"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-xs font-black uppercase tracking-wider text-gray-400 px-1">Precio</label>
                                            <input
                                                type="number" step="0.01" required value={price} onChange={(e) => setPrice(e.target.value)}
                                                className="w-full px-5 py-3 rounded-2xl border-2 border-gray-200 focus:border-blue-500 outline-none transition-all font-bold text-gray-900"
                                                placeholder="0.00"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-black uppercase tracking-wider text-gray-400 px-1">Stock</label>
                                            <input
                                                type="number" value={stock} onChange={(e) => setStock(e.target.value)}
                                                className="w-full px-5 py-3 rounded-2xl border-2 border-gray-200 focus:border-blue-500 outline-none transition-all font-bold text-gray-900"
                                                placeholder="Infinito"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase tracking-wider text-gray-400 px-1">Categoría</label>
                                        <select
                                            className="w-full px-5 py-3 rounded-2xl border-2 border-gray-200 focus:border-blue-500 outline-none text-gray-900 font-bold bg-white"
                                            value={categoryId}
                                            onChange={(e) => setCategoryId(e.target.value)}
                                        >
                                            <option value="">Sin categoría</option>
                                            {categories.map(c => (
                                                <option key={c.id} value={c.id}>{c.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <label className="text-xs font-black uppercase tracking-wider text-gray-400 px-1">Imágenes ({imageUrls.length}/5)</label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {imageUrls.map((url, i) => (
                                            <div key={i} className="aspect-square bg-gray-50 rounded-xl relative group overflow-hidden border border-gray-100">
                                                <img src={url} className="w-full h-full object-cover" />
                                                <button
                                                    type="button"
                                                    onClick={() => removeImage(i)}
                                                    className="absolute inset-0 bg-red-500/80 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            </div>
                                        ))}
                                        {imageUrls.length < 5 && (
                                            <label className="aspect-square bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center cursor-pointer hover:bg-gray-100 hover:border-blue-200 transition-all">
                                                {uploading ? <Loader2 className="w-5 h-5 animate-spin text-blue-500" /> : <Plus className="w-6 h-6 text-gray-400" />}
                                                <input type="file" className="hidden" accept="image/*" onChange={handleProductImageUpload} disabled={uploading} />
                                            </label>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase tracking-wider text-gray-400 px-1">Descripción</label>
                                        <textarea
                                            value={description} onChange={(e) => setDescription(e.target.value)}
                                            className="w-full px-5 py-3 rounded-2xl border-2 border-gray-200 focus:border-blue-500 outline-none font-medium min-h-[100px] text-sm text-gray-900 resize-none"
                                            placeholder="Detalles..."
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="pt-6 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 py-3 px-6 rounded-2xl font-bold text-gray-500 hover:bg-gray-50 transition-all"
                                >
                                    Cerrar
                                </button>
                                <button
                                    type="submit"
                                    disabled={creating}
                                    className="flex-[2] bg-blue-600 text-white py-3 px-6 rounded-2xl font-black hover:bg-blue-700 transition-all shadow-xl shadow-blue-50 flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {creating ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Guardar Producto'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function ProductsPage() {
    return (
        <Suspense fallback={
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
                <p className="text-gray-500 font-medium">Cargando...</p>
            </div>
        }>
            <ProductsContent />
        </Suspense>
    );
}
