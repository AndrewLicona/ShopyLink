import { ImageResponse } from 'next/og';
import { getThemePrimary } from '@/lib/theme';

/**
 * Imagen para compartir (Open Graph) de una tienda.
 *
 * Antes la metadata apuntaba al logo crudo de Supabase: es una imagen
 * cuadrada y WhatsApp la recortaba hasta dejarla irreconocible (por eso
 * "ya no se ve el logo al compartir"). Aquí se compone una imagen 1200x630
 * con la paleta de la tienda, el logo centrado sin deformarse y el nombre.
 */

/**
 * Runtime node (no edge): el bundle node de `@vercel/og` lee la fuente y los
 * `.wasm` desde el disco usando `import.meta.url`, y el trazado de archivos de
 * Next solo copia el `index.node.js`. El Dockerfile copia el resto a mano.
 */
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** API interna (dentro de Docker) o pública, según el entorno. */
const API_URL =
    process.env.INTERNAL_API_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    'http://127.0.0.1:3001';

const W = 1200;
const H = 630;

interface OgStore {
    name?: string;
    logoUrl?: string | null;
    theme?: string | null;
    city?: string | null;
    referenceLocation?: string | null;
}

function initials(name: string): string {
    return name
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((w) => w[0]?.toUpperCase() ?? '')
        .join('');
}

export async function GET(
    _request: Request,
    { params }: { params: Promise<{ slug: string }> },
) {
    const { slug } = await params;

    let store: OgStore | null = null;
    try {
        const res = await fetch(`${API_URL}/stores/${slug}`, {
            headers: { Accept: 'application/json' },
        });
        if (res.ok) {
            const data = await res.json();
            store = (data?.store ?? data) as OgStore;
        }
    } catch {
        store = null;
    }

    const name = store?.name || 'ShopyLink';
    const primary = getThemePrimary(store?.theme);
    const location = store?.referenceLocation || store?.city || '';

    // El logo se incrusta como data URL: ImageResponse no puede leer URLs
    // remotas sin CORS y el crawler de WhatsApp necesita una imagen propia.
    let logoData: string | null = null;
    if (store?.logoUrl) {
        try {
            const res = await fetch(store.logoUrl);
            if (res.ok) {
                const type = res.headers.get('content-type') || 'image/png';
                const buffer = await res.arrayBuffer();
                let binary = '';
                const bytes = new Uint8Array(buffer);
                const chunk = 0x8000;
                for (let i = 0; i < bytes.length; i += chunk) {
                    binary += String.fromCharCode(
                        ...bytes.subarray(i, Math.min(i + chunk, bytes.length)),
                    );
                }
                logoData = `data:${type};base64,${btoa(binary)}`;
            }
        } catch {
            logoData = null;
        }
    }

    return new ImageResponse(
        (
            <div
                style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#ffffff',
                    position: 'relative',
                }}
            >
                {/* Franja de color de la tienda */}
                <div
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: 18,
                        background: `linear-gradient(90deg, #34d399 0%, ${primary} 50%, #10b981 100%)`,
                        display: 'flex',
                    }}
                />

                {/* Marco decorativo */}
                <div
                    style={{
                        position: 'absolute',
                        inset: 48,
                        border: `3px solid ${primary}22`,
                        borderRadius: 48,
                        display: 'flex',
                    }}
                />

                {/* Logo */}
                {logoData ? (
                    <img
                        src={logoData}
                        alt={name}
                        width={260}
                        height={260}
                        style={{
                            width: 260,
                            height: 260,
                            objectFit: 'contain',
                            borderRadius: 48,
                            border: `4px solid ${primary}33`,
                            background: '#ffffff',
                            padding: 22,
                            display: 'flex',
                        }}
                    />
                ) : (
                    <div
                        style={{
                            width: 260,
                            height: 260,
                            borderRadius: 48,
                            backgroundColor: primary,
                            color: '#ffffff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 110,
                            fontWeight: 900,
                        }}
                    >
                        {initials(name)}
                    </div>
                )}

                {/* Nombre de la tienda */}
                <div
                    style={{
                        marginTop: 40,
                        fontSize: 66,
                        fontWeight: 900,
                        color: '#0f172a',
                        textTransform: 'uppercase',
                        letterSpacing: -1,
                        maxWidth: 1000,
                        textAlign: 'center',
                        display: 'flex',
                    }}
                >
                    {name}
                </div>

                {/* Ubicación */}
                {location ? (
                    <div
                        style={{
                            marginTop: 18,
                            fontSize: 30,
                            fontWeight: 700,
                            color: '#64748b',
                            display: 'flex',
                        }}
                    >
                        {location}
                    </div>
                ) : null}

                {/* Llamado a la acción */}
                <div
                    style={{
                        marginTop: 38,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 14,
                        backgroundColor: `${primary}15`,
                        border: `2px solid ${primary}33`,
                        borderRadius: 999,
                        padding: '16px 40px',
                        fontSize: 28,
                        fontWeight: 800,
                        color: primary,
                    }}
                >
                    <div
                        style={{
                            width: 16,
                            height: 16,
                            borderRadius: 999,
                            backgroundColor: '#10b981',
                            display: 'flex',
                        }}
                    />
                    Catálogo digital · Pedidos por WhatsApp
                </div>
            </div>
        ),
        {
            width: W,
            height: H,
        },
    );
}
