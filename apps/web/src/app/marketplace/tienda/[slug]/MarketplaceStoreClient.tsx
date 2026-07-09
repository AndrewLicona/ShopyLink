'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Store as StoreIcon, MapPin, Eye, ShoppingBag, ExternalLink, ShieldCheck, Star } from 'lucide-react';
import { api } from '@/services/api';
import { Store } from '@/types/types';

export default function MarketplaceStoreClient() {
    const params = useParams();
    const slug = params.slug as string;

    const [store, setStore] = useState<Store | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStore = async () => {
            try {
                const data = await api.getStoreBySlug(slug);
                setStore(data);
                
                // Increment view count in the background
                if (data?.id) {
                    api.incrementStoreView(data.id).catch(console.error);
                }
            } catch (error) {
                console.error('Error fetching store:', error);
            } finally {
                setLoading(false);
            }
        };

        if (slug) fetchStore();
    }, [slug]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!store) {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center bg-gray-50 text-center px-4">
                <StoreIcon className="w-20 h-20 text-gray-300 mb-6" />
                <h1 className="text-3xl font-black text-gray-900 mb-4">Tienda no encontrada</h1>
                <p className="text-gray-500 mb-8 max-w-md">La tienda que estás buscando no existe o ha sido dada de baja del marketplace.</p>
                <Link href="/marketplace" className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-bold hover:bg-blue-700 transition-colors">
                    Volver al Marketplace
                </Link>
            </div>
        );
    }

    return (
        <div className="bg-gray-50 min-h-screen pb-24">
            {/* Store Cover */}
            <div className="h-64 md:h-80 w-full relative bg-gradient-to-br from-blue-900 via-indigo-800 to-blue-600 overflow-hidden">
                {store.featured && (
                    <div className="absolute top-6 right-6 lg:right-10 bg-yellow-400 text-yellow-900 px-4 py-2 rounded-full font-black text-xs uppercase tracking-widest flex items-center gap-2 shadow-lg z-10">
                        <Star className="w-4 h-4 fill-yellow-900" />
                        Tienda Destacada
                    </div>
                )}
            </div>

            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative -mt-24 z-10">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-[3rem] shadow-xl p-8 md:p-12 border border-gray-100"
                >
                    <div className="flex flex-col md:flex-row gap-8 items-center md:items-start text-center md:text-left">
                        {/* Logo */}
                        <div className="w-32 h-32 md:w-40 md:h-40 shrink-0 rounded-[2rem] bg-white shadow-lg border-8 border-white flex items-center justify-center overflow-hidden -mt-24 md:-mt-32 relative z-20">
                            {store.logoUrl ? (
                                <Image src={store.logoUrl} alt={store.name} fill className="object-contain p-2" />
                            ) : (
                                <StoreIcon className="w-16 h-16 text-gray-300" />
                            )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 space-y-4">
                            <div className="flex flex-col md:flex-row md:items-center gap-3">
                                <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight">{store.name}</h1>
                                <div className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mx-auto md:mx-0 w-max">
                                    <ShieldCheck className="w-4 h-4" />
                                    Verificada
                                </div>
                            </div>

                            <p className="text-lg text-gray-600 font-medium max-w-2xl">
                                {store.description || 'Bienvenido a nuestra tienda oficial en ShopyLink. Descubre nuestros productos y realiza tu pedido de forma segura.'}
                            </p>

                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm font-bold text-gray-500 pt-2">
                                <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-xl">
                                    <MapPin className="w-4 h-4 text-gray-400" />
                                    {store.city || store.country || 'Ubicación no especificada'}
                                </div>
                                <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-xl">
                                    <ShoppingBag className="w-4 h-4 text-emerald-500" />
                                    {store.orderCount || 0} pedidos
                                </div>
                                <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-xl">
                                    <Eye className="w-4 h-4 text-blue-500" />
                                    {(store.viewCount || 0) + 1} visitas
                                </div>
                            </div>
                        </div>

                        {/* CTA */}
                        <div className="shrink-0 w-full md:w-auto flex flex-col gap-3">
                            <Link 
                                href={`/${store.slug}`}
                                className="w-full bg-blue-600 text-white px-8 py-5 rounded-[1.5rem] font-black text-lg hover:bg-blue-700 transition-all hover:scale-105 active:scale-95 shadow-xl shadow-blue-600/20 flex items-center justify-center gap-3 group"
                            >
                                Visitar Tienda
                                <ExternalLink className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </Link>
                            {store.whatsappNumber && (
                                <a 
                                    href={`https://wa.me/${store.whatsappNumber.replace(/[^0-9]/g, '')}`} 
                                    target="_blank" 
                                    rel="noreferrer"
                                    className="w-full bg-green-50 text-green-700 px-8 py-4 rounded-[1.5rem] font-bold text-center hover:bg-green-100 transition-colors"
                                >
                                    Contactar WhatsApp
                                </a>
                            )}
                        </div>
                    </div>

                    {/* Tags */}
                    {store.tags && store.tags.length > 0 && (
                        <div className="mt-12 pt-8 border-t border-gray-100">
                            <h4 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-4 text-center md:text-left">Especialidades</h4>
                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                                {store.tags.map((tag, i) => (
                                    <span key={i} className="px-4 py-2 bg-gray-100 text-gray-600 rounded-xl text-sm font-bold">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </motion.div>
                
                {/* Information Notice */}
                <div className="mt-8 text-center text-gray-400 font-medium text-sm flex items-center justify-center gap-2">
                    <ShieldCheck className="w-5 h-5" />
                    Compras procesadas a través de la infraestructura segura de ShopyLink
                </div>
            </div>
        </div>
    );
}
