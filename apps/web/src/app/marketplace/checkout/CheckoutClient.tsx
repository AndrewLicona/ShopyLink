'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
    ArrowLeft,
    CheckCircle2,
    Loader2,
    MessageCircle,
    Minus,
    Plus,
    ShoppingBag,
    Store as StoreIcon,
    Trash2,
    AlertTriangle,
} from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { api } from '@/services/api';
import { formatCurrency, getCurrencyForCountry } from '@/lib/utils';
import { PhoneInput } from '@/components/atoms/PhoneInput';
import type { CreateOrderResponse } from '@/types/types';

interface CreatedOrder {
    storeId: string;
    storeName: string;
    storeSlug: string;
    storeCountry?: string;
    total: number;
    whatsappLink: string;
}

export default function CheckoutClient() {
    const { groups, total, count, setQuantity, removeItem, clearStore, clearAll, hydrated } =
        useCart();

    const [customerName, setCustomerName] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');
    const [customerAddress, setCustomerAddress] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [created, setCreated] = useState<CreatedOrder[]>([]);
    const [failedStores, setFailedStores] = useState<string[]>([]);

    // Tiendas de países distintos usan monedas distintas: el total global solo
    // tiene sentido cuando todas comparten la misma moneda.
    const multiCurrency = new Set(
        groups.map((g) => getCurrencyForCountry(g.storeCountry).code),
    ).size > 1;

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setError('');

        if (!customerName.trim()) {
            setError('Escribe tu nombre para continuar.');
            return;
        }
        if (groups.length === 0) {
            setError('Tu carrito está vacío.');
            return;
        }

        setSubmitting(true);
        const results: CreatedOrder[] = [];
        const failures: string[] = [];

        // One order per store — each merchant fulfils and confirms their own order.
        for (const group of groups) {
            try {
                const response = (await api.createOrder({
                    storeId: group.storeId,
                    customerName: customerName.trim(),
                    customerPhone: customerPhone.trim() || undefined,
                    customerAddress: customerAddress.trim() || undefined,
                    items: group.items.map((item) => ({
                        productId: item.id,
                        quantity: item.quantity,
                        variantId: item.variantId,
                    })),
                })) as unknown as CreateOrderResponse;

                results.push({
                    storeId: group.storeId,
                    storeName: group.storeName,
                    storeSlug: group.storeSlug,
                    storeCountry: group.storeCountry,
                    total: group.total,
                    whatsappLink: response.whatsappLink,
                });

                // Remove only the items that were successfully ordered.
                clearStore(group.storeId);
            } catch (err) {
                console.error(`Error creating order for ${group.storeName}:`, err);
                failures.push(group.storeName);
            }
        }

        setSubmitting(false);

        if (results.length === 0) {
            setError(
                'No pudimos crear los pedidos. Revisa la conexión e inténtalo de nuevo.',
            );
            setFailedStores(failures);
            return;
        }

        setCreated(results);
        setFailedStores(failures);
    };

    const openWhatsApp = (order: CreatedOrder) => {
        window.open(order.whatsappLink, '_blank', 'noopener,noreferrer');
    };

    /* ---------------- Success screen ---------------- */
    if (created.length > 0) {
        return (
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pb-24">
                <div className="text-center mb-10">
                    <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-5">
                        <CheckCircle2 className="w-10 h-10 text-emerald-600" />
                    </div>
                    <h1 className="text-3xl font-black text-gray-900">
                        ¡Tu pedido fue creado!
                    </h1>
                    <p className="text-gray-500 font-medium mt-2">
                        Envía el mensaje de WhatsApp a cada tienda para confirmar tu pedido.
                    </p>
                </div>

                {failedStores.length > 0 && (
                    <div className="mb-6 bg-amber-50 border border-amber-200 rounded-2xl p-4 flex gap-3">
                        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                            <p className="font-black text-amber-900 text-sm">
                                No se pudo crear el pedido de: {failedStores.join(', ')}
                            </p>
                            <p className="text-amber-700 text-xs font-medium mt-1">
                                Esos productos siguen en tu carrito. Intenta de nuevo.
                            </p>
                        </div>
                    </div>
                )}

                <div className="space-y-4">
                    {created.map((order) => (
                        <div
                            key={order.storeId}
                            className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm"
                        >
                            <div className="flex items-center justify-between gap-4 mb-4">
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center shrink-0">
                                        <StoreIcon className="w-5 h-5 text-blue-600" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="font-black text-gray-900 truncate">
                                            {order.storeName}
                                        </p>
                                        <p className="text-xs font-bold text-gray-400">
                                            Pedido por {formatCurrency(order.total, order.storeCountry)}
                                        </p>
                                    </div>
                                </div>
                                <span className="bg-emerald-100 text-emerald-700 text-[10px] font-black px-2.5 py-1 rounded-lg uppercase tracking-wider shrink-0">
                                    Listo
                                </span>
                            </div>

                            <button
                                onClick={() => openWhatsApp(order)}
                                className="w-full flex items-center justify-center gap-3 bg-green-500 text-white py-4 rounded-2xl font-black text-sm hover:bg-green-600 transition-all active:scale-95 shadow-lg shadow-green-500/20"
                            >
                                <MessageCircle className="w-5 h-5" />
                                Enviar pedido a {order.storeName}
                            </button>
                        </div>
                    ))}
                </div>

                <div className="mt-10 flex flex-col sm:flex-row gap-3 justify-center">
                    <Link
                        href="/marketplace"
                        className="bg-gray-900 text-white px-6 py-3.5 rounded-2xl font-black text-sm text-center hover:bg-gray-800 transition-all active:scale-95"
                    >
                        Seguir comprando
                    </Link>
                    <button
                        onClick={() => {
                            setCreated([]);
                            clearAll();
                        }}
                        className="bg-white border border-gray-200 text-gray-700 px-6 py-3.5 rounded-2xl font-black text-sm hover:bg-gray-50 transition-all active:scale-95"
                    >
                        Vaciar carrito
                    </button>
                </div>
            </div>
        );
    }

    /* ---------------- Checkout form ---------------- */
    return (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pb-24">
            <Link
                href="/marketplace"
                className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-blue-600 transition-colors mb-6"
            >
                <ArrowLeft className="w-4 h-4" />
                Volver al marketplace
            </Link>

            <h1 className="text-3xl sm:text-4xl font-black text-gray-900 mb-2">
                Finalizar pedido
            </h1>
            <p className="text-gray-500 font-medium mb-10">
                {groups.length === 0
                    ? 'Tu carrito está vacío.'
                    : groups.length === 1
                        ? `1 tienda · ${count} ${count === 1 ? 'producto' : 'productos'}`
                        : `${groups.length} tiendas · ${count} ${count === 1 ? 'producto' : 'productos'}`}
            </p>

            {!hydrated ? (
                <div className="grid lg:grid-cols-2 gap-8">
                    <div className="h-64 bg-gray-100 rounded-3xl animate-pulse" />
                    <div className="h-64 bg-gray-100 rounded-3xl animate-pulse" />
                </div>
            ) : groups.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-[3rem] border-2 border-dashed border-gray-200">
                    <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h2 className="text-2xl font-black text-gray-900 mb-2">
                        No hay nada que pedir todavía
                    </h2>
                    <p className="text-gray-500 font-medium mb-6">
                        Agrega productos desde el marketplace, incluso de distintas tiendas.
                    </p>
                    <Link
                        href="/marketplace"
                        className="inline-block bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold hover:bg-blue-700 transition-colors"
                    >
                        Explorar el marketplace
                    </Link>
                </div>
            ) : (
                <div className="grid lg:grid-cols-2 gap-8 items-start">
                    {/* Items */}
                    <div className="space-y-5">
                        {groups.map((group) => (
                            <div
                                key={group.storeId}
                                className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm"
                            >
                                <div className="p-5 border-b border-gray-100 flex items-center justify-between gap-3 bg-gray-50/50">
                                    <div className="flex items-center gap-2 min-w-0">
                                        <StoreIcon className="w-4 h-4 text-blue-600 shrink-0" />
                                        <span className="font-black text-gray-900 truncate">
                                            {group.storeName}
                                        </span>
                                    </div>
                                    <span className="font-black text-sm text-gray-900 shrink-0">
                                        {formatCurrency(group.total, group.storeCountry)}
                                    </span>
                                </div>

                                <div className="p-5 space-y-5">
                                    {group.items.map((item) => (
                                        <div key={item.id + (item.variantId || '')} className="flex gap-4">
                                            <div className="w-16 h-16 bg-gray-50 rounded-xl flex items-center justify-center overflow-hidden border border-gray-100 relative shrink-0">
                                                {item.image ? (
                                                    <Image
                                                        src={item.image}
                                                        alt={item.name}
                                                        fill
                                                        className="object-cover"
                                                        sizes="64px"
                                                    />
                                                ) : (
                                                    <ShoppingBag className="w-5 h-5 text-gray-300" />
                                                )}
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <p className="font-black text-sm text-gray-900 leading-snug">
                                                    {item.name}
                                                </p>
                                                {item.variantName && (
                                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                                        {item.variantName}
                                                    </p>
                                                )}
                                                <p className="text-blue-600 font-black text-xs mt-1">
                                                    {formatCurrency(item.price, group.storeCountry)}
                                                </p>
                                                <div className="flex items-center gap-3 mt-2">
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            setQuantity(item.id, item.variantId, item.quantity - 1)
                                                        }
                                                        className="p-1.5 border border-gray-200 rounded-lg hover:bg-gray-100 text-gray-500 active:scale-90 transition-all"
                                                        aria-label="Restar unidad"
                                                    >
                                                        <Minus className="w-3.5 h-3.5" />
                                                    </button>
                                                    <span className="font-black text-xs w-4 text-center text-gray-900">
                                                        {item.quantity}
                                                    </span>
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            setQuantity(item.id, item.variantId, item.quantity + 1)
                                                        }
                                                        className="p-1.5 border border-gray-200 rounded-lg hover:bg-gray-100 text-gray-500 active:scale-90 transition-all"
                                                        aria-label="Sumar unidad"
                                                    >
                                                        <Plus className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="flex flex-col items-end justify-between">
                                                <button
                                                    type="button"
                                                    onClick={() => removeItem(item.id, item.variantId)}
                                                    className="text-gray-300 hover:text-red-500 transition-colors"
                                                    aria-label="Quitar producto"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                                <p className="font-black text-sm text-gray-900">
                                                    {formatCurrency(item.price * item.quantity, group.storeCountry)}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Form */}
                    <form
                        onSubmit={handleSubmit}
                        className="bg-white border border-gray-100 rounded-3xl p-6 sm:p-8 shadow-sm lg:sticky lg:top-8"
                    >
                        <h2 className="text-xl font-black text-gray-900 mb-1">
                            Tus datos
                        </h2>
                        <p className="text-sm font-medium text-gray-500 mb-6">
                            Se enviarán a cada tienda junto con el detalle de tu pedido.
                        </p>

                        <div className="space-y-5">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                    Nombre completo <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={customerName}
                                    onChange={(e) => setCustomerName(e.target.value)}
                                    placeholder="Ej. Ana Rodríguez"
                                    className="w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-gray-50/30 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all text-gray-900"
                                />
                            </div>

                            <PhoneInput
                                label="WhatsApp (opcional)"
                                value={customerPhone}
                                onChange={setCustomerPhone}
                                placeholder="300 123 4567"
                            />

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                    Dirección de entrega (opcional)
                                </label>
                                <textarea
                                    value={customerAddress}
                                    onChange={(e) => setCustomerAddress(e.target.value)}
                                    placeholder="Calle, número, barrio..."
                                    rows={3}
                                    className="w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-gray-50/30 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all text-gray-900 resize-none"
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="mt-5 bg-red-50 border border-red-200 rounded-xl p-3.5 flex gap-2.5">
                                <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                                <p className="text-sm font-bold text-red-700">{error}</p>
                            </div>
                        )}

                        <div className="mt-7 pt-6 border-t border-gray-100">
                            <div className="flex justify-between items-center mb-1">
                                <span className="font-bold text-gray-600">Total estimado</span>
                                <span className="text-2xl font-black text-gray-900">
                                    {multiCurrency
                                        ? `${groups.length} pedidos`
                                        : formatCurrency(total, groups[0]?.storeCountry)}
                                </span>
                            </div>
                            {groups.length > 1 && (
                                <p className="text-xs font-medium text-gray-400 mb-4">
                                    Repartido en {groups.length} pedidos, uno por tienda.
                                </p>
                            )}

                            <button
                                type="submit"
                                disabled={submitting}
                                className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black text-lg flex items-center justify-center gap-3 hover:bg-blue-700 transition-all active:scale-95 disabled:opacity-70 disabled:active:scale-100 shadow-xl shadow-blue-600/20"
                            >
                                {submitting ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Creando pedidos...
                                    </>
                                ) : (
                                    'Confirmar pedido'
                                )}
                            </button>

                            <p className="text-[11px] font-medium text-gray-400 text-center mt-4 leading-relaxed">
                                No se realiza ningún cobro. Al confirmar, podrás enviar el pedido
                                por WhatsApp a cada tienda.
                            </p>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}
