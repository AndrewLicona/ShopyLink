'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { CheckCircle2, XCircle, Clock, AlertCircle } from 'lucide-react';

type StatusType = 'active' | 'paused' | 'pending' | 'completed' | 'cancelled' | 'error';

interface StatusBadgeProps {
    status: StatusType;
    className?: string;
    label?: string;
}

export function StatusBadge({ status, className, label }: StatusBadgeProps) {
    const configs: Record<StatusType, { icon: React.ElementType; style: string; text: string }> = {
        active: {
            icon: CheckCircle2,
            style: 'bg-green-500/10 text-green-600',
            text: 'Activo'
        },
        paused: {
            icon: AlertCircle,
            style: 'bg-orange-500/10 text-orange-600',
            text: 'Pausado'
        },
        pending: {
            icon: Clock,
            style: 'bg-orange-500/10 text-orange-600',
            text: 'Pendiente'
        },
        completed: {
            icon: CheckCircle2,
            style: 'bg-green-500/10 text-green-600',
            text: 'Completado'
        },
        cancelled: {
            icon: XCircle,
            style: 'bg-red-500/10 text-red-600',
            text: 'Cancelado'
        },
        error: {
            icon: XCircle,
            style: 'bg-red-500/10 text-red-600',
            text: 'Error'
        },
    };

    const config = configs[status];
    const Icon = config.icon;

    return (
        <span className={cn(
            "px-3 py-1.5 rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-wider inline-flex items-center gap-1.5",
            config.style,
            className
        )}>
            <Icon className="w-3.5 h-3.5" />
            {label || config.text}
        </span>
    );
}
