import { Bucket, Storage } from "@google-cloud/storage";
import { GCPStorageInterface, StorageDriver } from "../Types";

/**
 * GCP Storage Driver
 * Doc: https://googleapis.dev/nodejs/storage/latest
 * Generate Keys: https://cloud.google.com/iam/docs/keys-create-delete#iam-service-account-keys-create-console
 */
export default class GCPStorageDriver implements StorageDriver {
    private tenant: string
    private credentials: GCPStorageInterface;
    private storage: Storage;
    private bucket: Bucket;

    constructor(tenant: string, credentials: GCPStorageInterface) {
        this.tenant = tenant;
        this.credentials = credentials;
        this.storage = new Storage({
            credentials: {
                project_id: credentials.project_id,
                private_key: credentials.private_key,
                client_id: credentials.client_id,
                client_email: credentials.client_email,
            }
        })

        this.bucket = this.storage.bucket(this.credentials.storage_bucket);
    }

    async store(filePath: string, file: Blob): Promise<string | null> {
        // Implementasi untuk menyimpan data ke GCP Storage
        filePath = this.getFilePath(filePath);
        const fileType = file.type || 'application/octet-stream';
        const arrayBuffer = await file.arrayBuffer();
        const fileStream = Buffer.from(arrayBuffer);
        await this.bucket.file(filePath).save(fileStream, { contentType: fileType, predefinedAcl: 'publicRead' });

        return await this.get(filePath);
    }

    async get(filePath: string): Promise<string | null> {
        filePath = this.getFilePath(filePath);
        const exists = await this.bucket.file(filePath).exists();
        if (!exists[0]) {
            return null
        }
        // Implementasi untuk mendapatkan data dari GCP Storage
        return await this.bucket.file(filePath).publicUrl();
    }

    async delete(filePath: string): Promise<boolean> {
        filePath = this.getFilePath(filePath);
        const exists = await this.bucket.file(filePath).exists();
        if (!exists[0]) {
            return false
        }
        // Implementasi untuk menghapus data dari GCP Storage
        await this.bucket.file(filePath).delete();

        return true;
    }

    getFilePath(filePath: string) {
        // Check if string tenant exists in filePath
        return !filePath.includes(this.tenant) && this.tenant ? `${this.tenant}/${filePath}` : filePath
    }
}