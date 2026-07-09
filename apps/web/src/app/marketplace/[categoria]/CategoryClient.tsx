'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { MapPin, Star, Filter, ArrowLeft, SlidersHorizontal, Store as StoreIcon, ShoppingBag } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { api } from '@/services/api';
import { Product } from '@/types/types';

export default function CategoryClient() {
    const params = useParams();
    // In Next.js router, param might be URI encoded
    const rawCategory = params.categoria as string;
    const category = decodeURIComponent(rawCategory);

    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchResults = async () => {
            setLoading(true);
            try {
                const data = await api.getMarketplaceProducts({ category });
                setProducts(data);
            } catch (error) {
                console.error('Error fetching category results:', error);
            } finally {
                setLoading(false);
            }
        };

        if (category) {
            fetchResults();
        }
    }, [category]);

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pb-24">
            <div className="mb-12 flex items-center gap-4">
                <Link href="/marketplace" className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:text-blue-600 hover:border-blue-600 transition-colors shadow-sm">
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div>
                    <h1 className="text-3xl font-black text-gray-900 capitalize">
                        {category}
                    </h1>
                    <p className="text-gray-500 font-medium mt-1">
                        Descubre los mejores productos en la categoría {category}
                    </p>
                </div>
            </div>

            {loading ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="bg-white border border-gray-100 rounded-3xl h-64 animate-pulse"></div>
                    ))}
                </div>
            ) : products.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                    {products.map((product, i) => (
                        <ProductCard key={product.id} product={product} index={i} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 bg-white rounded-[3rem] border-2 border-dashed border-gray-200 shadow-sm">
                    <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-2xl font-black text-gray-900 mb-2">No hay productos aquí</h3>
                    <p className="text-gray-500 font-medium">Aún no hay productos en la categoría "{category}".</p>
                    <Link href="/marketplace" className="mt-6 inline-block bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold hover:bg-blue-700 transition-colors">
                        Explorar todo
                    </Link>
                </div>
            )}
        </div>
    );
}

function ProductCard({ product, index }: { product: Product, index: number }) {
    const imageUrl = product.images?.[0] || product.variants?.[0]?.images?.[0];
    
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05, duration: 0.4 }}
        >
            <Link href={`/marketplace/producto/${product.id}`} className="block group h-full">
                <div className={`relative h-full bg-white rounded-3xl shadow-sm overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 flex flex-col ${product.discountPrice ? 'border-2 border-emerald-500 hover:border-emerald-400' : 'border border-gray-100 hover:border-blue-100'}`}>
                    <div className="h-40 sm:h-48 w-full relative bg-gray-50 flex items-center justify-center overflow-hidden">
                        {imageUrl ? (
                            <Image src={imageUrl} alt={product.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                        ) : (
                            <ShoppingBag className="w-8 h-8 text-gray-300" />
                        )}
                        {product.discountPrice && (
                            <div className="absolute top-3 left-3 bg-emerald-500 text-white px-2 py-1 rounded-lg text-[10px] font-black shadow-md z-10 uppercase tracking-wide">
                                Oferta
                            </div>
                        )}
                    </div>
                    
                    <div className="p-4 flex-1 flex flex-col">
                        <div className="text-[10px] font-black text-blue-500 mb-1.5 uppercase tracking-wider flex items-center gap-1">
                            <StoreIcon className="w-3 h-3" />
                            <span className="truncate">{product.store?.name || 'Tienda'}</span>
                        </div>
                        <h3 className="text-sm font-black text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug mb-3">
                            {product.name}
                        </h3>
                        <div className="flex items-center gap-2 mb-4 mt-auto">
                            {(!product.discountPrice && !product.price) ? (
                                <span className="text-sm font-black text-blue-600 bg-blue-50 px-2 py-1 rounded-lg">Precio a consultar</span>
                            ) : (
                                <>
                                    <span className="text-xl font-black text-gray-900">
                                        {formatCurrency(product.discountPrice || product.price || 0)}
                                    </span>
                                    {product.discountPrice && (
                                        <span className="text-sm font-bold text-gray-400 line-through">
                                            {formatCurrency(product.price || 0)}
                                        </span>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </Link>
        </motion.div>
    );
}
