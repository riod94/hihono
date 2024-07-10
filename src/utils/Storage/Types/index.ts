import { UploadMetadata } from "firebase/storage";

abstract class StorageDriver {
    abstract store(filePath: string, file: Blob, options?: StoreOptions | UploadMetadata | any): Promise<string | null>;
    abstract get(filePath: string, options?: StoreOptions | UploadMetadata | any): Promise<string | null>;
    abstract delete(filePath: string, options?: StoreOptions | UploadMetadata | any): Promise<boolean>;
}

enum DriverEnum {
    local = 'local',
    firebase = 'firebase',
    gcp = 'gcp',
}

enum VisibilityEnum {
    public = 'public',
    private = 'private',
}

interface StorageConfigInterface {
    driver: DriverEnum;
    credentials?: LocalStorageInterface | FirebaseStorageInterface | GCPStorageInterface | any
}

interface TenantConfigInterface {
    [tenantName: string]: StorageConfigInterface;
}

interface LocalStorageInterface {
    root: string;
    visibility: VisibilityEnum;
}

interface GCPStorageInterface {
    project_id: string;
    private_key: string;
    client_id: string;
    client_email: string;
    storage_bucket: string;
}

interface FirebaseStorageInterface {
    project_id: string;
    api_key: string;
    app_id: string;
    storage_bucket: string;
}
interface StoreOptions {
    visibility?: VisibilityEnum;
    metadata?: {
        contentType?: string;
        contentDisposition?: string;
        cacheControl?: string;
        contentLanguage?: string;
        contentEncoding?: string;
    };
}

export {
    StorageDriver,
    StorageConfigInterface,
    TenantConfigInterface,
    GCPStorageInterface,
    FirebaseStorageInterface,
    LocalStorageInterface,
    StoreOptions,
    DriverEnum,
    VisibilityEnum
}