'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

/**
 * Renders an overlay (drawer, modal) directly into <body>.
 *
 * This is required because any ancestor with `transform`, `filter`,
 * `backdrop-filter`, `perspective` or `contain` becomes the containing block for
 * `position: fixed` descendants. The marketplace header uses `backdrop-blur-md`,
 * which collapsed the cart drawer into the 80px header box. Portalling to
 * <body> makes the overlay independent from its React parent's layout.
 */
export function Overlay({ children }: { children: React.ReactNode }) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    return createPortal(children, document.body);
}
