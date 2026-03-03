'use client';

import React, { useState } from 'react';
import { formatCurrency, cn } from '@/lib/utils';

interface SalesChartProps {
    data: { date: string, amount: number }[];
    hideHeader?: boolean;
}

export function SalesChart({ data, hideHeader = false }: SalesChartProps) {
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

    if (data.length === 0) return null;

    const maxAmount = Math.max(...data.map(d => d.amount), 100);
    const height = 110;
    const width = 600;
    const padding = 15;

    const points = data.map((d, i) => {
        const x = (i / (data.length - 1)) * (width - padding * 2) + padding;
        const y = height - (d.amount / maxAmount) * (height - padding * 2) - padding;
        return `${x},${y}`;
    }).join(' ');

    const areaPath = `M ${padding},${height} ${points} L ${width - padding},${height} Z`;

    const ChartContent = (
        <div className="relative w-full flex flex-col h-full">
            {!hideHeader && (
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h3 className="text-xl font-black text-[var(--text)]">Actividad Semanal</h3>
                        <p className="text-[10px] font-bold text-[var(--text)]/30 uppercase tracking-widest mt-1">Ventas de los últimos 7 días</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-[var(--primary)] rounded-full shadow-[0_0_10px_var(--primary)]" />
                        <span className="text-[10px] font-black text-[var(--text)] uppercase tracking-wider">Ventas (7d)</span>
                    </div>
                </div>
            )}

            <div className="relative flex-1 w-full min-h-0">
                {/* Data Tooltip */}
                {hoveredIndex !== null && data[hoveredIndex] && (
                    <div
                        className="absolute z-20 bg-black text-white px-2 py-1 rounded text-[10px] font-black pointer-events-none transform -translate-x-1/2 -translate-y-full mb-2 shadow-xl border border-white/10"
                        style={{
                            left: `${(hoveredIndex / (data.length - 1)) * 100}%`,
                            top: `${height - (data[hoveredIndex].amount / maxAmount) * (height - padding * 2) - padding}px`
                        }}
                    >
                        {formatCurrency(data[hoveredIndex].amount)}
                        <div className="absolute top-full left-1/2 -translate-x-1/2 border-x-4 border-x-transparent border-t-4 border-t-black" />
                    </div>
                )}

                <svg
                    viewBox={`0 0 ${width} ${height}`}
                    className="w-full h-full overflow-visible"
                    preserveAspectRatio="none"
                >
                    {/* Grid Lines */}
                    {[0, 0.5, 1].map((p, i) => (
                        <line
                            key={i}
                            x1={padding}
                            y1={height - (p * (height - padding * 2)) - padding}
                            x2={width - padding}
                            y2={height - (p * (height - padding * 2)) - padding}
                            stroke="currentColor"
                            className="text-[var(--border)]"
                            strokeWidth="0.5"
                            strokeDasharray="4 4"
                        />
                    ))}

                    <defs>
                        <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.2" />
                            <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
                        </linearGradient>
                    </defs>

                    {/* Area */}
                    <path d={areaPath} fill="url(#chartGradient)" />

                    {/* Line */}
                    <polyline
                        points={points}
                        fill="none"
                        stroke="var(--primary)"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="opacity-80"
                    />

                    {/* Interaction Zones */}
                    {data.map((_, i) => {
                        const x = (i / (data.length - 1)) * (width - padding * 2) + padding;
                        return (
                            <rect
                                key={i}
                                x={x - (width / (data.length - 1)) / 2}
                                y={0}
                                width={width / (data.length - 1)}
                                height={height}
                                fill="transparent"
                                className="cursor-pointer"
                                onMouseEnter={() => setHoveredIndex(i)}
                                onMouseLeave={() => setHoveredIndex(null)}
                            />
                        );
                    })}

                    {/* Data Points */}
                    {data.map((d, i) => {
                        const x = (i / (data.length - 1)) * (width - padding * 2) + padding;
                        const y = height - (d.amount / maxAmount) * (height - padding * 2) - padding;
                        return (
                            <circle
                                key={i}
                                cx={x}
                                cy={y}
                                r={hoveredIndex === i ? 4 : 2.5}
                                className={cn(
                                    "transition-all duration-200",
                                    hoveredIndex === i ? "fill-white stroke-[var(--primary)] stroke-2" : "fill-[var(--primary)]"
                                )}
                            />
                        );
                    })}
                </svg>

            </div>

            {/* X-Axis Labels */}
            <div className="flex justify-between mt-4 px-2">
                {data.map((d, i) => {
                    const date = new Date(d.date + 'T12:00:00'); // Use noon to avoid timezone shift
                    const day = date.toLocaleDateString('es-ES', { weekday: 'narrow' }).toUpperCase();
                    const dateNum = date.getDate();
                    const monthNum = date.getMonth() + 1;

                    return (
                        <div key={i} className="flex flex-col items-center">
                            <span className={cn(
                                "text-[8px] font-black uppercase tracking-tighter transition-colors",
                                hoveredIndex === i ? "text-[var(--primary)] scale-110" :
                                    i === data.length - 1 ? "text-[var(--primary)]/60" : "text-[var(--text)]/20"
                            )}>
                                {day}
                            </span>
                            <span className={cn(
                                "text-[7px] font-bold mt-1 tabular-nums",
                                hoveredIndex === i ? "text-[var(--primary)]" : "text-[var(--text)]/10"
                            )}>
                                {dateNum}/{monthNum}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );

    if (hideHeader) return <div className="p-6 md:p-8 h-full">{ChartContent}</div>;

    return (
        <div className="bg-[var(--surface)] p-6 md:p-8 rounded-2xl shadow-sm border border-[var(--border)] overflow-hidden">
            {ChartContent}
        </div>
    );
}
