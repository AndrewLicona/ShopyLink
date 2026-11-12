/**
 * Script de Migración y Optimización de Imágenes Existentes (Módulo 2.3)
 *
 * Lee de la base de datos las URLs de imágenes en Store (logoUrl, bannerUrl),
 * StoreBanner (imageUrl), Product (images) y ProductVariant (image, images).
 *
 * Si la URL no apunta a un formato ya comprimido (webp/avif/jxl) o proviene de
 * subida cruda:
 * 1. Descarga la imagen a un Buffer en memoria (sin tocar disco).
 * 2. La optimiza con Sharp a WebP (con calidad y dimensiones según su tipo).
 * 3. Sube la versión WebP optimizada al bucket 'shopy-images' de Supabase Storage.
 * 4. Actualiza la URL en la base de datos de manera segura.
 * 5. Al final borra los archivos viejos que quedaron sin referencia en la base.
 *
 * Uso:
 *   npm run images:optimize --workspace=@repo/database -- --dry-run
 *   npm run images:optimize --workspace=@repo/database
 *
 * Es un `.mjs` a propósito: se ejecuta con `node` sin paso de compilación, igual
 * que `rotate-encryption-key.mjs`. (El `ts-node` del workspace es la v1, que no
 * funciona con TypeScript 5.)
 *
 * La conexión usa el adaptador `PrismaPg` + `pg.Pool`, que es lo que exige
 * Prisma 7: `new PrismaClient()` sin adaptador lanza PrismaClientInitializationError.
 */
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { createClient } from '@supabase/supabase-js';
import sharp from 'sharp';
import fs from 'node:fs';

