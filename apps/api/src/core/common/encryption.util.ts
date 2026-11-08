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
 * Raised when the encryption key is missing from the environment.
 *
 * The API never encrypts or decrypts with an implicit key: if
 * `DATABASE_ENCRYPTION_KEY` is not defined there is nothing safe to do.
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
 * `DATABASE_ENCRYPTION_KEY` is the only source of truth. It is defined on the
 * server in `/etc/dokploy/secrets/shopylink.env`, outside the repository.
 */
function getEncryptionKey(): Buffer {
  const rawKey = process.env.DATABASE_ENCRYPTION_KEY?.trim();

  if (!rawKey) {
    throw new MissingEncryptionKeyError();
  }

  return scryptSync(rawKey, KEY_SALT, 32);
}

/**
 * Reports the encryption configuration on bootstrap.
 *
 * It never blocks the API unless `ENCRYPTION_STRICT=true`: a missing key must
 * not take the whole storefront down. When the key is missing it logs exactly
 * what to do to fix it.
 */
export function assertEncryptionKeyConfigured(): void {
  const rawKey = process.env.DATABASE_ENCRYPTION_KEY?.trim();

  if (rawKey) {
    console.log('[encryption] DATABASE_ENCRYPTION_KEY configurada.');
    return;
  }

  if (process.env.ENCRYPTION_STRICT === 'true') {
    throw new MissingEncryptionKeyError();
  }

  console.error(
    '[encryption] ERROR: DATABASE_ENCRYPTION_KEY no está definida. ' +
      'La API no puede cifrar ni descifrar datos. Defínela en el entorno ' +
      '(en el servidor: /etc/dokploy/secrets/shopylink.env) y reinicia la API.',
  );
}

function tryDecrypt(encryptedText: string, key: Buffer): string | null {
  try {
    const [ivHex, authTagHex, encryptedData] = encryptedText.split(':');
    if (!ivHex || !authTagHex || !encryptedData) return null;

    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');

    const decipher = createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  } catch {
    return null;
  }
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

  const decrypted = tryDecrypt(encryptedText, getEncryptionKey());
  if (decrypted !== null) return decrypted;

  // The value is not readable with the configured key: it was encrypted with a
  // different one. Returning the ciphertext keeps the app alive but makes the
  // misconfiguration loud in the logs.
  console.error(
    'Decryption failed (wrong DATABASE_ENCRYPTION_KEY or corrupted value):',
    encryptedText.slice(0, 24) + '...',
  );
  return encryptedText;
}
