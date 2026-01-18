'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { api } from '@/services/api';
import { storage } from '@/lib/storage';
import { useStore } from '@/contexts/StoreContext';
import type { Product, Category, ProductVariant } from '@/types/types';

export function useProducts() {
    const { activeStore } = useStore();
    const searchParams = useSearchParams();
    const storeId = activeStore?.id;

    // Data state
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isCatModalOpen, setIsCatModalOpen] = useState(false);
    const [confirmModal, setConfirmModal] = useState<{
        show: boolean,
        type: 'product' | 'category',
        id: string,
        name: string,
        isPaused?: boolean
    }>({ show: false, type: 'product', id: '', name: '' });

    // Status/Action state
    const [creating, setCreating] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [errorAlert, setErrorAlert] = useState<{ show: boolean, title: string, message: string }>({ show: false, title: '', message: '' });

    // Search/Filter state
    const [statusTab, setStatusTab] = useState<'active' | 'paused'>('active');
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');

    // Form state - Product
    const [name, setName] = useState('');
    const [price, setPrice] = useState('');
    const [description, setDescription] = useState('');
    const [stock, setStock] = useState('');
    const [imageUrls, setImageUrls] = useState<string[]>([]);
    const [categoryId, setCategoryId] = useState('');
    const [sku, setSku] = useState('');
    const [discountPrice, setDiscountPrice] = useState('');
    const [isActive, setIsActive] = useState(true);
    const [trackInventory, setTrackInventory] = useState(true);
    const [hasPrice, setHasPrice] = useState(true);

    // Form state - Variants
    const [hasVariants, setHasVariants] = useState(false);
    const [variants, setVariants] = useState<Partial<ProductVariant>[]>([]);

    // Form state - Category
    const [newCatName, setNewCatName] = useState('');

    const loadData = useCallback(async () => {
        if (!activeStore) return;
        setLoading(true);
        try {
            const [prods, cats] = await Promise.all([
                api.getProducts(activeStore.id),
                api.getCategories(activeStore.id)
            ]);
            setProducts(prods);
            setCategories(cats);
        } catch (err: unknown) {
            console.error('Error loading products data:', err);
        } finally {
            setLoading(false);
        }
    }, [activeStore]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleProductImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;
        setUploading(true);
        try {
            const uploadPromises = files.map(file => storage.uploadImage(file, 'products'));
            const urls = await Promise.all(uploadPromises);
            setImageUrls(prev => [...prev, ...urls].slice(0, 5));
        } catch (err: unknown) {
            console.error('Upload error:', err);
            setErrorAlert({ show: true, title: 'Error de Carga', message: 'No se pudieron subir las imágenes.' });
        } finally {
            setUploading(false);
            if (e.target) e.target.value = '';
        }
    };

    const handleVariantImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, variantIdx: number) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;
        setUploading(true);
        try {
            const uploadPromises = files.map(file => storage.uploadImage(file, 'products'));
            const urls = await Promise.all(uploadPromises);
            setVariants(prev => {
                const next = [...prev];
                const v = next[variantIdx];
                if (!v) return prev;
                const currentImages = v.images || [];
                next[variantIdx] = { ...v, images: [...currentImages, ...urls].slice(0, 2) };
                return next;
            });
        } catch (err: unknown) {
            console.error('Variant upload error:', err);
            setErrorAlert({ show: true, title: 'Error de Carga', message: 'No se pudieron subir las imágenes de la variante.' });
        } finally {
            setUploading(false);
            if (e.target) e.target.value = '';
        }
    };

    const handleCreateCategory = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        const trimmedName = newCatName.trim();
        if (!storeId || !trimmedName) return;

        try {
            // Improved slug generation (remove accents, multiple spaces, etc)
            const slug = trimmedName
                .toLowerCase()
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")
                .replace(/[^a-z0-z0-9\s-]/g, "")
                .trim()
                .replace(/\s+/g, "-");

            await api.createCategory({
                name: trimmedName,
                slug: slug || 'cat',
                storeId
            });
            setNewCatName('');
            await loadData();
        } catch (err: unknown) {
            console.error('Create category error:', err);
            const message = err instanceof Error ? err.message : 'No se pudo crear la categoría.';
            setErrorAlert({ show: true, title: 'Error de Categoría', message });
        }
    };

    const handleDeleteCategory = async (id: string) => {
        try {
            await api.deleteCategory(id);
            await loadData();
        } catch (err: unknown) {
            console.error('Delete category error:', err);
            setErrorAlert({ show: true, title: 'Error al eliminar', message: 'No se pudo eliminar la categoría.' });
        }
    };

    const openCreateModal = useCallback(() => {
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
        setTrackInventory(true);
        setHasPrice(true);
        setHasVariants(false);
        setVariants([]);
        setIsModalOpen(true);
    }, []);

    const openEditModal = (product: Product) => {
        setEditingProduct(product);
        setName(product.name);
        const productHasPrice = product.price != null;
        setHasPrice(productHasPrice);
        setPrice(product.price?.toString() ?? '');
        setDescription(product.description || '');
        setStock(product.inventory?.stock?.toString() || '');
        setImageUrls(product.images || []);
        setCategoryId(product.categoryId || '');
        setSku(product.sku || '');
        setDiscountPrice(product.discountPrice?.toString() || '');
        setIsActive(product.isActive ?? true);
        setTrackInventory(product.trackInventory ?? true);

        if (product.variants && product.variants.length > 0) {
            setHasVariants(true);
            setVariants(product.variants);
        } else {
            setHasVariants(false);
            setVariants([]);
        }
        setIsModalOpen(true);
    };

    const handleSaveProduct = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!storeId) return;
        setCreating(true);

        const finalStock = parseInt(stock) || 0;
        const processedVariants = hasVariants ? variants.map((v, idx) => ({
            id: v.id,
            name: v.name,
            price: v.useParentPrice ? null : (v.price ? parseFloat(v.price.toString()) : null),
            stock: v.useParentStock ? 0 : (v.stock ? parseInt(v.stock.toString()) : 0),
            sku: v.sku || (sku ? `${sku}-${idx + 1}` : null),
            useParentStock: v.useParentStock ?? false,
            trackInventory: v.trackInventory ?? true,
            images: v.images || [],
        })) : [];

        const productData = {
            name,
            price: hasPrice ? (parseFloat(price) || 0) : null,
            description,
            stock: finalStock,
            storeId,
            images: imageUrls,
            categoryId: categoryId && categoryId.trim() !== '' ? categoryId : undefined,
            sku: sku || null,
            discountPrice: (hasPrice && discountPrice) ? (parseFloat(discountPrice) || 0) : null,
            isActive,
            trackInventory,
            variants: processedVariants
        };

        try {
            if (editingProduct) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                await api.updateProduct(editingProduct.id, productData as any);
            } else {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                await api.createProduct(productData as any);
            }
            setIsModalOpen(false);
            await loadData();
        } catch (err: unknown) {
            console.error('Save product error:', err);
            const message = err instanceof Error ? err.message : 'No se pudo guardar el producto.';
            setErrorAlert({ show: true, title: 'Error al guardar', message });
        } finally {
            setCreating(false);
        }
    };

    const confirmDeleteAction = async () => {
        const { type, id } = confirmModal;
        setConfirmModal(prev => ({ ...prev, show: false }));

        if (type === 'product') {
            setDeletingId(id);
            try {
                await api.deleteProduct(id);
                await loadData();
            } catch (err: unknown) {
                console.error('Delete product error:', err);
                setErrorAlert({
                    show: true,
                    title: 'No se puede eliminar',
                    message: 'Este producto no se puede eliminar porque tiene ventas asociadas. Puedes desactivarlo.'
                });
            } finally {
                setDeletingId(null);
            }
        } else {
            handleDeleteCategory(id);
        }
    };

    const handleToggleStatus = async (product: Product) => {
        try {
            await api.updateProduct(product.id, { isActive: !product.isActive });
            await loadData();
        } catch (err: unknown) {
            console.error('Toggle status error:', err);
            setErrorAlert({ show: true, title: 'Error de Estado', message: 'No se pudo cambiar el estado del producto.' });
        }
    };

    const filteredProducts = products.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.description?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = categoryFilter === 'all' || p.categoryId === categoryFilter;
        const matchesStatus = statusTab === 'active' ? p.isActive : !p.isActive;
        return matchesSearch && matchesCategory && matchesStatus;
    });

    useEffect(() => {
        if (searchParams.get('action') === 'new' && storeId) {
            openCreateModal();
        }
    }, [searchParams, storeId, openCreateModal]);

    return {
        state: {
            products: filteredProducts,
            allProducts: products,
            categories,
            loading,
            isModalOpen,
            isCatModalOpen,
            confirmModal,
            creating,
            uploading,
            editingProduct,
            deletingId,
            errorAlert,
            statusTab,
            searchTerm,
            categoryFilter,
            // Form state
            form: {
                name, price, description, stock, imageUrls, categoryId, sku, discountPrice, isActive, trackInventory, hasPrice,
                hasVariants, variants, newCatName
            }
        },
        actions: {
            loadData,
            setIsModalOpen,
            setIsCatModalOpen,
            setConfirmModal,
            setErrorAlert,
            setStatusTab,
            setSearchTerm,
            setCategoryFilter,
            setName, setPrice, setDescription, setStock, setImageUrls, setCategoryId, setSku, setDiscountPrice, setIsActive, setTrackInventory, setHasPrice,
            setHasVariants, setVariants, setNewCatName,
            handleProductImageUpload,
            handleVariantImageUpload,
            handleCreateCategory,
            handleDeleteCategory,
            openCreateModal,
            openEditModal,
            handleSaveProduct,
            confirmDeleteAction,
            handleToggleStatus,
            removeImage: (index: number) => setImageUrls(prev => prev.filter((_, i) => i !== index)),
            removeVariantImage: (vIdx: number, iIdx: number) => setVariants(prev => {
                const next = [...prev];
                if (next[vIdx]) next[vIdx] = { ...next[vIdx], images: (next[vIdx].images || []).filter((_, i) => i !== iIdx) };
                return next;
            })
        }
    };
}
