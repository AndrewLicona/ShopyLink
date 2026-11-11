/**
 * Script de Migración y Optimización de Imágenes Existentes (Módulo 2.3)
 *
 * Lee de la base de datos las URLs de imágenes en Store (logoUrl, bannerUrl),
 * Product (images), y StoreBanner (imageUrl).
 *
 * Si la URL no apunta a un formato WebP optimizado o proviene de subida cruda:
 * 1. Descarga la imagen a un Buffer en memoria (sin tocar disco).
 * 2. La optimiza con Sharp a WebP (con calidad y dimensiones según su tipo).
 * 3. Sube la versión WebP optimizada al bucket 'shopy-images' de Supabase Storage.
 * 4. Actualiza la URL en la base de datos de manera segura.
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
  new URL('../../../.env', import.meta.url),        // raíz del monorepo
  new URL('../../apps/api/.env', import.meta.url),   // secrets de la API
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
const supabaseKey =
  process.env.SUPABASE_KEY ||
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  console.error('[Migration] Error: Falta SUPABASE_URL / NEXT_PUBLIC_SUPABASE_URL en el entorno.');
  process.exit(1);
}
if (!supabaseKey) {
  console.error('[Migration] Error: Falta SUPABASE_KEY / SUPABASE_SERVICE_ROLE_KEY en el entorno.');
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

async function optimizeStores() {
  console.log('\n--- 1. Revisando Logos de Tiendas ---');
  const stores = await prisma.store.findMany({
    where: { logoUrl: { not: null } },
    select: { id: true, name: true, logoUrl: true },
  });

  for (const store of stores) {
    if (!store.logoUrl) continue;
    if (store.logoUrl.endsWith('.webp')) {
      console.log(`[Store] ${store.name} ya tiene logo WebP.`);
      continue;
    }

    console.log(`[Store] Optimizando logo de ${store.name} (${store.logoUrl})...`);
    const buffer = await downloadToBuffer(store.logoUrl);
    if (!buffer) continue;

    const optimized = await sharp(buffer)
      .resize(400, 400, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 85 })
      .toBuffer();

    const filename = `logo-${store.id}-${Date.now()}.webp`;
    const newUrl = await uploadWebp(optimized, 'logos', filename);

    if (newUrl && !DRY_RUN) {
      await prisma.store.update({
        where: { id: store.id },
        data: { logoUrl: newUrl },
      });
      console.log(`[Store] Logo actualizado para ${store.name} -> ${newUrl}`);
    } else if (DRY_RUN) {
      console.log(`[Store] (dry-run) ${store.name} -> ${newUrl}`);
    }
  }
}

async function optimizeBanners() {
  console.log('\n--- 2. Revisando Banners ---');
  const banners = await prisma.storeBanner.findMany({
    where: { imageUrl: { not: null } },
    select: { id: true, title: true, imageUrl: true },
  });

  for (const banner of banners) {
    if (!banner.imageUrl) continue;
    if (banner.imageUrl.endsWith('.webp')) {
      console.log(`[Banner] Banner ${banner.id} ya es WebP.`);
      continue;
    }

    console.log(`[Banner] Optimizando banner de ${banner.title || banner.id}...`);
    const buffer = await downloadToBuffer(banner.imageUrl);
    if (!buffer) continue;

    const optimized = await sharp(buffer)
      .resize(1400, null, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 85 })
      .toBuffer();

    const filename = `banner-${banner.id}-${Date.now()}.webp`;
    const newUrl = await uploadWebp(optimized, 'banners', filename);

    if (newUrl && !DRY_RUN) {
      await prisma.storeBanner.update({
        where: { id: banner.id },
        data: { imageUrl: newUrl },
      });
      console.log(`[Banner] Banner actualizado -> ${newUrl}`);
    } else if (DRY_RUN) {
      console.log(`[Banner] (dry-run) ${banner.id} -> ${newUrl}`);
    }
  }
}

async function optimizeProducts() {
  console.log('\n--- 3. Revisando Productos ---');
  const products = await prisma.product.findMany({
    where: { images: { isEmpty: false } },
    select: { id: true, name: true, images: true },
  });

  for (const product of products) {
    const updatedImages = [];
    let changed = false;

    for (let i = 0; i < product.images.length; i++) {
      const imgUrl = product.images[i];
      if (!imgUrl) continue;

      if (imgUrl.endsWith('.webp')) {
        updatedImages.push(imgUrl);
        continue;
      }

      console.log(`[Product] Optimizando imagen de ${product.name}...`);
      const buffer = await downloadToBuffer(imgUrl);
      if (!buffer) {
        updatedImages.push(imgUrl);
        continue;
      }

      const optimized = await sharp(buffer)
        .resize(800, 800, { fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 80 })
        .toBuffer();

      const filename = `prod-${product.id}-${i}-${Date.now()}.webp`;
      const newUrl = await uploadWebp(optimized, 'products', filename);

      if (newUrl) {
        updatedImages.push(newUrl);
        changed = true;
      } else {
        updatedImages.push(imgUrl);
      }
    }

    if (changed && !DRY_RUN) {
      await prisma.product.update({
        where: { id: product.id },
        data: { images: updatedImages },
      });
      console.log(`[Product] Producto ${product.name} actualizado con imágenes WebP.`);
    } else if (changed && DRY_RUN) {
      console.log(`[Product] (dry-run) ${product.name}: ${product.images.length} imágenes`);
    }
  }
}

async function main() {
  console.log(
    `Iniciando migración de imágenes ${DRY_RUN ? '(MODO SIMULACIÓN - DRY RUN)' : '(MODO ACTIVO)'}...`,
  );
  try {
    await optimizeStores();
    await optimizeBanners();
    await optimizeProducts();
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
