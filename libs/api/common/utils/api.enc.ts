import * as CryptoJS from 'crypto-js';

export class EncryptionService {
  public static encrypt(text: string): string {
    return CryptoJS.AES.encrypt(text, process.env['APP_SECRET']).toString();
  }

  public static decrypt(cipherText: string): string {
    try {
      const bytes = CryptoJS.AES.decrypt(cipherText, process.env['APP_SECRET']);
      return bytes.toString(CryptoJS.enc.Utf8);
    } catch (e) {
      return null;
    }
  }
}
