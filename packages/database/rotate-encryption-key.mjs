/**
 * Rota la clave de cifrado de la base de datos.
 *
 * Contexto: la data existente (WhatsApp de las tiendas, teléfonos de los
 * pedidos) quedó cifrada con la clave legacy. Este script la descifra con la
 * clave legacy y la vuelve a cifrar con una clave nueva y fuerte, sin perder
 * ningún dato.
 *
 * Uso:
 *   node packages/database/rotate-encryption-key.mjs            # simulación
 *   node packages/database/rotate-encryption-key.mjs --apply    # escribe
 *
 * La clave nueva se toma de NEW_ENCRYPTION_KEY; si no está, se genera una y
 * se imprime (cópiala en el .env del servidor como DATABASE_ENCRYPTION_KEY).
 *
 * Orden recomendado (importante):
 *   1. Rotar los datos con este script.
 *   2. Poner la clave nueva en el .env del servidor (DATABASE_ENCRYPTION_KEY).
 *   3. Redesplegar (`bash deploy.sh`).
 */
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import fs from 'node:fs';
import crypto from 'node:crypto';

const APPLY = process.argv.includes('--apply');
const KEY_SALT = 'salt';

/* ---------- entorno ---------- */
const envPath = new URL('../../.env', import.meta.url);
if (fs.existsSync(envPath)) {
    const env = fs.readFileSync(envPath, 'utf8');
    for (const line of env.split('\n')) {
        const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
        if (m) process.env[m[1]] = m[2].trim().replace(/^["']|["']$/g, '');
    }
}

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;
if (!connectionString) {
    console.error('No se encontró DATABASE_URL ni DIRECT_URL en el entorno.');
    process.exit(1);
}

// La clave legacy NO vive en el repositorio: se lee del .env local.
const legacyRawKey = (process.env.LEGACY_ENCRYPTION_KEY || '').trim();
if (!legacyRawKey) {
    console.error(
        'Falta LEGACY_ENCRYPTION_KEY en el .env local.\n' +
        'Es la clave con la que está cifrada la data actual; el script la necesita\n' +
        'para descifrar y volver a cifrar. No se guarda en el repositorio.',
    );
    process.exit(1);
}

/* ---------- cripto (mismo algoritmo que apps/api/src/core/common/encryption.util.ts) ---------- */
const deriveKey = (raw) => crypto.scryptSync(raw, KEY_SALT, 32);

function decryptWith(text, key) {
    if (!text || !text.includes(':')) return { ok: false, reason: 'no-colon' };
    try {
        const [ivHex, tagHex, data] = text.split(':');
        const decipher = crypto.createDecipheriv('aes-256-gcm', key, Buffer.from(ivHex, 'hex'));
        decipher.setAuthTag(Buffer.from(tagHex, 'hex'));
        let out = decipher.update(data, 'hex', 'utf8');
        out += decipher.final('utf8');
        return { ok: true, value: out };
    } catch (e) {
        return { ok: false, reason: e.message };
    }
}

function encryptWith(text, key) {
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const tag = cipher.getAuthTag().toString('hex');
    return `${iv.toString('hex')}:${tag}:${encrypted}`;
}

/* ---------- conexión ---------- */
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const legacyKey = deriveKey(legacyRawKey);
const newRawKey = (process.env.NEW_ENCRYPTION_KEY || '').trim() || crypto.randomBytes(32).toString('base64');
const newKey = deriveKey(newRawKey);

console.log(APPLY ? 'MODO: escribir en la base de datos' : 'MODO: simulación (no escribe nada)');
console.log('');

/* ---------- tiendas ---------- */
const stores = await prisma.store.findMany({
    select: { id: true, name: true, slug: true, whatsappNumber: true },
});

let rotated = 0;
let skipped = 0;
const failures = [];

console.log('Tiendas:');
for (const store of stores) {
    if (!store.whatsappNumber) {
        console.log(`  - ${store.name}: sin WhatsApp, nada que rotar`);
        skipped++;
        continue;
    }

    const decrypted = decryptWith(store.whatsappNumber, legacyKey);
    if (!decrypted.ok) {
        console.log(`  - ${store.name}: NO se pudo descifrar con la clave legacy (${decrypted.reason}). Se deja como está.`);
        failures.push(store.name);
        continue;
    }

    console.log(`  - ${store.name}: WhatsApp descifrado correctamente, se rotará`);
    rotated++;

    if (APPLY) {
        await prisma.store.update({
            where: { id: store.id },
            data: { whatsappNumber: encryptWith(decrypted.value, newKey) },
        });
    }
}

/* ---------- pedidos ---------- */
const orders = await prisma.order.findMany({
    select: { id: true, customerName: true, customerPhone: true },
});

const legacyHashed = [];
const encryptedPhones = [];
for (const order of orders) {
    if (!order.customerPhone) continue;
    // Los teléfonos antiguos eran hashes sha256 (sin ':') y no se pueden recuperar.
    if (!order.customerPhone.includes(':')) legacyHashed.push(order);
    else encryptedPhones.push(order);
}

console.log('');
console.log('Pedidos:');
console.log(`  - ${orders.length} pedidos revisados`);
console.log(`  - ${legacyHashed.length} con teléfono hasheado (sha256, no recuperable, se dejan igual)`);

if (encryptedPhones.length) {
    let rotatedOrders = 0;
    for (const order of encryptedPhones) {
        const decrypted = decryptWith(order.customerPhone, legacyKey);
        if (!decrypted.ok) {
            failures.push(`pedido ${order.id}`);
            continue;
        }
        rotatedOrders++;
        if (APPLY) {
            await prisma.order.update({
                where: { id: order.id },
                data: { customerPhone: encryptWith(decrypted.value, newKey) },
            });
        }
    }
    console.log(`  - ${rotatedOrders} pedidos con teléfono cifrado, rotados`);
}

await prisma.$disconnect();
await pool.end();

console.log('');
if (!APPLY) {
    console.log('Simulación terminada. Ejecuta con --apply para escribir los cambios.');
} else {
    console.log('Rotación aplicada.');
}

console.log('');
console.log('======================================================');
console.log('CLAVE NUEVA (ponla en el .env del servidor):');
console.log(`DATABASE_ENCRYPTION_KEY="${newRawKey}"`);
console.log('======================================================');
console.log('Siguientes pasos:');
console.log('  1. Copia esa clave al .env del servidor como DATABASE_ENCRYPTION_KEY');
console.log('  2. Redespliega (bash deploy.sh)');
console.log('  3. Opcional: activa ENCRYPTION_STRICT="true" para que la API no arranque sin la clave');
console.log('  4. Cuando la API esté usando la clave nueva, borra LEGACY_ENCRYPTION_KEY del .env local');

if (failures.length) {
    console.log('');
    console.log(`ATENCIÓN: ${failures.length} registro(s) no se pudieron rotar: ${failures.join(', ')}`);
}
