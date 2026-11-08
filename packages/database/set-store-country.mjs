/**
 * Ajusta el país de las tiendas a partir del prefijo de su WhatsApp.
 *
 * El campo `country` quedó con el valor por defecto ("MX") porque nunca se
 * configuró, y la moneda de los precios depende de él. Solo se actualizan las
 * tiendas que siguen con el valor por defecto: las que el dueño ya configuró
 * a mano se respetan.
 */
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import fs from 'node:fs';
import crypto from 'node:crypto';

const APPLY = process.argv.includes('--apply');
const KEY_SALT = 'salt';

const envPath = new URL('../../.env', import.meta.url);
if (fs.existsSync(envPath)) {
    const env = fs.readFileSync(envPath, 'utf8');
    for (const line of env.split('\n')) {
        const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
        if (m) process.env[m[1]] = m[2].trim().replace(/^["']|["']$/g, '');
    }
}

const pool = new Pool({ connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

/** Prefijo telefónico internacional -> código de país ISO. */
const PREFIX_TO_COUNTRY = {
    '57': 'CO',
    '54': 'AR',
    '52': 'MX',
    '56': 'CL',
    '51': 'PE',
    '598': 'UY',
    '595': 'PY',
    '593': 'EC',
    '591': 'BO',
    '507': 'PA',
    '506': 'CR',
    '502': 'GT',
    '504': 'HN',
    '503': 'SV',
    '505': 'NI',
    '509': 'DO',
    '1809': 'DO',
    '1808': 'PR',
    '1828': 'PR',
    '1849': 'DO',
    '1': 'US',
    '34': 'ES',
    '351': 'PT',
    '39': 'IT',
    '49': 'DE',
    '33': 'FR',
    '44': 'GB',
};

const DEFAULT_COUNTRY = 'MX';

/** Descifra un valor con la clave legacy (la de la data actual). */
function decryptWith(text, key) {
    if (!text || !text.includes(':')) return text;
    try {
        const [ivHex, tagHex, data] = text.split(':');
        const decipher = crypto.createDecipheriv('aes-256-gcm', key, Buffer.from(ivHex, 'hex'));
        decipher.setAuthTag(Buffer.from(tagHex, 'hex'));
        let out = decipher.update(data, 'hex', 'utf8');
        out += decipher.final('utf8');
        return out;
    } catch {
        return null;
    }
}

function countryFromPhone(phone) {
    if (!phone) return null;
    const digits = phone.replace(/\D/g, '');
    for (const prefix of Object.keys(PREFIX_TO_COUNTRY).sort((a, b) => b.length - a.length)) {
        if (digits.startsWith(prefix)) return PREFIX_TO_COUNTRY[prefix];
    }
    return null;
}

const stores = await prisma.store.findMany({
    select: { id: true, name: true, slug: true, country: true, whatsappNumber: true },
});

const legacyRawKey = (process.env.LEGACY_ENCRYPTION_KEY || '').trim();
const legacyKey = legacyRawKey ? crypto.scryptSync(legacyRawKey, KEY_SALT, 32) : null;

console.log(APPLY ? 'MODO: escribir en la base de datos' : 'MODO: simulación');
console.log('');

for (const store of stores) {
    const phone = legacyKey ? decryptWith(store.whatsappNumber, legacyKey) : null;
    const detected = countryFromPhone(phone);
    const current = store.country || DEFAULT_COUNTRY;

    if (current !== DEFAULT_COUNTRY) {
        console.log(`  ${store.name}: pais ya configurado (${current}), no se toca`);
        continue;
    }
    if (!detected) {
        console.log(`  ${store.name}: sin prefijo reconocible, no se toca`);
        continue;
    }

    console.log(`  ${store.name}: ${current} -> ${detected}`);
    if (APPLY) {
        await prisma.store.update({ where: { id: store.id }, data: { country: detected } });
    }
}

await prisma.$disconnect();
await pool.end();

console.log('');
console.log(APPLY ? 'Actualización aplicada.' : 'Simulación terminada (usa --apply para escribir).');
