export default class Crypt {

    static encrypt(text: string, key?: string): string {
        const eKey = !key ? process.env.APP_KEY || 'encrypted' : key;
        const keyLength = eKey.length;
        let encrypted = '';

        for (let i = 0; i < text.length; i++) {
            const charCode = text.charCodeAt(i);
            const keyCharCode = eKey.charCodeAt(i % keyLength);
            const encryptedCharCode = charCode + keyCharCode;
            encrypted += String.fromCharCode(encryptedCharCode);
        }

        return encrypted;
    }

    static decrypt(encrypted: string, key?: string): string {
        const eKey = !key ? process.env.APP_KEY || 'encrypted' : key;
        const keyLength = eKey.length;
        let decrypted = '';

        for (let i = 0; i < encrypted.length; i++) {
            const encryptedCharCode = encrypted.charCodeAt(i);
            const keyCharCode = eKey.charCodeAt(i % keyLength);
            const decryptedCharCode = encryptedCharCode - keyCharCode;
            decrypted += String.fromCharCode(decryptedCharCode);
        }

        return decrypted;
    }

    static hash(text: string, length?: number): string {
        const textLength = text.length;

        // hash sepanjang length
        let hash = '';

        for (let i = 0; i < textLength; i++) {
            hash += Math.random().toString(36).slice(2, 3);
        }

        return hash.slice(0, length || textLength);
    }

    static random(length: number): string {
        let text = '';
        const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        for (let i = 0; i < length; i++) {
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        }
        return text;
    }

    static base64Encode(text: string): string {
        return Buffer.from(text).toString('base64');
    }

    static base64Decode(text: string): string {
        return Buffer.from(text, 'base64').toString('ascii');
    }
}
