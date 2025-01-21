import CryptoJS from 'crypto-js';

// Generate a stable development key
const DEV_KEY = 'development-encryption-key-do-not-use-in-production';

// Use environment variable for the secret key, with development fallback
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || DEV_KEY;

// Warn if using development key in production
if (process.env.NODE_ENV === 'production' && !process.env.ENCRYPTION_KEY) {
  console.warn('WARNING: Using development encryption key in production. Please set ENCRYPTION_KEY environment variable.');
}

export const encryption = {
  encrypt: (data: any): string => {
    try {
      // Convert data to string if it's an object
      const dataStr = typeof data === 'object' ? JSON.stringify(data) : String(data);
      return CryptoJS.AES.encrypt(dataStr, ENCRYPTION_KEY).toString();
    } catch (error) {
      console.error('Encryption failed:', error);
      // In development, return a formatted string instead of throwing
      if (process.env.NODE_ENV !== 'production') {
        return `[Encrypted]${typeof data === 'object' ? JSON.stringify(data) : String(data)}`;
      }
      throw new Error('Failed to encrypt data');
    }
  },

  decrypt: (encryptedData: string): any => {
    try {
      // Handle development formatted strings
      if (process.env.NODE_ENV !== 'production' && encryptedData.startsWith('[Encrypted]')) {
        const rawData = encryptedData.replace('[Encrypted]', '');
        try {
          return JSON.parse(rawData);
        } catch {
          return rawData;
        }
      }

      const bytes = CryptoJS.AES.decrypt(encryptedData, ENCRYPTION_KEY);
      const decryptedStr = bytes.toString(CryptoJS.enc.Utf8);

      // Try to parse as JSON if possible
      try {
        return JSON.parse(decryptedStr);
      } catch {
        return decryptedStr;
      }
    } catch (error) {
      console.error('Decryption failed:', error);
      // In development, return the encrypted data as-is
      if (process.env.NODE_ENV !== 'production') {
        return encryptedData;
      }
      throw new Error('Failed to decrypt data');
    }
  },

  // Generate a one-time encryption key
  generateExportKey: (): string => {
    return CryptoJS.lib.WordArray.random(16).toString();
  }
};