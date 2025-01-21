import CryptoJS from 'crypto-js';

// Use environment variable for the secret key, falling back to a default only in development
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'development-key-do-not-use-in-production';

export const encryption = {
  encrypt: (data: any): string => {
    // Convert data to string if it's an object
    const dataStr = typeof data === 'object' ? JSON.stringify(data) : String(data);
    return CryptoJS.AES.encrypt(dataStr, ENCRYPTION_KEY).toString();
  },

  decrypt: (encryptedData: string): any => {
    try {
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
      throw new Error('Failed to decrypt data');
    }
  },

  // Generate a one-time encryption key
  generateExportKey: (): string => {
    return CryptoJS.lib.WordArray.random(16).toString();
  }
};
