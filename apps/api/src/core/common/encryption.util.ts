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
 * Raised when the encryption key is missing or invalid from the environment.
 *
 * The API never encrypts or decrypts with an implicit key: if
 * `DATABASE_ENCRYPTION_KEY` is not defined or has less than 32 bytes of raw input,
 * there is nothing safe to do.
 */
export class MissingEncryptionKeyError extends Error {
  constructor(message = 'DATABASE_ENCRYPTION_KEY is not set or invalid. Refusing to start or encrypt/decrypt data.') {
    super(message);
    this.name = 'MissingEncryptionKeyError';
  }
}

/**
 * Derives the 32-byte AES-256 key from the environment secret.
 *
 * `DATABASE_ENCRYPTION_KEY` is the only source of truth. It must be at least 32 characters.
 */
function getEncryptionKey(): Buffer {
  const rawKey = process.env.DATABASE_ENCRYPTION_KEY?.trim();

  if (!rawKey) {
    throw new MissingEncryptionKeyError(
      'DATABASE_ENCRYPTION_KEY is not set. Refusing to encrypt or decrypt data.',
    );
  }

  const byteLength = Buffer.byteLength(rawKey, 'utf8');
  if (byteLength < 32) {
    throw new MissingEncryptionKeyError(
      `DATABASE_ENCRYPTION_KEY must have at least 32 bytes of entropy (received ${byteLength} bytes).`,
    );
  }

  return scryptSync(rawKey, KEY_SALT, 32);
}

/**
 * Strict validation of encryption key on bootstrap (R13 requirement).
 * Throws a fatal exception if the key is missing or invalid.
 */
export function assertEncryptionKeyConfigured(): void {
  const rawKey = process.env.DATABASE_ENCRYPTION_KEY?.trim();

  if (!rawKey) {
    throw new MissingEncryptionKeyError(
      'FATAL: DATABASE_ENCRYPTION_KEY is required in environment for secure startup.',
    );
  }

  const byteLength = Buffer.byteLength(rawKey, 'utf8');
  if (byteLength < 32) {
    throw new MissingEncryptionKeyError(
      `FATAL: DATABASE_ENCRYPTION_KEY must have at least 32 bytes (received ${byteLength} bytes).`,
    );
  }

  console.log(`[encryption] DATABASE_ENCRYPTION_KEY validada correctamente (${byteLength} bytes).`);
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

  console.error(
    'Decryption failed (wrong DATABASE_ENCRYPTION_KEY or corrupted value):',
    encryptedText.slice(0, 24) + '...',
  );
  return encryptedText;
}
