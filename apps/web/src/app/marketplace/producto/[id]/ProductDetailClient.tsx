'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Store as StoreIcon, ShoppingBag, ArrowLeft, ShieldCheck, MapPin, ExternalLink, MessageCircle, CheckCircle2, Clock } from 'lucide-react';
import { api } from '@/services/api';
import { useCart } from '@/contexts/CartContext';
import { Product } from '@/types/types';
import { formatCurrency } from '@/lib/utils';
import { getServicePriceLabel, isProductAvailable } from '@/lib/pricing';
import { buildWhatsAppLink } from '@/lib/whatsapp';

export default function ProductDetailClient() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;

    const { addItem } = useCart();

    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [added, setAdded] = useState(false);

    const handleAddToCart = () => {
        if (!product) return;
        const image = product.images?.[0] || product.variants?.[0]?.images?.[0];
        addItem({
            id: product.id,
            name: product.name,
            price: Number(product.discountPrice || product.price || 0),
            image,
            storeId: product.storeId,
            storeName: product.store?.name || 'Tienda',
            storeSlug: product.store?.slug || '',
            storeLogoUrl: product.store?.logoUrl || undefined,
            storeCountry: product.store?.country || undefined,
            itemType: product.itemType || 'product',
            quantity: 1,
        });
        setAdded(true);
        setTimeout(() => setAdded(false), 2000);
    };

    useEffect(() => {
        const fetchProduct = async () => {
            setLoading(true);
            try {
                const data = await api.getProduct(id);
                setProduct(data);
                
                const firstImage = data.images?.[0] || data.variants?.[0]?.images?.[0];
                if (firstImage) setSelectedImage(firstImage);
            } catch (error) {
                console.error('Error fetching product:', error);
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchProduct();
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-[70vh] flex items-center justify-center bg-gray-50">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!product || !product.store) {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center bg-gray-50 text-center px-4">
                <ShoppingBag className="w-20 h-20 text-gray-300 mb-6" />
                <h1 className="text-3xl font-black text-gray-900 mb-4">Producto no encontrado</h1>
                <p className="text-gray-500 mb-8 max-w-md">El producto que buscas ya no existe o fue retirado del marketplace.</p>
                <Link href="/marketplace" className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-bold hover:bg-blue-700 transition-colors">
                    Explorar el Marketplace
                </Link>
            </div>
        );
    }

    const allImages = [
        ...(product.images || []),
        ...(product.variants?.flatMap(v => v.images || []) || [])
    ].filter(Boolean);
    
    // Deduplicate images
    const uniqueImages = Array.from(new Set(allImages));
    
    const displayPrice = product.discountPrice || product.price || 0;
    const isPriceHidden = displayPrice === 0 || displayPrice === null;
    const available = isProductAvailable(product);
    const isService = product.itemType === 'service';

    return (
        <div className="bg-gray-50 min-h-screen pb-24 pt-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Back button */}
                <button 
                    onClick={() => router.back()}
                    className="mb-8 w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:text-blue-600 hover:border-blue-600 transition-colors shadow-sm"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>

                <div className="bg-white rounded-[3rem] shadow-xl border border-gray-100 overflow-hidden">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 lg:gap-8">
                        
                        {/* Image Gallery */}
                        <div className="p-6 lg:p-12 flex flex-col items-center">
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="w-full aspect-square relative bg-gray-50 rounded-[2rem] overflow-hidden shadow-inner flex items-center justify-center border border-gray-100"
                            >
                                {selectedImage ? (
                                    <Image src={selectedImage} alt={product.name} fill className="object-contain p-4" />
                                ) : (
                                    <ShoppingBag className="w-24 h-24 text-gray-300" />
                                )}
                                
                                {product.discountPrice && !isPriceHidden && (
                                    <div className="absolute top-6 left-6 bg-red-500 text-white px-4 py-2 rounded-xl font-black text-sm uppercase tracking-widest shadow-lg">
                                        Oferta
                                    </div>
                                )}
                            </motion.div>
                            
                            {uniqueImages.length > 1 && (
                                <div className="flex gap-4 mt-6 overflow-x-auto pb-4 w-full justify-center hide-scrollbar">
                                    {uniqueImages.map((img, idx) => (
                                        <button 
                                            key={idx}
                                            onClick={() => setSelectedImage(img)}
                                            className={`relative w-20 h-20 shrink-0 rounded-2xl overflow-hidden border-2 transition-all ${selectedImage === img ? 'border-blue-600 shadow-md scale-105' : 'border-gray-100 hover:border-gray-300'}`}
                                        >
                                            <Image src={img} alt={`Preview ${idx}`} fill className="object-cover" />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Product Info */}
                        <div className="p-8 lg:p-12 lg:pl-0 flex flex-col h-full bg-gray-50/50 lg:bg-transparent lg:border-l border-gray-100">
                            
                            {/* Store mini-header */}
                            <Link href={`/marketplace/tienda/${product.store.slug}`} className="inline-flex items-center gap-3 bg-white border border-gray-200 px-4 py-2 rounded-2xl mb-6 hover:border-blue-300 hover:shadow-md transition-all w-max group">
                                <div className="w-8 h-8 relative rounded-lg bg-gray-100 overflow-hidden border border-gray-200">
                                    {product.store.logoUrl ? (
                                        <Image src={product.store.logoUrl} alt={product.store.name} fill className="object-contain" />
                                    ) : (
                                        <StoreIcon className="w-full h-full p-1.5 text-gray-400" />
                                    )}
                                </div>
                                <span className="font-bold text-sm text-gray-700 group-hover:text-blue-600">Por {product.store.name}</span>
                                <ExternalLink className="w-3.5 h-3.5 text-gray-400 group-hover:text-blue-500" />
                            </Link>

                            <h1 className="text-3xl md:text-5xl font-black text-gray-900 mb-6 tracking-tight leading-tight">
                                {product.name}
                            </h1>

                            <div className="mb-8">
                                {isService ? (
                                    /* Services are quoted by mode, never added to the cart. */
                                    <div className="text-5xl font-black text-gray-900">
                                        {getServicePriceLabel(
                                            product.price != null ? Number(product.price) : null,
                                            product.pricingMode,
                                            product.store?.country,
                                        )}
                                    </div>
                                ) : isPriceHidden ? (
                                    <div className="text-2xl font-black text-blue-600">
                                        Precio a consultar
                                    </div>
                                ) : (
                                    <div className="flex items-end gap-4">
                                        <span className="text-5xl font-black text-gray-900">
                                            {formatCurrency(displayPrice, product.store?.country)}
                                        </span>
                                        {product.discountPrice && (
                                            <span className="text-2xl font-bold text-gray-400 line-through mb-1">
                                                {formatCurrency(product.price || 0, product.store?.country)}
                                            </span>
                                        )}
                                    </div>
                                )}

                                {!available && !isPriceHidden && !isService && (
                                    <div className="mt-4 inline-flex items-center gap-2 bg-amber-50 text-amber-700 border border-amber-200 px-4 py-2.5 rounded-xl">
                                        <Clock className="w-4 h-4" />
                                        <span className="text-sm font-black">
                                            Producto por encargo — contacta al comercio para confirmar disponibilidad
                                        </span>
                                    </div>
                                )}
                            </div>

                            <div className="prose prose-blue text-gray-600 font-medium mb-10 max-w-none">
                                {product.description ? (
                                    <p className="whitespace-pre-line leading-relaxed">{product.description}</p>
                                ) : (
                                    <p className="italic text-gray-400">Este producto no tiene descripción.</p>
                                )}
                            </div>

                            {/* Trust signals */}
                            <div className="flex flex-col sm:flex-row gap-4 mb-10 text-sm font-bold text-gray-500">
                                <div className="flex items-center gap-2 bg-white px-4 py-3 rounded-xl border border-gray-100 shadow-sm">
                                    <ShieldCheck className="w-5 h-5 text-emerald-500" />
                                    Compra segura garantizada
                                </div>
                                {product.store.city && (
                                    <div className="flex items-center gap-2 bg-white px-4 py-3 rounded-xl border border-gray-100 shadow-sm">
                                        <MapPin className="w-5 h-5 text-blue-500" />
                                        Envíos desde {product.store.city}
                                    </div>
                                )}
                            </div>

                            {/* Call to action */}
                            <div className="mt-auto pt-8 border-t border-gray-200">
                                <div className="flex flex-col sm:flex-row gap-3">
                                    {!isPriceHidden && available && !isService && (
                                        <button
                                            onClick={handleAddToCart}
                                            className={`flex-1 py-5 rounded-[1.5rem] font-black text-lg flex items-center justify-center gap-3 transition-all hover:scale-105 active:scale-95 shadow-xl ${
                                                added
                                                    ? 'bg-emerald-500 text-white shadow-emerald-500/30'
                                                    : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-blue-600/30'
                                            }`}
                                        >
                                            {added ? (
                                                <>
                                                    <CheckCircle2 className="w-6 h-6" />
                                                    Agregado al carrito
                                                </>
                                            ) : (
                                                <>
                                                    <ShoppingBag className="w-6 h-6" />
                                                    Agregar al carrito
                                                </>
                                            )}
                                        </button>
                                    )}

                                    {/* Services are an inquiry: link straight to WhatsApp
                                        instead of the store's stock modal. */}
                                    {isService && product.store.whatsappNumber ? (
                                        <a
                                            href={buildWhatsAppLink({
                                                phone: product.store.whatsappNumber,
                                                type: 'service',
                                                name: product.name,
                                                storeName: product.store.name,
                                            })}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex-1 py-5 rounded-[1.5rem] font-black text-lg flex items-center justify-center gap-3 transition-all hover:scale-105 active:scale-95 shadow-xl bg-green-500 text-white shadow-green-500/30"
                                        >
                                            <MessageCircle className="w-6 h-6" />
                                            Consultar por WhatsApp
                                        </a>
                                    ) : (
                                        <Link
                                            href={`/${product.store.slug}?p=${product.id}`}
                                            className={`${isPriceHidden ? 'w-full' : 'flex-1'} py-5 rounded-[1.5rem] font-black text-lg flex items-center justify-center gap-3 transition-all hover:scale-105 active:scale-95 shadow-xl ${
                                                isPriceHidden
                                                    ? 'bg-gradient-to-r from-gray-800 to-gray-900 text-white shadow-gray-900/20'
                                                    : 'bg-white border-2 border-gray-200 text-gray-900 hover:border-blue-300'
                                            }`}
                                        >
                                            {isPriceHidden ? (
                                                <>
                                                    <MessageCircle className="w-6 h-6" />
                                                    Consultar precio
                                                </>
                                            ) : (
                                                <>
                                                    <ExternalLink className="w-5 h-5" />
                                                    Comprar en {product.store.name}
                                                </>
                                            )}
                                        </Link>
                                    )}
                                </div>
                                <p className="text-center text-xs font-bold text-gray-400 mt-4 uppercase tracking-widest">
                                    {isService
                                        ? 'Contacta al comercio para más información'
                                        : isPriceHidden
                                            ? 'Contacta al comercio para más información'
                                            : 'Agrega al carrito para seguir comprando en el marketplace'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
