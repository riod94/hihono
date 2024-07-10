import { existsSync, mkdirSync, unlinkSync, writeFileSync } from "fs";
import { LocalStorageInterface, StorageDriver, StoreOptions } from "../Types";

/**
 * Local Storage Driver
 * Doc: https://googleapis.dev/nodejs/storage/latest
 */
export default class LocalStorageDriver implements StorageDriver {
    private tenant: string
    private credentials: LocalStorageInterface
    private baseUrl: string
    constructor(tenant: string, credentials: LocalStorageInterface) {
        this.tenant = tenant;
        this.baseUrl = process.env.APP_URL || 'http://localhost:8989';
        this.credentials = {
            root: credentials.root || './src/storage',
            visibility: credentials.visibility || 'public'
        };
    }

    async store(key: string, file: Blob, options?: StoreOptions): Promise<any> {
        // Set visibility
        const { visibility } = options || {};
        if (visibility) {
            this.credentials.visibility = visibility;
        }
        // Get real file path
        const filePath = this.getFilePath(key);

        // Create directory if not exists
        const destination = filePath.split('/').slice(0, -1).join('/');

        if (!existsSync(destination)) {
            mkdirSync(destination, { recursive: true });
        }

        const arrayBuffer = await file.arrayBuffer();
        const fileStream = Buffer.from(arrayBuffer);
        writeFileSync(filePath, fileStream);

        return this.get(key, options);
    }

    async get(key: string, options?: StoreOptions): Promise<string | null> {
        const filePath = this.getFilePath(key);

        if (!existsSync(filePath)) {
            return null;
        }

        // Set Private URL
        const { visibility } = options || {};
        if (visibility) {
            this.credentials.visibility = visibility;
        }

        if (this.credentials.visibility === 'private') {
            const filename = key.replace(`${this.tenant}/`, '')
            return `${this.baseUrl}/${this.tenant}/api/private/${filename}`
        } else {
            return `${this.baseUrl}/${this.credentials.visibility}/${key}`
        }
    }

    async delete(key: string, options?: StoreOptions): Promise<boolean> {
        // Implementasi untuk menghapus data dari local storage
        const filePath = this.getFilePath(key)
        if (!existsSync(filePath)) {
            return false;
        }

        unlinkSync(filePath);

        return true
    }

    getFilePath(key: string) {
        const { root, visibility } = this.credentials

        return `${root}/${visibility}/${key}`
    }
}