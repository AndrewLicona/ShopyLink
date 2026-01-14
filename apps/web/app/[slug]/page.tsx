import { StoreView } from './StoreView';
import { api } from '@/lib/api';
import { ShoppingBag } from 'lucide-react';
import { Metadata } from 'next';
import Link from 'next/link';
import type { Product, Category } from '@/lib/types';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params;
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/stores/${slug}`, { next: { revalidate: 60 } });
        if (!response.ok) return { title: 'Tienda no encontrada | ShopyLink' };

        const store = await response.json();
        return {
            title: `${store.name} | Catálogo Virtual`,
            description: `Mira el catálogo de ${store.name} y haz tu pedido por WhatsApp.`,
            openGraph: {
                images: store.logoUrl ? [store.logoUrl] : [],
            }
        };
    } catch {
        return { title: 'ShopyLink' };
    }
}

export default async function StorePage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;

    try {
        // Fetch store by slug (public endpoint) - Server side
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/stores/${slug}`, {
            next: { revalidate: 60 } // Cache for 1 minute
        });

        if (response.status === 404) {
            return (
                <div className="min-h-screen bg-[var(--bg)] flex flex-col items-center justify-center p-6 text-center">
                    <div className="w-32 h-32 bg-[var(--secondary)] rounded-[3rem] flex items-center justify-center mb-8 text-[var(--text)]/20 animate-bounce duration-[3000ms]">
                        <ShoppingBag className="w-16 h-16" />
                    </div>
                    <h1 className="text-4xl font-black text-[var(--text)] mb-4 leading-tight">
                        ¡Ups! Esta tienda <br className="hidden sm:block" /> no está disponible
                    </h1>
                    <p className="text-[var(--text)]/60 max-w-sm mb-10 font-medium">
                        El enlace que seguiste no parece ser correcto o la tienda ha cambiado de dirección.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
                        <Link
                            href="/"
                            className="flex-1 bg-[var(--primary)] text-white px-8 py-5 rounded-[2rem] font-black text-lg hover:scale-105 transition-all shadow-xl active:scale-95 flex items-center justify-center"
                        >
                            Ir al Inicio
                        </Link>
                        <Link
                            href="/signup"
                            className="flex-1 bg-[var(--bg)] text-[var(--text)] border-2 border-[var(--border)] px-8 py-5 rounded-[2rem] font-black text-lg hover:bg-[var(--secondary)] transition-all active:scale-95 flex items-center justify-center"
                        >
                            Crear mi Tienda
                        </Link>
                    </div>
                </div>
            );
        }

        const storeData = await response.json();

        // Fetch products and categories - Server side
        const [productsData, categoriesData] = await Promise.all([
            api.getProducts(storeData.id),
            api.getCategories(storeData.id)
        ]);

        const activeProducts = productsData.filter((p: Product) =>
            p.isActive && (!p.trackInventory || (p.inventory && p.inventory.stock > 0))
        );

        // Filter categories: Only show categories that have at least one active product
        const activeCategoryIds = new Set(activeProducts.map((p: Product) => p.categoryId));
        const visibleCategories = categoriesData.filter((c: Category) => activeCategoryIds.has(c.id));

        return (
            <StoreView
                store={storeData}
                products={activeProducts}
                categories={visibleCategories}
            />
        );

    } catch (err) {
        console.error('Error loading store on server:', err);
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-gray-500 font-bold">Error al cargar la tienda. Por favor intenta de nuevo.</p>
            </div>
        );
    }
}
