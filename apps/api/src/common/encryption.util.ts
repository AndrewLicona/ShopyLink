import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from 'crypto';

// The encryption key should be exactly 32 bytes for AES-256
// In a real production environment, this MUST be a 32-byte hex string in process.env.DATABASE_ENCRYPTION_KEY
const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12; // Standard for GCM
const AUTH_TAG_LENGTH = 16;

function getEncryptionKey(): Buffer {
    const key = process.env.DATABASE_ENCRYPTION_KEY || 'shopy-link-placeholder-key-32-chars!!';
    // If the key is less than 32 chars, we pad it or hash it to reach 32 bytes
    // Using scrypt to ensure we always get a 32-byte key
    return scryptSync(key, 'salt', 32);
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

    try {
        const [ivHex, authTagHex, encryptedData] = encryptedText.split(':');
        if (!ivHex || !authTagHex || !encryptedData) return encryptedText;

        const iv = Buffer.from(ivHex, 'hex');
        const authTag = Buffer.from(authTagHex, 'hex');
        const key = getEncryptionKey();

        const decipher = createDecipheriv(ALGORITHM, key, iv);
        decipher.setAuthTag(authTag);

        let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
        decrypted += decipher.final('utf8');

        return decrypted;
    } catch (error) {
        console.error('Decryption failed:', error);
        // If decryption fails, it might be raw text or corrupted
        return encryptedText;
    }
}
