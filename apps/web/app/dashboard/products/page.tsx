
'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Plus, Package, Search, MoreVertical, Edit2, Trash2, Loader2, Image as ImageIcon, X, DollarSign, Upload, AlertCircle } from 'lucide-react';
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
    const [sku, setSku] = useState('');
    const [discountPrice, setDiscountPrice] = useState('');
    const [isActive, setIsActive] = useState(true);
    const [confirmModal, setConfirmModal] = useState<{
        show: boolean,
        type: 'product' | 'category',
        id: string,
        name: string,
        isPaused?: boolean
    }>({ show: false, type: 'product', id: '', name: '' });
    const [errorAlert, setErrorAlert] = useState<{ show: boolean, title: string, message: string }>({ show: false, title: '', message: '' });
    const [statusTab, setStatusTab] = useState<'active' | 'paused'>('active');
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
            setErrorAlert({
                show: true,
                title: 'Error de Carga',
                message: 'No se pudieron subir las imágenes.'
            });
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
            setErrorAlert({
                show: true,
                title: 'Error de Categoría',
                message: 'No se pudo crear la categoría. Por favor, intenta de nuevo.'
            });
        }
    };

    const handleDeleteCategory = async (id: string) => {
        try {
            await api.deleteCategory(id);
            const cats = await api.getCategories(storeId!);
            setCategories(cats);
            await loadData();
        } catch (err) {
            setErrorAlert({
                show: true,
                title: 'Error al eliminar',
                message: 'No se pudo eliminar la categoría.'
            });
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
        setSku('');
        setDiscountPrice('');
        setIsActive(true);
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
        setSku(product.sku || '');
        setDiscountPrice(product.discountPrice?.toString() || '');
        setIsActive(product.isActive ?? true);
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
            sku: sku || null,
            discountPrice: discountPrice ? parseFloat(discountPrice) : null,
            isActive
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
            setErrorAlert({
                show: true,
                title: 'Error al guardar',
                message: 'No se pudo guardar el producto. Revisa los datos e intenta de nuevo.'
            });
        } finally {
            setCreating(false);
        }
    };

    const handleDeleteProduct = (product: any) => {
        setConfirmModal({
            show: true,
            type: 'product',
            id: product.id,
            name: product.name,
            isPaused: !product.isActive
        });
    };

    const confirmDeleteAction = async () => {
        const { type, id } = confirmModal;
        setConfirmModal(prev => ({ ...prev, show: false }));

        if (type === 'product') {
            setDeletingId(id);
            try {
                await api.deleteProduct(id);
                await loadData();
            } catch (err) {
                setErrorAlert({
                    show: true,
                    title: 'No se puede eliminar',
                    message: 'Este producto no se puede eliminar porque tiene ventas asociadas o hay un error sistémico. Puedes desactivarlo para que no aparezca en tu tienda.'
                });
            } finally {
                setDeletingId(null);
            }
        } else {
            handleDeleteCategory(id);
        }
    };

    const handleToggleStatus = async (product: any) => {
        try {
            await api.updateProduct(product.id, { isActive: !product.isActive });
            await loadData();
        } catch (err) {
            setErrorAlert({
                show: true,
                title: 'Error de Estado',
                message: 'No se pudo cambiar el estado del producto.'
            });
        }
    };

    const filteredProducts = products.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.description?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = categoryFilter === 'all' || p.categoryId === categoryFilter;
        const matchesStatus = statusTab === 'active' ? p.isActive : !p.isActive;
        return matchesSearch && matchesCategory && matchesStatus;
    });

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <Loader2 className="w-10 h-10 text-[var(--primary)] animate-spin" />
                <p className="text-[var(--text)]/40 font-medium">Cargando catálogo...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-12">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-[var(--text)]">Catalogo</h1>
                    <p className="text-[var(--text)]/60 mt-1">Administra tus productos y categorías.</p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setIsCatModalOpen(true)}
                        className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 bg-[var(--secondary)] text-[var(--text)] px-6 py-3 rounded-2xl font-bold hover:opacity-80 transition-all active:scale-95"
                    >
                        Categorías
                    </button>
                    <button
                        onClick={openCreateModal}
                        className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 bg-[var(--primary)] text-[var(--primary-foreground)] px-6 py-3 rounded-2xl font-bold hover:opacity-90 transition-all shadow-[var(--shadow)] active:scale-95"
                    >
                        <Plus className="w-5 h-5" />
                        Nuevo
                    </button>
                </div>
            </div>

            {/* Tabs and Search */}
            <div className="space-y-6">
                <div className="flex items-center p-1.5 bg-[var(--secondary)]/50 rounded-2xl w-fit">
                    <button
                        onClick={() => setStatusTab('active')}
                        className={cn(
                            "px-6 py-2.5 rounded-xl font-black text-sm transition-all",
                            statusTab === 'active' ? "bg-[var(--surface)] text-[var(--primary)] shadow-[var(--shadow)]" : "text-[var(--text)]/40 hover:text-[var(--text)]"
                        )}
                    >
                        Activos ({products.filter(p => p.isActive).length})
                    </button>
                    <button
                        onClick={() => setStatusTab('paused')}
                        className={cn(
                            "px-6 py-2.5 rounded-xl font-black text-sm transition-all",
                            statusTab === 'paused' ? "bg-[var(--surface)] text-[var(--text)] shadow-[var(--shadow)]" : "text-[var(--text)]/40 hover:text-[var(--text)]"
                        )}
                    >
                        Pausados ({products.filter(p => !p.isActive).length})
                    </button>
                </div>

                <div className="bg-[var(--surface)] p-4 rounded-3xl border border-[var(--border)] shadow-[var(--shadow)] flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text)]/40 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Buscar producto..."
                            className="w-full pl-12 pr-4 py-3 rounded-2xl bg-[var(--bg)] border-none focus:ring-2 focus:ring-[var(--primary)]/20 outline-none text-[var(--text)] font-medium transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2">
                        <select
                            className="px-6 py-3 rounded-2xl bg-[var(--bg)] border-none focus:ring-2 focus:ring-[var(--primary)]/20 outline-none text-[var(--text)]/70 font-bold text-sm cursor-pointer"
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
                    <div className="bg-[var(--surface)] rounded-[2.5rem] p-16 text-center border border-[var(--border)] border-dashed">
                        <div className="w-20 h-20 bg-[var(--secondary)] rounded-full flex items-center justify-center mx-auto mb-6">
                            <Package className="w-10 h-10 text-[var(--text)]/20" />
                        </div>
                        <h3 className="text-xl font-bold text-[var(--text)]">Sin resultados</h3>
                        <p className="text-[var(--text)]/40 mt-2">Intenta cambiar la búsqueda o categoría.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                        {filteredProducts.map((product) => (
                            <div key={product.id} className="bg-[var(--surface)] rounded-[2rem] p-3 border border-[var(--border)] shadow-[var(--shadow)] hover:shadow-[var(--shadow-strong)] transition-all flex flex-col group relative">
                                <div className="aspect-square bg-[var(--bg)] rounded-[1.5rem] flex items-center justify-center relative overflow-hidden">
                                    {product.images?.[0] ? (
                                        <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                                    ) : (
                                        <ImageIcon className="w-8 h-8 text-[var(--text)]/10" />
                                    )}

                                    {/* Quick Actions (Always visible on mobile) */}
                                    <div className="absolute top-2 right-2 flex flex-col gap-1 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => openEditModal(product)}
                                            className="p-2 bg-[var(--surface)]/95 backdrop-blur-sm rounded-xl shadow-[var(--shadow-strong)] border border-[var(--border)] text-[var(--text)] hover:opacity-80 active:scale-90 transition-all"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteProduct(product)}
                                            className="p-2 bg-[var(--surface)]/95 backdrop-blur-sm rounded-xl shadow-[var(--shadow-strong)] border border-[var(--border)] text-red-500 hover:opacity-80 active:scale-90 transition-all"
                                        >
                                            {deletingId === product.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                                        </button>
                                    </div>

                                    {/* Status / Category Badges */}
                                    <div className="absolute bottom-2 left-2 flex flex-col gap-1">
                                        {product.sku && (
                                            <span className="bg-black/90 backdrop-blur-sm text-white px-2 py-0.5 rounded-lg text-[7px] font-black uppercase tracking-widest border border-white/10">
                                                #{product.sku}
                                            </span>
                                        )}
                                        {product.categoryId && (
                                            <span className="bg-[var(--primary)]/90 backdrop-blur-sm text-[var(--bg)] px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-tighter">
                                                {categories.find(c => c.id === product.categoryId)?.name}
                                            </span>
                                        )}
                                        <span className={cn(
                                            "px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-tighter self-start shadow-sm",
                                            product.isActive ? "bg-green-500/90 text-white" : "bg-gray-500/90 text-white"
                                        )}>
                                            {product.isActive ? 'Activo' : 'Pausa'}
                                        </span>
                                    </div>
                                </div>

                                <div className="mt-4 flex-1 flex flex-col px-1">
                                    <div className="flex flex-col">
                                        <h3 className="text-sm font-black text-[var(--text)] truncate">{product.name}</h3>
                                        <span className="text-base font-black text-[var(--primary)] mt-1">{formatCurrency(product.price)}</span>
                                    </div>

                                    <div className="mt-3 flex items-center justify-between">
                                        <span className={cn(
                                            "text-[9px] font-black uppercase tracking-widest",
                                            (product.inventory?.stock ?? 0) === 0 ? "text-red-500" :
                                                (product.inventory?.stock ?? 0) <= 5 ? "text-orange-500" :
                                                    "text-[var(--text)]/30"
                                        )}>
                                            {(product.inventory?.stock ?? 0) === 0 ? 'Sin Stock' : `Stock: ${product.inventory?.stock}`}
                                        </span>
                                        <button onClick={() => handleToggleStatus(product)} className="w-4 h-4 rounded-full bg-[var(--secondary)] flex items-center justify-center hover:bg-[var(--primary)]/10 transition-colors">
                                            <div className={cn("w-1.5 h-1.5 rounded-full", product.isActive ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" : "bg-gray-400")} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Manage Categories Modal */}
            {isCatModalOpen && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
                    <div className="bg-[var(--surface)] w-full max-w-md rounded-[2.5rem] shadow-[var(--shadow-strong)] overflow-hidden p-8 space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-black text-[var(--text)]">Categorías</h2>
                            <button onClick={() => setIsCatModalOpen(false)} className="p-2 hover:bg-[var(--secondary)] rounded-xl transition-colors">
                                <X className="w-5 h-5 text-[var(--text)]/40" />
                            </button>
                        </div>

                        <form onSubmit={handleCreateCategory} className="flex gap-2">
                            <input
                                type="text"
                                placeholder="Nueva categoría..."
                                className="flex-1 px-5 py-3 rounded-2xl border-2 border-[var(--border)] focus:border-[var(--primary)] outline-none font-bold text-[var(--text)] bg-[var(--bg)]"
                                value={newCatName}
                                onChange={(e) => setNewCatName(e.target.value)}
                            />
                            <button type="submit" className="bg-[var(--primary)] text-[var(--bg)] px-4 rounded-2xl font-black hover:opacity-90 transition-all">
                                <Plus className="w-5 h-5" />
                            </button>
                        </form>

                        <div className="space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar">
                            {categories.length === 0 ? (
                                <p className="text-center text-[var(--text)]/30 font-medium py-8">Crea categorías para organizar tu tienda.</p>
                            ) : (
                                categories.map(cat => (
                                    <div key={cat.id} className="flex items-center justify-between p-4 bg-[var(--secondary)]/50 rounded-2xl group transition-all hover:bg-[var(--surface)] hover:ring-2 hover:ring-[var(--primary)]/20">
                                        <span className="font-black text-[var(--text)]">{cat.name}</span>
                                        <button onClick={() => setConfirmModal({ show: true, type: 'category', id: cat.id, name: cat.name })} className="p-2 text-[var(--text)]/30 hover:text-red-500 transition-colors">
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
                    <div className="bg-[var(--surface)] w-full max-w-xl rounded-[2.5rem] shadow-[var(--shadow-strong)] overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-8 border-b border-[var(--border)] flex items-center justify-between">
                            <h2 className="text-2xl font-black text-[var(--text)]">{editingProduct ? 'Editar' : 'Nuevo'} Producto</h2>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-[var(--secondary)] rounded-xl transition-colors">
                                <X className="w-6 h-6 text-[var(--text)]/40" />
                            </button>
                        </div>

                        <form onSubmit={handleSaveProduct} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase tracking-wider text-[var(--text)]/40 px-1">Nombre</label>
                                        <input
                                            type="text" required value={name} onChange={(e) => setName(e.target.value)}
                                            className="w-full px-5 py-3 rounded-2xl border-2 border-[var(--border)] focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--primary)]/10 outline-none transition-all font-bold text-[var(--text)] bg-[var(--bg)]"
                                            placeholder="Ej: Café Late"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase tracking-wider text-[var(--text)]/40 px-1">Precio Normal</label>
                                        <input
                                            type="number" step="0.01" required value={price} onChange={(e) => setPrice(e.target.value)}
                                            className="w-full px-5 py-3 rounded-2xl border-2 border-[var(--border)] focus:border-[var(--primary)] outline-none transition-all font-bold text-[var(--text)] bg-[var(--bg)]"
                                            placeholder="0.00"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-xs font-black uppercase tracking-wider text-green-500 px-1 flex items-center gap-1">
                                                <DollarSign className="w-3 h-3" /> Precio Oferta
                                            </label>
                                            <input
                                                type="number" step="0.01" value={discountPrice} onChange={(e) => setDiscountPrice(e.target.value)}
                                                className="w-full px-5 py-3 rounded-2xl border-2 border-green-500/20 focus:border-green-500 outline-none transition-all font-bold text-green-500 bg-green-500/5"
                                                placeholder="Opcional"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-black uppercase tracking-wider text-[var(--text)]/40 px-1">Stock</label>
                                            <input
                                                type="number" value={stock} onChange={(e) => setStock(e.target.value)}
                                                className="w-full px-5 py-3 rounded-2xl border-2 border-[var(--border)] focus:border-[var(--primary)] outline-none transition-all font-bold text-[var(--text)] bg-[var(--bg)]"
                                                placeholder="Infinito"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase tracking-wider text-[var(--text)]/40 px-1">Categoría</label>
                                        <select
                                            className="w-full px-5 py-3 rounded-2xl border-2 border-[var(--border)] focus:border-[var(--primary)] outline-none text-[var(--text)] font-bold bg-[var(--bg)]"
                                            value={categoryId}
                                            onChange={(e) => setCategoryId(e.target.value)}
                                        >
                                            <option value="">Sin categoría</option>
                                            {categories.map(c => (
                                                <option key={c.id} value={c.id}>{c.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase tracking-wider text-[var(--text)]/20 px-1">Código / SKU (Informativo)</label>
                                        <input
                                            type="text" value={sku} disabled
                                            className="w-full px-5 py-3 rounded-2xl border-2 border-[var(--border)] bg-[var(--secondary)]/30 outline-none transition-all font-bold text-[var(--text)]/20 cursor-not-allowed"
                                            placeholder="Automático"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <label className="text-xs font-black uppercase tracking-wider text-[var(--text)]/40 px-1">Imágenes ({imageUrls.length}/5)</label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {imageUrls.map((url, i) => (
                                            <div key={i} className="aspect-square bg-[var(--bg)] rounded-xl relative group overflow-hidden border border-[var(--border)]">
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
                                            <label className="aspect-square bg-[var(--secondary)]/50 border-2 border-dashed border-[var(--border)] rounded-xl flex items-center justify-center cursor-pointer hover:opacity-80 transition-all">
                                                {uploading ? <Loader2 className="w-5 h-5 animate-spin text-[var(--primary)]" /> : <Plus className="w-6 h-6 text-[var(--text)]/20" />}
                                                <input type="file" className="hidden" accept="image/*" multiple onChange={handleProductImageUpload} disabled={uploading} />
                                            </label>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase tracking-wider text-[var(--text)]/40 px-1">Descripción</label>
                                        <textarea
                                            value={description} onChange={(e) => setDescription(e.target.value)}
                                            className="w-full px-5 py-3 rounded-2xl border-2 border-[var(--border)] focus:border-[var(--primary)] outline-none font-medium min-h-[100px] text-sm text-[var(--text)] bg-[var(--bg)] resize-none"
                                            placeholder="Detalles..."
                                        />
                                    </div>
                                    <div className="pt-2 px-1 flex items-center justify-between bg-[var(--secondary)]/30 p-4 rounded-2xl border border-[var(--border)]">
                                        <div className="space-y-0.5">
                                            <p className="text-sm font-black text-[var(--text)]">Estado del Producto</p>
                                            <p className="text-[10px] text-[var(--text)]/40 font-medium">{isActive ? 'Visible en la tienda' : 'Oculto de la tienda'}</p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setIsActive(!isActive)}
                                            className={cn(
                                                "w-12 h-6 rounded-full transition-all relative",
                                                isActive ? "bg-green-500" : "bg-gray-400"
                                            )}
                                        >
                                            <div className={cn(
                                                "absolute top-1 w-4 h-4 bg-white rounded-full transition-all shadow-sm",
                                                isActive ? "left-7" : "left-1"
                                            )} />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-6 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 py-3 px-6 rounded-2xl font-bold text-[var(--text)]/40 hover:bg-[var(--secondary)] transition-all"
                                >
                                    Cerrar
                                </button>
                                <button
                                    type="submit"
                                    disabled={creating}
                                    className="flex-[2] bg-[var(--primary)] text-[var(--bg)] py-3 px-6 rounded-2xl font-black hover:opacity-90 transition-all shadow-[var(--shadow)] flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {creating ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Guardar Producto'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Premium Confirmation Modal */}
            {confirmModal.show && (
                <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-sm rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 ring-1 ring-black/5">
                        <div className="p-8 space-y-6">
                            <div className="flex flex-col items-center text-center gap-4">
                                <div className={cn(
                                    "w-20 h-20 rounded-[2rem] flex items-center justify-center shadow-inner",
                                    confirmModal.isPaused ? "bg-red-50 text-red-600" : "bg-orange-50 text-orange-600"
                                )}>
                                    {confirmModal.isPaused ? <Trash2 className="w-10 h-10" /> : <AlertCircle className="w-10 h-10" />}
                                </div>
                                <div className="space-y-2">
                                    <h2 className="text-2xl font-black text-gray-900 leading-tight">
                                        {confirmModal.isPaused ? '¿Eliminar definitivamente?' : '¿Pausar o eliminar?'}
                                    </h2>
                                    <div className="text-gray-500 font-bold text-sm px-4 leading-relaxed">
                                        {confirmModal.type === 'category' ? (
                                            `Vas a eliminar la categoría "${confirmModal.name}". Los productos asociados quedarán sin categoría.`
                                        ) : confirmModal.isPaused ? (
                                            <>
                                                Eliminar <span className="text-red-600">"${confirmModal.name}"</span> borrará su historial de ventas y métricas. Esta acción es <span className="text-red-600 uppercase">irreversible</span>.
                                            </>
                                        ) : (
                                            <>
                                                Recomendamos <span className="text-blue-600">Pausar</span> para mantener tus reportes y ventas históricas. Eliminar borrará todo el rastro del producto.
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col gap-3">
                                {confirmModal.type === 'product' && !confirmModal.isPaused && (
                                    <button
                                        onClick={async () => {
                                            const product = products.find(p => p.id === confirmModal.id);
                                            if (product) await handleToggleStatus(product);
                                            setConfirmModal(prev => ({ ...prev, show: false }));
                                        }}
                                        className="w-full bg-blue-600 text-white py-4 rounded-[1.5rem] font-black text-lg hover:bg-blue-700 transition-all active:scale-95 shadow-lg shadow-blue-100"
                                    >
                                        Solo pausar (Recomendado)
                                    </button>
                                )}
                                <button
                                    onClick={confirmDeleteAction}
                                    className={cn(
                                        "w-full py-4 rounded-[1.5rem] font-black text-lg transition-all active:scale-95",
                                        confirmModal.isPaused || confirmModal.type === 'category'
                                            ? "bg-red-600 text-white hover:bg-red-700 shadow-lg shadow-red-100"
                                            : "bg-gray-100 text-red-600 hover:bg-red-50"
                                    )}
                                >
                                    {confirmModal.type === 'category'
                                        ? 'Eliminar categoría'
                                        : confirmModal.isPaused
                                            ? 'Sí, eliminar historial'
                                            : 'Eliminar de todos modos'}
                                </button>
                                <button
                                    onClick={() => setConfirmModal(prev => ({ ...prev, show: false }))}
                                    className="w-full bg-gray-50 text-gray-500 py-4 rounded-[1.5rem] font-bold text-lg hover:bg-gray-100 transition-all active:scale-95"
                                >
                                    Cancelar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Premium Error Alert Modal */}
            {errorAlert.show && (
                <div className="fixed inset-0 z-[130] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-sm rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 ring-1 ring-black/5">
                        <div className="p-8 space-y-6">
                            <div className="flex flex-col items-center text-center gap-4">
                                <div className="w-20 h-20 bg-orange-50 text-orange-600 rounded-[2rem] flex items-center justify-center shadow-inner">
                                    <AlertCircle className="w-10 h-10" />
                                </div>
                                <div className="space-y-2">
                                    <h2 className="text-2xl font-black text-gray-900 leading-tight">{errorAlert.title}</h2>
                                    <p className="text-gray-500 font-bold text-sm leading-relaxed">
                                        {errorAlert.message}
                                    </p>
                                </div>
                            </div>

                            <button
                                onClick={() => setErrorAlert(prev => ({ ...prev, show: false }))}
                                className="w-full bg-gray-900 text-white py-4 rounded-[1.5rem] font-black text-lg hover:bg-black transition-all active:scale-95"
                            >
                                Entendido
                            </button>
                        </div>
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
