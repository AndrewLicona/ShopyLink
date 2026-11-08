#!/usr/bin/env node
/**
 * check-secrets.mjs
 *
 * Falla si un archivo versionado contiene un secreto real.
 *
 * Como funciona:
 *  1. Lee los .env locales (no versionados) y toma los valores de las claves
 *     sensibles (SECRET, KEY, PASSWORD, TOKEN).
 *  2. Busca esos valores literales dentro de los archivos que git versiona.
 *  3. Ademas revisa los .env*.example: si traen un valor que NO es una
 *     plantilla, lo reporta.
 *
 * Uso:  npm run check:secrets
 * Salida: 0 si todo bien, 1 si hay fugas (imprime solo rutas, nunca valores).
 */
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const ROOT = process.cwd();
const SECRET_KEY = /(SECRET|PASSWORD|PRIVATE_KEY|SERVICE_ROLE|TOKEN)/i;
const PUBLIC_KEY = /^NEXT_PUBLIC_/;

/** Archivos .env locales que nunca se versionan pero guardan los secretos reales. */
const LOCAL_ENV_FILES = ['.env', 'apps/api/.env', 'apps/web/.env.local', 'apps/web/.env'];

/** Plantillas: aqui si puede haber valores, siempre que sean marcadores. */
const PLACEHOLDER = /^(change[_-]?me.*|your[-_ ].*|.*placeholder.*|<.*>|x{3,}|changeme.*|genera.*|example.*)$/i;

const problems = [];

function isIgnored(file) {
    return (
        file.startsWith('node_modules/') ||
        file.startsWith('.git/') ||
        file.startsWith('.next/') ||
        file.endsWith('.lock')
    );
}

/** Valores reales tomados de los .env locales. */
const realSecrets = new Map();
for (const rel of LOCAL_ENV_FILES) {
    const abs = path.join(ROOT, rel);
    if (!fs.existsSync(abs)) continue;
    for (const line of fs.readFileSync(abs, 'utf8').split(/\r?\n/)) {
        const m = line.match(/^\s*([A-Za-z0-9_]+)\s*=\s*(.*)$/);
        if (!m) continue;
        const [, key, rawValue] = m;
        if (PUBLIC_KEY.test(key) || !SECRET_KEY.test(key)) continue;
        const value = rawValue.trim().replace(/^["']|["']$/g, '');
        if (value.length < 12) continue;
        if (!realSecrets.has(value)) realSecrets.set(value, `${rel} (${key})`);
    }
}

const tracked = execSync('git ls-files', { encoding: 'utf8' })
    .split(/\r?\n/)
    .filter((f) => f && !isIgnored(f));

for (const rel of tracked) {
    const abs = path.join(ROOT, rel);
    let content;
    try {
        content = fs.readFileSync(abs, 'utf8');
    } catch {
        continue;
    }

    // 1) valor real de un .env local
    for (const [value, origin] of realSecrets) {
        if (content.includes(value)) {
            problems.push(`${rel}: contiene el valor real de ${origin}`);
        }
    }

    // 2) plantillas con un valor que no es marcador
    if (/\.env.*\.example$/.test(rel) || rel.endsWith('.env.example')) {
        for (const line of content.split(/\r?\n/)) {
            const m = line.match(/^\s*([A-Za-z0-9_]+)\s*=\s*(.*)$/);
            if (!m) continue;
            const [, key, rawValue] = m;
            if (PUBLIC_KEY.test(key) || !SECRET_KEY.test(key)) continue;
            const value = rawValue.trim().replace(/^["']|["']$/g, '');
            if (!value) continue;
            if (!PLACEHOLDER.test(value)) {
                problems.push(`${rel}: ${key} deberia ser una plantilla, no un valor real`);
            }
        }
    }

    // 3) secreto escrito a mano en el codigo (funciona tambien en CI, donde
    //    no existen los .env locales para comparar).
    for (const line of content.split(/\r?\n/)) {
        const m = line.match(
            /(?:^|[\s{,])([A-Za-z0-9_]*(?:SECRET|PASSWORD|PRIVATE_KEY|ACCESS_KEY)[A-Za-z0-9_]*)\s*[:=]\s*['"]([^'"]{16,})['"]/i,
        );
        if (!m) continue;
        const [, key, value] = m;
        if (PUBLIC_KEY.test(key)) continue;
        if (PLACEHOLDER.test(value)) continue;
        if (!/^[A-Za-z0-9+/=_\-.]+$/.test(value)) continue; // no parece un secreto
        if (realSecrets.has(value)) continue; // ya reportado arriba
        problems.push(`${rel}: parece un secreto escrito a mano en ${key}`);
    }
}

if (problems.length) {
    console.error('Se detectaron posibles secretos versionados:\n');
    for (const p of problems) console.error(`  - ${p}`);
    console.error('\nSustituye esos valores por marcadores y rota el secreto si ya se expuso.');
    process.exit(1);
}

console.log(`OK: ${tracked.length} archivos versionados revisados, sin secretos reales.`);
