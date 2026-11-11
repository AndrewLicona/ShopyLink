import {
  assertEncryptionKeyConfigured,
  MissingEncryptionKeyError,
  encrypt,
  decrypt,
} from './encryption.util';

describe('encryption.util', () => {
  const originalEnv = process.env.DATABASE_ENCRYPTION_KEY;
  const validKey = '01234567890123456789012345678901'; // 32 characters / bytes

  afterEach(() => {
    process.env.DATABASE_ENCRYPTION_KEY = originalEnv;
  });

  describe('assertEncryptionKeyConfigured', () => {
    it('throws MissingEncryptionKeyError if DATABASE_ENCRYPTION_KEY is unset', () => {
      delete process.env.DATABASE_ENCRYPTION_KEY;
      expect(() => assertEncryptionKeyConfigured()).toThrow(
        MissingEncryptionKeyError,
      );
    });

    it('throws MissingEncryptionKeyError if DATABASE_ENCRYPTION_KEY is shorter than 32 bytes', () => {
      process.env.DATABASE_ENCRYPTION_KEY = 'short-key';
      expect(() => assertEncryptionKeyConfigured()).toThrow(
        MissingEncryptionKeyError,
      );
    });

    it('succeeds without error when key has 32 or more bytes', () => {
      process.env.DATABASE_ENCRYPTION_KEY = validKey;
      expect(() => assertEncryptionKeyConfigured()).not.toThrow();
    });
  });

  describe('encrypt and decrypt', () => {
    beforeEach(() => {
      process.env.DATABASE_ENCRYPTION_KEY = validKey;
    });

    it('encrypts to format iv:authTag:ciphertext and decrypts back to original', () => {
      const plaintext = '+584120000000';
      const ciphertext = encrypt(plaintext);

      expect(ciphertext).not.toEqual(plaintext);
      const parts = ciphertext.split(':');
      expect(parts).toHaveLength(3);
      expect(parts[0]).toHaveLength(24); // 12 bytes IV in hex
      expect(parts[1]).toHaveLength(32); // 16 bytes auth tag in hex

      const decrypted = decrypt(ciphertext);
      expect(decrypted).toEqual(plaintext);
    });

    it('handles falsy or unformatted text gracefully', () => {
      expect(encrypt('')).toBe('');
      expect(decrypt('')).toBe('');
      expect(decrypt('plain_phone')).toBe('plain_phone');
    });
  });
});
