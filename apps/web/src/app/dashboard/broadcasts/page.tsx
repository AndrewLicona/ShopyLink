'use client';

import { useCallback, useEffect, useState } from 'react';
import { api } from '@/services/api';
import { Bell, CheckCircle2, Clock, Info, Megaphone, RefreshCw, TriangleAlert } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Broadcast { id: string; title: string; content: string; type: 'INFO' | 'WARNING' | 'PROMOTION' | 'SUCCESS'; createdAt: string; expiresAt?: string | null }
const TYPE_STYLES = {
    INFO: { label: 'Información', color: 'text-blue-600 bg-blue-500/10', icon: Info },
    WARNING: { label: 'Aviso', color: 'text-amber-600 bg-amber-500/10', icon: TriangleAlert },
    PROMOTION: { label: 'Promoción', color: 'text-indigo-600 bg-indigo-500/10', icon: Megaphone },
    SUCCESS: { label: 'Novedad', color: 'text-emerald-600 bg-emerald-500/10', icon: CheckCircle2 },
};
const dateLabel = (date: string) => new Date(date).toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' });

export default function BroadcastsPage() {
    const [broadcasts, setBroadcasts] = useState<Broadcast[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const load = useCallback(async () => {
        setLoading(true); setError(false);
        try { const data = await api.getActiveBroadcasts(); setBroadcasts(Array.isArray(data) ? data : []); }
        catch (err) { console.error('Error loading broadcasts:', err); setError(true); }
        finally { setLoading(false); }
    }, []);
    useEffect(() => { void load(); }, [load]);

    return <div className="mx-auto max-w-[1100px] space-y-6 pb-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-[11px] font-black uppercase tracking-[0.18em] text-[var(--primary)]">Mantente al día</p><h1 className="mt-2 text-3xl font-black tracking-tight text-[var(--text)] sm:text-4xl">Comunicados</h1><p className="mt-2 max-w-xl text-sm leading-relaxed text-[var(--text)]/55">Novedades, avisos e información importante para tu tienda.</p></div><button type="button" onClick={load} disabled={loading} className="inline-flex min-h-11 w-fit items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-2.5 text-sm font-bold text-[var(--text)] hover:bg-[var(--secondary)] disabled:opacity-50"><RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} /> Actualizar</button></div>
        <div className="flex items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 sm:p-5"><span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--primary)]/10 text-[var(--primary)]"><Bell className="h-5 w-5" /></span><div><p className="text-sm font-black text-[var(--text)]">Tu centro de novedades</p><p className="mt-0.5 text-xs text-[var(--text)]/50">{loading ? 'Cargando mensajes…' : `${broadcasts.length} ${broadcasts.length === 1 ? 'comunicado activo' : 'comunicados activos'}`}</p></div></div>
        {error ? <div role="alert" className="rounded-3xl border border-red-500/20 bg-red-500/5 p-6 text-sm text-red-600"><p className="font-bold">No pudimos cargar los comunicados.</p><button onClick={load} className="mt-2 font-bold underline">Volver a intentar</button></div> : loading ? <div className="grid gap-3 md:grid-cols-2">{[1,2].map(i => <div key={i} className="h-40 animate-pulse rounded-3xl border border-[var(--border)] bg-[var(--surface)]" />)}</div> : broadcasts.length === 0 ? <div className="rounded-3xl border border-dashed border-[var(--border)] bg-[var(--surface)] px-6 py-16 text-center"><span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--secondary)] text-[var(--text)]/40"><Bell className="h-6 w-6" /></span><h2 className="mt-4 text-lg font-black text-[var(--text)]">Todo al día</h2><p className="mt-2 text-sm text-[var(--text)]/50">No hay comunicados activos por ahora. Aquí aparecerán las próximas novedades.</p></div> : <div className="grid items-start gap-3 md:grid-cols-2">{broadcasts.map(b => { const style = TYPE_STYLES[b.type] ?? TYPE_STYLES.INFO; const Icon = style.icon; return <article key={b.id} className="min-w-0 rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-6"><div className="flex items-start gap-3"><span className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-xl',style.color)}><Icon className="h-5 w-5" /></span><div className="min-w-0"><p className="text-[10px] font-black uppercase tracking-widest text-[var(--text)]/40">{style.label}</p><h2 className="mt-1 break-words text-base font-black text-[var(--text)]">{b.title}</h2></div></div><p className="mt-4 whitespace-pre-wrap break-words text-sm leading-relaxed text-[var(--text)]/70">{b.content}</p><div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-[var(--border)] pt-4 text-xs text-[var(--text)]/45"><span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{dateLabel(b.createdAt)}</span>{b.expiresAt && <span>Vence {dateLabel(b.expiresAt)}</span>}</div></article>; })}</div>}
    </div>;
}
