import { initializeApp } from "firebase/app";
import { deleteObject, getDownloadURL, getStorage, ref, uploadBytes, UploadMetadata } from "firebase/storage";
import { FirebaseStorageInterface, StorageDriver } from "../Types";

/**
 * Firebase Storage Driver
 * Doc: https://firebase.google.com/docs/web/learn-more?hl=en&authuser=2
 */
export default class FirebaseStorageDriver implements StorageDriver {
    private tenant: string
    private credentials: FirebaseStorageInterface;
    private storage: any;

    constructor(tenant: string, credentials: FirebaseStorageInterface) {
        this.tenant = tenant;
        this.credentials = credentials;
        // Initialize Firebase with a "default" Firebase project
        const defaultProject = initializeApp({
            projectId: this.credentials.project_id,
            apiKey: this.credentials.api_key,
            appId: this.credentials.app_id,
            storageBucket: this.credentials.storage_bucket,
        });

        this.storage = getStorage(defaultProject);
    }

    async store(filePath: string, file: Blob, options?: UploadMetadata): Promise<string> {
        // Implementasi untuk menyimpan data ke Firebase Storage
        const storageRef = ref(this.storage, this.getFilePath(filePath));

        // Menentukan tipe parameter format secara eksplisit
        await uploadBytes(storageRef, file, options);

        return await getDownloadURL(storageRef);
    }

    async get(filePath: string): Promise<string> {
        // Implementasi untuk mendapatkan data dari Firebase Storage
        const storageRef = ref(this.storage, this.getFilePath(filePath));

        return await getDownloadURL(storageRef);
    }

    async delete(filePath: string): Promise<boolean> {
        // Implementasi untuk menghapus data dari Firebase Storage
        const storageRef = ref(this.storage, this.getFilePath(filePath));
        const exists = await getDownloadURL(storageRef);

        if (!exists) {
            return false
        }

        await deleteObject(storageRef);

        return true;
    }

    getFilePath(filePath: string) {
        // Check if string tenant exists in filePath
        return !filePath.includes(this.tenant) && this.tenant ? `${this.tenant}/${filePath}` : filePath
    }
}