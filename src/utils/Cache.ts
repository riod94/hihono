import { existsSync, mkdirSync, readdirSync, readFileSync, unlinkSync, writeFileSync } from "fs";
import Crypt from "./Crypt";

export default class Cache {
    private static encryptKey: string = "encryptKey";
    private static rootDir: string = "./src/storage/cache/";
    private static duration: number = 180000; // in miliseconds 180000 = 3 minutes

    static forever(key: string, values: any): typeof values {
        return this.put(key, values, 0);
    }

    static put(key: string, values: any, durationInMiliseconds: number = this.duration): typeof values {
        if (!existsSync(this.rootDir)) {
            mkdirSync(this.rootDir, { recursive: true });
        }
        // Encrypt key and values
        const encryptedKey = Crypt.encrypt(key, this.encryptKey);
        const encryptedValues = Crypt.encrypt(JSON.stringify(values), key);
        const filePath = `${this.rootDir}${encryptedKey}`;

        writeFileSync(filePath, encryptedValues, "utf8");
        if (!existsSync(filePath)) {
            return null;
        }

        if (durationInMiliseconds > 0) {
            setTimeout(() => {
                if (existsSync(filePath)) {
                    unlinkSync(filePath);
                }
            }, durationInMiliseconds);
            console.log(`Cache for ${key} is expired in ${durationInMiliseconds} miliseconds`);
        }

        return values;
    }

    static get(key: string): any {
        // Encrypt key
        const encryptedKey = Crypt.encrypt(key, this.encryptKey);
        const filePath = `${this.rootDir}${encryptedKey}`;
        if (!existsSync(filePath)) {
            return null;
        }

        const encryptedValues = readFileSync(filePath, "utf8");
        if (!encryptedValues) {
            return null;
        }

        // Decrypt values
        const originalText = Crypt.decrypt(encryptedValues, key);

        return JSON.parse(originalText);
    }

    static has(key: string): boolean {
        // Encrypt key
        const encryptedKey = Crypt.encrypt(key, this.encryptKey);
        const filePath = `${this.rootDir}${encryptedKey}`;
        // Check if file and values exists
        if (!existsSync(filePath)) {
            return false;
        }
        const store = readFileSync(filePath, "utf8");
        if (!store) {
            return false;
        }
        return true;
    }

    static forget(key: string): boolean {
        // Encrypt key
        const encryptedKey = Crypt.encrypt(key, this.encryptKey);
        const filePath = `${this.rootDir}${encryptedKey}`;

        if (existsSync(filePath)) {
            unlinkSync(filePath);
            console.info(`Cache for ${key} is deleted`);
            return true;
        }

        return false;
    }

    static flush(): boolean {
        const dir = this.rootDir;
        if (existsSync(dir)) {
            const files = readdirSync(dir);
            for (const file of files) {
                unlinkSync(`${dir}${file}`);
            }

            return true;
        }

        return false;
    }
}