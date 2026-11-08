import {
  createCipheriv,
  createDecipheriv,
  randomBytes,
  scryptSync,
} from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12; // Standard for GCM
const KEY_SALT = 'salt';

/**
 * Clave con la que quedó cifrada la base de datos antes de que existiera
 * `DATABASE_ENCRYPTION_KEY` en el entorno.
 *
 * Se usa SOLO como último recurso: sin ella la API no puede leer el WhatsApp
 * de las tiendas ni los teléfonos de los pedidos ya cifrados, y quedaría
 * inoperable. En cuanto se defina la clave real hay que rotar los datos con
 * `packages/database/rotate-encryption-key.mjs` y quitar esta constante.
 */
const LEGACY_FALLBACK_KEY = 'shopy-link-placeholder-key-32-chars!!';

/**
 * Raised when the encryption key is missing from the environment.
 *
 * Only thrown in strict mode (`ENCRYPTION_STRICT=true`): the process refuses
 * to encrypt or decrypt data with an implicit/default key.
 */
export class MissingEncryptionKeyError extends Error {
  constructor() {
    super(
      'DATABASE_ENCRYPTION_KEY is not set. Refusing to encrypt or decrypt data. ' +
        'Define it in the environment before starting the API.',
    );
    this.name = 'MissingEncryptionKeyError';
  }
}

/**
 * Derives the 32-byte AES-256 key from the environment secret.
 *
 * `DATABASE_ENCRYPTION_KEY` is always the source of truth. When it is not
 * defined the API keeps running with the legacy key so the already encrypted
 * data stays readable, and the misconfiguration is reported loudly on boot.
 */
function getEncryptionKey(): Buffer {
  const rawKey = process.env.DATABASE_ENCRYPTION_KEY;

  if (rawKey && rawKey.trim().length > 0) {
    return scryptSync(rawKey.trim(), KEY_SALT, 32);
  }

  if (process.env.ENCRYPTION_STRICT === 'true') {
    throw new MissingEncryptionKeyError();
  }

  return scryptSync(LEGACY_FALLBACK_KEY, KEY_SALT, 32);
}

/**
 * Reports the encryption configuration on bootstrap.
 *
 * It never blocks the API: a missing key must not take the whole storefront
 * down. When the key is missing it logs exactly what to do to finish the
 * migration to a real key.
 */
export function assertEncryptionKeyConfigured(): void {
  const rawKey = process.env.DATABASE_ENCRYPTION_KEY;

  if (rawKey && rawKey.trim().length > 0) {
    console.log('[encryption] DATABASE_ENCRYPTION_KEY configurada.');
    return;
  }

  console.warn(
    '[encryption] AVISO: DATABASE_ENCRYPTION_KEY no está definida. ' +
      'Se usará la clave legacy para leer los datos cifrados con ella. ' +
      'Define la variable en el entorno y rota los datos con: ' +
      'node packages/database/rotate-encryption-key.mjs --apply',
  );
}

export function encrypt(text: string): string {
  if (!text) return text;

  const iv = randomBytes(IV_LENGTH);
  const key = getEncryptionKey();
  const cipher = createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  const authTag = cipher.getAuthTag().toString('hex');

  // Format: iv:authTag:encryptedData
  return `${iv.toString('hex')}:${authTag}:${encrypted}`;
}

export function decrypt(encryptedText: string): string {
  if (!encryptedText || !encryptedText.includes(':')) return encryptedText;

  const key = getEncryptionKey();

  try {
    const [ivHex, authTagHex, encryptedData] = encryptedText.split(':');
    if (!ivHex || !authTagHex || !encryptedData) return encryptedText;

    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');

    const decipher = createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  } catch (error) {
    // The value is not readable with the current key: it was encrypted with a
    // different one. Returning the ciphertext keeps the app alive but makes
    // the misconfiguration loud in the logs.
    console.error(
      'Decryption failed (wrong DATABASE_ENCRYPTION_KEY or corrupted value):',
      error,
    );
    return encryptedText;
  }
}
