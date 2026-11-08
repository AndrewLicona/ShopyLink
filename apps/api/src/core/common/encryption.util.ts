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
 * This is deliberately fatal: encrypting with an implicit/default key would
 * make every secret in the database readable by anyone with the source code.
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
 * There is no fallback on purpose: a missing key must stop the process
 * instead of silently degrading to a well-known value.
 */
function getEncryptionKey(): Buffer {
  const rawKey = process.env.DATABASE_ENCRYPTION_KEY;

  if (!rawKey || rawKey.trim().length === 0) {
    throw new MissingEncryptionKeyError();
  }

  return scryptSync(rawKey.trim(), KEY_SALT, 32);
}

/**
 * Verifies that the encryption key is configured.
 *
 * Called on bootstrap so the API fails fast and loudly instead of throwing
 * later on the first request that happens to touch an encrypted column.
 */
export function assertEncryptionKeyConfigured(): void {
  getEncryptionKey();
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
