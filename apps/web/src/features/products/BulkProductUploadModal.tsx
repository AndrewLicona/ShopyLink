'use client';

import { useState } from 'react';
import { X, Upload, Plus, Trash2, Check, AlertCircle, FileSpreadsheet } from 'lucide-react';
import { Button } from '@/components/atoms/Button';
import { api } from '@/services/api';
import { findSimilarProducts, normalizeProductName } from '@/lib/productDuplicates';
import type { Category, Product } from '@/types/types';

function parseCsvLine(line: string): string[] {
    const fields: string[] = [];
    let field = '';
    let quoted = false;
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
            if (quoted && line[i + 1] === '"') { field += '"'; i++; }
            else quoted = !quoted;
        } else if (char === ',' && !quoted) { fields.push(field); field = ''; }
        else field += char;
    }
    if (quoted) throw new Error('Comillas sin cerrar en el CSV.');
    fields.push(field);
    return fields;
}

interface BulkProductRow {
    name: string;
    price: string;
    description: string;
    categoryName: string;
    itemType: 'product' | 'service';
}

interface BulkProductUploadModalProps {
    isOpen: boolean;
    onClose: () => void;
    storeId: string;
    categories: Category[];
    existingProducts: Product[];
    onSuccess: () => void;
}

export function BulkProductUploadModal({
    isOpen,
    onClose,
    storeId,
    categories,
    existingProducts,
    onSuccess,
}: BulkProductUploadModalProps) {
    const [rows, setRows] = useState<BulkProductRow[]>([
        { name: '', price: '', description: '', categoryName: '', itemType: 'product' },
    ]);
    const [pasteText, setPasteText] = useState('');
    const [isPasting, setIsPasting] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    if (!isOpen) return null;

    const duplicateRows = rows.flatMap((row, index) => {
        if (!normalizeProductName(row.name)) return [];
        const matches = findSimilarProducts(row.name, [...existingProducts, ...rows.slice(0, index).filter(r => r.name.trim())]);
        return matches.length ? [`Fila ${index + 1}: ${matches.map(match => match.name).join(', ')}`] : [];
    });

    const handleAddRow = () => {
        if (rows.length >= 50) { setError('El máximo es 50 productos por carga.'); return; }
        setRows([...rows, { name: '', price: '', description: '', categoryName: '', itemType: 'product' }]);
    };

    const handleRemoveRow = (index: number) => {
        if (rows.length === 1) {
            setRows([{ name: '', price: '', description: '', categoryName: '', itemType: 'product' }]);
            return;
        }
        setRows(rows.filter((_, i) => i !== index));
    };

    const handleRowChange = <K extends keyof BulkProductRow>(
        index: number,
        field: K,
        value: BulkProductRow[K],
    ) => {
        const updated = [...rows];
        const currentRow = updated[index];
        if (currentRow) {
            updated[index] = { ...currentRow, [field]: value };
            setRows(updated);
        }
    };

    const handleProcessPaste = () => {
        if (!pasteText.trim()) return;

        // Split by lines
        setError(null);
        const lines = pasteText.trim().split(/\r?\n/);
        if (lines.length > 51) { setError('El máximo es 50 productos por carga.'); return; }
        const parsedRows: BulkProductRow[] = [];

        for (const line of lines) {
            if (!line.trim()) continue;
            // Split by tab (Excel/Sheets) or comma
            let cols: string[];
            try { cols = line.includes('\t') ? line.split('\t') : parseCsvLine(line); }
            catch { setError('Revisa las comillas del CSV. Cada producto debe ocupar una línea.'); return; }
            if (parsedRows.length === 0 && /^(nombre|name)$/i.test((cols[0] || '').trim())) continue;
            const name = cols[0]?.trim() || '';
            const price = cols[1]?.trim() || '';
            const description = cols[2]?.trim() || '';
            const categoryName = cols[3]?.trim() || '';

            if (name) {
                parsedRows.push({
                    name,
                    price,
                    description,
                    categoryName,
                    itemType: 'product',
                });
            }
        }

        if (parsedRows.length > 50) { setError('El máximo es 50 productos por carga.'); return; }
        if (parsedRows.length > 0) {
            setRows(parsedRows);
            setIsPasting(false);
            setPasteText('');
        }
    };

    const handleSubmit = async () => {
        setError(null);
        setSuccessMessage(null);

        // Validation: at least one valid row with name
        const validRows = rows.filter(r => r.name.trim().length > 0);
        if (validRows.length === 0) {
            setError('Ingresa al menos un producto con nombre.');
            return;
        }

        if (validRows.length !== rows.length) { setError('Completa el nombre de todas las filas o elimina las vacías.'); return; }
        if (validRows.length > 50) { setError('El máximo es 50 productos por carga.'); return; }
        const invalidPrice = validRows.findIndex(r => r.price.trim() && (!Number.isFinite(Number(r.price)) || Number(r.price) < 0));
        if (invalidPrice >= 0) { setError(`Revisa el precio de la fila ${invalidPrice + 1}. Usa un número con punto decimal.`); return; }
        const missingCategory = validRows.find(r => r.categoryName && !categories.some(c => normalizeProductName(c.name) === normalizeProductName(r.categoryName)));
        if (missingCategory) { setError(`La categoría "${missingCategory.categoryName}" no existe. Corrígela antes de importar.`); return; }

        // Map category names to IDs if matching
        const catMap = new Map<string, string>();
        categories.forEach(c => catMap.set(normalizeProductName(c.name), c.id));

        const productsPayload = validRows.map(r => ({
            name: r.name.trim(),
            description: r.description.trim() || undefined,
            price: r.price ? parseFloat(r.price) : undefined,
            categoryId: r.categoryName ? catMap.get(normalizeProductName(r.categoryName)) : undefined,
            itemType: r.itemType,
        }));

        setSubmitting(true);
        try {
            const res = await api.createBulkProducts(storeId, productsPayload);
            setSuccessMessage(`¡Se crearon ${res.created || productsPayload.length} productos con éxito!`);
            setTimeout(() => {
                onSuccess();
                onClose();
            }, 1200);
        } catch (err: any) {
            console.error('Error in bulk create:', err);
            setError(err?.message || 'Error al procesar la carga masiva.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
            <div className="bg-[var(--surface)] w-full max-w-4xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                {/* Modal Header */}
                <div className="flex items-center justify-between p-6 border-b border-[var(--border)]">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-[var(--primary)]/10 flex items-center justify-center text-[var(--primary)]">
                            <FileSpreadsheet className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-[var(--text)] uppercase tracking-tight">
                                Carga Masiva de Productos
                            </h3>
                            <p className="text-xs font-bold text-[var(--text)]/40">
                                Modo Fundador: añade o pega múltiples productos en segundos
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-[var(--secondary)] rounded-xl transition-colors text-[var(--text)]/40"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto flex-1 space-y-4">
                    {/* Mode selector */}
                    <div className="flex items-center justify-between gap-3">
                        <span className="text-xs font-black uppercase tracking-wider text-[var(--text)]/40">
                            {isPasting ? 'Pegar desde Excel o Sheets' : `Productos a ingresar (${rows.length})`}
                        </span>
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={() => setIsPasting(!isPasting)}
                                className="text-xs font-bold px-3 py-1.5 rounded-xl border border-[var(--border)] hover:bg-[var(--secondary)] transition-colors text-[var(--primary)]"
                            >
                                {isPasting ? 'Volver a la tabla' : 'Pegar desde Excel / CSV'}
                            </button>
                            {!isPasting && (
                                <button
                                    type="button"
                                    onClick={handleAddRow}
                                    className="text-xs font-bold px-3 py-1.5 rounded-xl bg-[var(--primary)]/10 text-[var(--primary)] hover:bg-[var(--primary)]/20 transition-colors flex items-center gap-1"
                                >
                                    <Plus className="w-3.5 h-3.5" />
                                    Fila
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Alerts */}
                    {error && (
                        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-600 flex items-center gap-2 text-xs font-bold">
                            <AlertCircle className="w-4 h-4 shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}
                    {duplicateRows.length > 0 && (
                        <div role="status" className="p-4 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 text-xs font-medium">
                            <strong>Posibles duplicados. Revísalos antes de importar:</strong> {duplicateRows.join(' · ')}
                        </div>
                    )}
                    {successMessage && (
                        <div className="p-4 rounded-2xl bg-green-500/10 border border-green-500/20 text-green-600 flex items-center gap-2 text-xs font-bold">
                            <Check className="w-4 h-4 shrink-0" />
                            <span>{successMessage}</span>
                        </div>
                    )}

                    {isPasting ? (
                        <div className="space-y-3">
                            <p className="text-xs text-[var(--text)]/60">
                                Copia filas desde tu hoja de cálculo (columnas: <b>Nombre | Precio | Descripción | Categoría</b>; máximo 50 filas, precio con punto decimal) y pégalas aquí:
                            </p>
                            <textarea
                                rows={8}
                                value={pasteText}
                                onChange={(e) => setPasteText(e.target.value)}
                                placeholder="Camisa Blanca	25.00	Camisa 100% algodón	Ropa&#10;Zapatos Oxford	60.00	Zapatos de cuero	Calzado"
                                className="w-full p-4 rounded-2xl bg-[var(--bg)] border border-[var(--border)] font-mono text-xs text-[var(--text)] outline-none focus:border-[var(--primary)] resize-none"
                            />
                            <div className="flex justify-end gap-2">
                                <Button variant="secondary" onClick={() => setIsPasting(false)} className="rounded-xl px-4 py-2 text-xs">
                                    Cancelar
                                </Button>
                                <Button variant="primary" onClick={handleProcessPaste} className="rounded-xl px-4 py-2 text-xs">
                                    Importar datos a la tabla
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="overflow-x-auto rounded-2xl border border-[var(--border)]">
                            <table className="w-full text-left text-xs border-collapse">
                                <thead>
                                    <tr className="bg-[var(--secondary)] border-b border-[var(--border)]">
                                        <th className="p-3 font-black text-[var(--text)]/60">Nombre *</th>
                                        <th className="p-3 font-black text-[var(--text)]/60 w-28">Precio</th>
                                        <th className="p-3 font-black text-[var(--text)]/60">Descripción</th>
                                        <th className="p-3 font-black text-[var(--text)]/60 w-36">Categoría</th>
                                        <th className="p-3 font-black text-[var(--text)]/60 w-28">Tipo</th>
                                        <th className="p-3 w-12 text-center"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {rows.map((row, idx) => (
                                        <tr key={idx} className="border-b border-[var(--border)] last:border-b-0">
                                            <td className="p-2">
                                                <input
                                                    type="text"
                                                    placeholder="Nombre del producto"
                                                    value={row.name}
                                                    onChange={(e) => handleRowChange(idx, 'name', e.target.value)}
                                                    className="w-full px-3 py-2 rounded-xl bg-[var(--bg)] border border-[var(--border)] text-xs font-bold text-[var(--text)] outline-none focus:border-[var(--primary)]"
                                                />
                                            </td>
                                            <td className="p-2">
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    placeholder="0.00"
                                                    value={row.price}
                                                    onChange={(e) => handleRowChange(idx, 'price', e.target.value)}
                                                    className="w-full px-3 py-2 rounded-xl bg-[var(--bg)] border border-[var(--border)] text-xs font-bold text-[var(--text)] outline-none focus:border-[var(--primary)]"
                                                />
                                            </td>
                                            <td className="p-2">
                                                <input
                                                    type="text"
                                                    placeholder="Detalles..."
                                                    value={row.description}
                                                    onChange={(e) => handleRowChange(idx, 'description', e.target.value)}
                                                    className="w-full px-3 py-2 rounded-xl bg-[var(--bg)] border border-[var(--border)] text-xs font-medium text-[var(--text)] outline-none focus:border-[var(--primary)]"
                                                />
                                            </td>
                                            <td className="p-2">
                                                <select
                                                    value={row.categoryName}
                                                    onChange={(e) => handleRowChange(idx, 'categoryName', e.target.value)}
                                                    className="w-full px-2 py-2 rounded-xl bg-[var(--bg)] border border-[var(--border)] text-xs font-bold text-[var(--text)] outline-none focus:border-[var(--primary)]"
                                                >
                                                    <option value="">Sin categoría</option>
                                                    {categories.map((c) => (
                                                        <option key={c.id} value={c.name}>
                                                            {c.name}
                                                        </option>
                                                    ))}
                                                </select>
                                            </td>
                                            <td className="p-2">
                                                <select
                                                    value={row.itemType}
                                                    onChange={(e) => handleRowChange(idx, 'itemType', e.target.value as any)}
                                                    className="w-full px-2 py-2 rounded-xl bg-[var(--bg)] border border-[var(--border)] text-xs font-bold text-[var(--text)] outline-none focus:border-[var(--primary)]"
                                                >
                                                    <option value="product">Producto</option>
                                                    <option value="service">Servicio</option>
                                                </select>
                                            </td>
                                            <td className="p-2 text-center">
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveRow(idx)}
                                                    className="p-1.5 text-red-500/50 hover:text-red-500 transition-colors rounded-lg hover:bg-red-500/10"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Footer Actions */}
                <div className="flex items-center justify-between p-6 border-t border-[var(--border)] bg-[var(--surface)]">
                    <span className="text-xs font-medium text-[var(--text)]/40">
                        {rows.filter(r => r.name.trim()).length} producto(s) listo(s) para subir
                    </span>
                    <div className="flex items-center gap-3">
                        <Button
                            variant="secondary"
                            onClick={onClose}
                            className="rounded-xl px-5 py-2.5 text-xs font-bold"
                        >
                            Cancelar
                        </Button>
                        <Button
                            variant="primary"
                            onClick={handleSubmit}
                            disabled={submitting}
                            className="rounded-xl px-6 py-2.5 text-xs font-bold"
                            leftIcon={submitting ? undefined : <Upload className="w-4 h-4" />}
                        >
                            {submitting ? 'Guardando...' : 'Crear Productos'}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