/* ---------- entorno ---------- */
const envPaths = [
    new URL('../../../.env', import.meta.url), // raíz del monorepo
    new URL('../../apps/api/.env', import.meta.url), // secrets de la API
];
for (const envPath of envPaths) {
    if (!fs.existsSync(envPath)) continue;
    const env = fs.readFileSync(envPath, 'utf8');
    for (const line of env.split('\n')) {
        const m = line.match(/^\s*([A-Za-z0-9_]+)\s*=\s*(.*)$/);
        if (!m) continue;
        const [, key, rawValue] = m;
        const value = rawValue.trim().replace(/^["']|["']$/g, '');
        // Lo que ya está en el entorno gana: no se pisa con el .env.
        if (process.env[key] === undefined) process.env[key] = value;
    }
}

const DRY_RUN = process.argv.includes('--dry-run');
const bucketName = 'shopy-images';

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
/**
 * El bucket solo admite escrituras con rol `authenticated` (ver la politica
 * "Subida Autenticada"). La clave anon -que es la que hay en los .env del
 * repo- no puede subir ni borrar: el navegador sube porque el usuario esta
 * logueado en Supabase Auth. Este script corre por fuera del navegador, asi
 * que necesita la clave de service_role.
 */
const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    (process.env.SUPABASE_KEY && !DRY_RUN ? process.env.SUPABASE_KEY : null) ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
    console.error('[Migration] Error: Falta SUPABASE_URL / NEXT_PUBLIC_SUPABASE_URL en el entorno.');
    process.exit(1);
}
if (!supabaseKey) {
    console.error('[Migration] Error: Falta SUPABASE_SERVICE_ROLE_KEY en el entorno.');
    process.exit(1);
}

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;
if (!connectionString) {
    console.error('[Migration] Error: Falta DATABASE_URL / DIRECT_URL en el entorno.');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const pool = new Pool({ connectionString });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

/* ---------- contabilidad ---------- */
const resumen = { antes: 0, despues: 0, archivos: 0, omitidas: 0, fallidas: 0 };
/** URLs que siguen vivos en la base: sirve para no borrar un archivo compartido. */
const urlsEnUso = new Set();
/** URLs viejas que quedaron reemplazadas por una version optimizada. */
const urlsReemplazadas = new Set();
/**
 * Cache por URL de origen: la misma foto compartida por varios productos se
 * descarga, sube y cuenta una sola vez, y todos los que la usaban terminan
 * apuntando al mismo WebP (si no, cada fila subiría su propia copia).
 */
const cachePorUrl = new Map();

function formatBytes(bytes) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function registrar(original, optimizado) {
    resumen.antes += original;
    resumen.despues += optimizado;
    resumen.archivos += 1;
}

/** Sufijo aleatorio: evita que dos imágenes del mismo lote se pisen de nombre. */
function sufijo() {
    return Math.random().toString(36).slice(2, 8);
}

/**
 * Ya está comprimida en un formato con pérdida: WebP, AVIF o JPEG XL. Reescribir
 * esas imágenes solo gasta ancho de banda y no ahorra casi nada.
 */
function yaEstaOptimizada(url) {
    const sinQuery = url.split('?')[0].toLowerCase();
    return /\.(webp|avif|jxl)$/.test(sinQuery);
}

/**
 * Reemplaza una imagen: la baja, la optimiza, la sube y devuelve la URL nueva.
 * En modo simulacion devuelve un marcador de posicion sin tocar nada.
 */
async function reemplazarImagen(url, folder, filenameBase, resize, quality) {
    const enCache = cachePorUrl.get(url);
    if (enCache) return enCache;

    const buffer = await downloadToBuffer(url);
    if (!buffer) return null;

    const optimized = await sharp(buffer)
        .resize(resize.width, resize.height, { fit: 'inside', withoutEnlargement: true })
        .webp({ quality })
        .toBuffer();

    const newUrl = await uploadWebp(optimized, folder, `${filenameBase}-${sufijo()}.webp`);
    if (!newUrl) {
        // Solo se cuenta lo que de verdad subio: si la clave no tiene permiso,
        // el resumen no puede decir "126 imágenes optimizadas" si no se subió ninguna.
        resumen.fallidas += 1;
        return null;
    }

    registrar(buffer.length, optimized.length);

    const resultado = { newUrl, antes: buffer.length, despues: optimized.length };
    cachePorUrl.set(url, resultado);
    urlsReemplazadas.add(url);
    return resultado;
}

async function downloadToBuffer(url) {
    try {
        const res = await fetch(url);
        if (!res.ok) {
            console.warn(`[Migration] No se pudo descargar la imagen desde ${url}: HTTP ${res.status}`);
            return null;
        }
        const arrayBuffer = await res.arrayBuffer();
        return Buffer.from(arrayBuffer);
    } catch (err) {
        console.error(`[Migration] Error al descargar imagen ${url}:`, err.message);
        return null;
    }
}

async function uploadWebp(buffer, folder, filename) {
    if (DRY_RUN) {
        return `https://dry-run.placeholder/${folder}/${filename}`;
    }

    const filePath = `${folder}/${filename}`;
    const { error } = await supabase.storage
        .from(bucketName)
        .upload(filePath, buffer, {
            contentType: 'image/webp',
            cacheControl: '31536000',
            upsert: true,
        });

    if (error) {
        console.error(`[Migration] Error al subir ${filePath} a Supabase:`, error.message);
        return null;
    }

    const { data } = supabase.storage.from(bucketName).getPublicUrl(filePath);
    return data.publicUrl;
}

/** Traduce una URL publica de Supabase al path interno del bucket. */
function pathEnBucket(publicUrl) {
    const marker = `/storage/v1/object/public/${bucketName}/`;
    const idx = publicUrl.indexOf(marker);
    if (idx === -1) return null;
    return publicUrl.substring(idx + marker.length) || null;
}

/* ---------- 1. inventario ---------- */
/**
 * Comprueba ANTES de tocar nada que la clave pueda escribir en el bucket.
 * Sin esto, una clave sin permisos (anon) recorreria las 126 imágenes
 * descargándolas y optimizandolas para que al final no se pudiera subir
 * ninguna: un rato largo para un resultado vacío.
 */
async function verificarPermisosDeEscritura() {
    if (DRY_RUN) return;

    const probe = `_migracion/prueba-${Date.now()}.txt`;
    const { error } = await supabase.storage.from(bucketName).upload(probe, Buffer.from('ok'), {
        contentType: 'text/plain',
        upsert: false,
    });
    if (error) {
        console.error('\n✖ La clave de Supabase no puede escribir en el bucket:', error.message);
        console.error('  El bucket exige rol "authenticated" o "service_role".');
        console.error(
            '  Definí SUPABASE_SERVICE_ROLE_KEY en tu .env local (nunca en el repo) y volvé a correrlo.',
        );
        process.exit(1);
    }
    await supabase.storage.from(bucketName).remove([probe]);
    console.log('[Migration] Permisos de escritura verificados en el bucket.');
}

/**
 * Levanta el conjunto de URLs que la base usa AHORA. Se vuelve a llamar al
 * final (despues de actualizar las filas) para saber que archivos quedaron
 * realmente sin referencia: si se leyera solo el estado inicial, ninguna URL
 * vieja se veria sin uso y no se borraria nada.
 */
async function collectingUrls() {
    urlsEnUso.clear();

    const stores = await prisma.store.findMany({
        select: { logoUrl: true, bannerUrl: true },
    });
    for (const store of stores) {
        if (store.logoUrl) urlsEnUso.add(store.logoUrl);
        if (store.bannerUrl) urlsEnUso.add(store.bannerUrl);
    }

    const banners = await prisma.storeBanner.findMany({ select: { imageUrl: true } });
    for (const banner of banners) {
        if (banner.imageUrl) urlsEnUso.add(banner.imageUrl);
    }

    const products = await prisma.product.findMany({ select: { images: true } });
    for (const product of products) {
        for (const url of product.images ?? []) {
            if (url) urlsEnUso.add(url);
        }
    }

    // Las variantes tienen fotos propias: si se ignoran, un archivo compartido
    // con un producto podria borrarse y dejaria la variante sin foto.
    const variants = await prisma.productVariant.findMany({
        select: { image: true, images: true },
    });
    for (const variant of variants) {
        if (variant.image) urlsEnUso.add(variant.image);
        for (const url of variant.images ?? []) {
            if (url) urlsEnUso.add(url);
        }
    }
}

/* ---------- 2. optimizacion ---------- */
async function optimizeStores() {
    console.log('\n--- 1. Logos y banners de tiendas ---');
    const stores = await prisma.store.findMany({
        where: { OR: [{ logoUrl: { not: null } }, { bannerUrl: { not: null } }] },
        select: { id: true, name: true, logoUrl: true, bannerUrl: true },
    });

    for (const store of stores) {
        if (store.logoUrl && !yaEstaOptimizada(store.logoUrl)) {
            console.log(`[Store] Optimizando logo de ${store.name}...`);
            const result = await reemplazarImagen(
                store.logoUrl,
                'logos',
                `logo-${store.id}`,
                { width: 400, height: 400 },
                85,
            );
            if (result && !DRY_RUN) {
                await prisma.store.update({
                    where: { id: store.id },
                    data: { logoUrl: result.newUrl },
                });
                console.log(
                    `[Store] ${store.name} | logo: ${formatBytes(result.antes)} -> ${formatBytes(result.despues)}`,
                );
            } else if (result) {
                console.log(
                    `[Store] (dry-run) ${store.name} | logo: ${formatBytes(result.antes)} -> ${formatBytes(result.despues)}`,
                );
            }
        } else if (store.logoUrl) {
            resumen.omitidas += 1;
        }

        if (store.bannerUrl && !yaEstaOptimizada(store.bannerUrl)) {
            console.log(`[Store] Optimizando banner de ${store.name}...`);
            const result = await reemplazarImagen(
                store.bannerUrl,
                'banners',
                `banner-store-${store.id}`,
                { width: 1400, height: null },
                85,
            );
            if (result && !DRY_RUN) {
                await prisma.store.update({
                    where: { id: store.id },
                    data: { bannerUrl: result.newUrl },
                });
                console.log(
                    `[Store] ${store.name} | banner: ${formatBytes(result.antes)} -> ${formatBytes(result.despues)}`,
                );
            } else if (result) {
                console.log(
                    `[Store] (dry-run) ${store.name} | banner: ${formatBytes(result.antes)} -> ${formatBytes(result.despues)}`,
                );
            }
        } else if (store.bannerUrl) {
            resumen.omitidas += 1;
        }
    }
}

async function optimizeBanners() {
    console.log('\n--- 2. Banners ---');
    const banners = await prisma.storeBanner.findMany({
        where: { imageUrl: { not: null } },
        select: { id: true, title: true, imageUrl: true },
    });

    for (const banner of banners) {
        if (!banner.imageUrl) continue;
        if (yaEstaOptimizada(banner.imageUrl)) {
            resumen.omitidas += 1;
            continue;
        }

        console.log(`[Banner] Optimizando banner de ${banner.title || banner.id}...`);
        const result = await reemplazarImagen(
            banner.imageUrl,
            'banners',
            `banner-${banner.id}`,
            { width: 1400, height: null },
            85,
        );
        if (result && !DRY_RUN) {
            await prisma.storeBanner.update({
                where: { id: banner.id },
                data: { imageUrl: result.newUrl },
            });
            console.log(
                `[Banner] ${banner.id} | ${formatBytes(result.antes)} -> ${formatBytes(result.despues)}`,
            );
        } else if (result) {
            console.log(
                `[Banner] (dry-run) ${banner.id} | ${formatBytes(result.antes)} -> ${formatBytes(result.despues)}`,
            );
        }
    }
}

async function optimizeProducts() {
    console.log('\n--- 3. Fotos de productos ---');
    const products = await prisma.product.findMany({
        where: { images: { isEmpty: false } },
        select: { id: true, name: true, images: true },
    });

    for (const product of products) {
        const updatedImages = [];
        let changed = false;
        let antesTotal = 0;
        let despuesTotal = 0;

        for (let i = 0; i < product.images.length; i++) {
            const imgUrl = product.images[i];
            if (!imgUrl) continue;

            if (yaEstaOptimizada(imgUrl)) {
                updatedImages.push(imgUrl);
                resumen.omitidas += 1;
                continue;
            }

            const result = await reemplazarImagen(
                imgUrl,
                'products',
                `prod-${product.id}-${i}`,
                { width: 800, height: 800 },
                80,
            );
            if (!result) {
                updatedImages.push(imgUrl);
                continue;
            }

            antesTotal += result.antes;
            despuesTotal += result.despues;
            updatedImages.push(result.newUrl);
            changed = true;
        }

        if (!changed) continue;

        if (!DRY_RUN) {
            await prisma.product.update({
                where: { id: product.id },
                data: { images: updatedImages },
            });
        }
        console.log(
            `[Product] ${product.name} | ${formatBytes(antesTotal)} -> ${formatBytes(despuesTotal)}` +
                (DRY_RUN ? ' (dry-run)' : ''),
        );
    }
}

async function optimizeVariants() {
    console.log('\n--- 4. Fotos de variantes ---');
    const variants = await prisma.productVariant.findMany({
        where: { OR: [{ image: { not: null } }, { images: { isEmpty: false } }] },
        select: { id: true, image: true, images: true },
    });

    for (const variant of variants) {
        const data = {};
        let changed = false;
        let antesTotal = 0;
        let despuesTotal = 0;

        if (variant.image && !yaEstaOptimizada(variant.image)) {
            const result = await reemplazarImagen(
                variant.image,
                'products',
                `var-${variant.id}`,
                { width: 800, height: 800 },
                80,
            );
            if (result) {
                data.image = result.newUrl;
                changed = true;
                antesTotal += result.antes;
                despuesTotal += result.despues;
            }
        } else if (variant.image) {
            resumen.omitidas += 1;
        }

        if ((variant.images ?? []).length) {
            const updatedImages = [];
            let variantChanged = false;
            for (let i = 0; i < variant.images.length; i++) {
                const imgUrl = variant.images[i];
                if (!imgUrl || yaEstaOptimizada(imgUrl)) {
                    if (imgUrl) {
                        updatedImages.push(imgUrl);
                        resumen.omitidas += 1;
                    }
                    continue;
                }
                const result = await reemplazarImagen(
                    imgUrl,
                    'products',
                    `var-${variant.id}-${i}`,
                    { width: 800, height: 800 },
                    80,
                );
                if (!result) {
                    updatedImages.push(imgUrl);
                    continue;
                }
                antesTotal += result.antes;
                despuesTotal += result.despues;
                updatedImages.push(result.newUrl);
                variantChanged = true;
            }
            if (variantChanged) {
                data.images = updatedImages;
                changed = true;
            }
        }

        if (!changed) continue;

        if (!DRY_RUN) {
            await prisma.productVariant.update({ where: { id: variant.id }, data });
        }
        console.log(
            `[Variant] ${variant.id} | ${formatBytes(antesTotal)} -> ${formatBytes(despuesTotal)}` +
                (DRY_RUN ? ' (dry-run)' : ''),
        );
    }
}

/* ---------- 5. limpieza de archivos viejos ---------- */
async function limpiarArchivosViejos() {
    // Se relee la base DESPUES de actualizar las filas: el conjunto de URLs
    // en uso es el definitivo. Con el inventario inicial (que contenia las
    // URLs viejas) el guard no dejaria borrar ni un archivo.
    await collectingUrls();

    if (DRY_RUN) {
        console.log('\n--- 5. Archivos viejos (simulacion) ---');
        console.log(
            `Se borrarian ${urlsReemplazadas.size} archivos que quedaron sin referencia.`,
        );
        return;
    }

    console.log('\n--- 5. Borrando archivos viejos sin referencia ---');
    let borrados = 0;
    for (const url of urlsReemplazadas) {
        // Si otra fila sigue usando esa URL, el archivo NO se toca.
        if (urlsEnUso.has(url)) continue;
        const filePath = pathEnBucket(url);
        if (!filePath) continue;

        const { error } = await supabase.storage.from(bucketName).remove([filePath]);
        if (error) {
            console.warn(`[Migration] No se pudo borrar ${filePath}: ${error.message}`);
            continue;
        }
        borrados += 1;
    }
    console.log(`[Migration] ${borrados} archivos viejos eliminados del bucket.`);
}

async function main() {
    console.log(
        `Iniciando migración de imágenes ${DRY_RUN ? '(MODO SIMULACIÓN - DRY RUN)' : '(MODO ACTIVO)'}...`,
    );
    try {
        await verificarPermisosDeEscritura();
        await collectingUrls();
        await optimizeStores();
        await optimizeBanners();
        await optimizeProducts();
        await optimizeVariants();
        await limpiarArchivosViejos();

        const ahorro = resumen.antes - resumen.despues;
        const porcentaje = resumen.antes
            ? ((ahorro / resumen.antes) * 100).toFixed(1)
            : '0';
        console.log('\n================ RESUMEN ================');
        console.log(`Imágenes optimizadas : ${resumen.archivos}`);
        console.log(`Imágenes omitidas   : ${resumen.omitidas} (ya comprimidas)`);
        console.log(`Imágenes fallidas   : ${resumen.fallidas}`);
        console.log(`Peso antes           : ${formatBytes(resumen.antes)}`);
        console.log(`Peso después         : ${formatBytes(resumen.despues)}`);
        console.log(`Ahorro               : ${formatBytes(ahorro)} (${porcentaje}%)`);
        console.log('==========================================');

        if (resumen.fallidas > 0) {
            console.error(
                `\n✖ ${resumen.fallidas} imágenes no se pudieron subir: la base de datos se dejó como estaba.`,
            );
            process.exitCode = 1;
            return;
        }
        console.log('\n✔ Migración de imágenes finalizada exitosamente.');
    } catch (err) {
        console.error('\n✖ Error durante la migración:', err);
        process.exitCode = 1;
    } finally {
        await prisma.$disconnect();
        await pool.end();
    }
}

void main();
