import { existsSync, readFileSync } from "fs";
import { FirebaseStorageDriver, GCPStorageDriver, LocalStorageDriver } from "./Drivers";
import { DriverEnum, FirebaseStorageInterface, GCPStorageInterface, LocalStorageInterface, StorageConfigInterface, StorageDriver, StoreOptions, TenantConfigInterface } from "./Types";
import Cache from "../Cache";
import { FileSystem } from "../../config";
import { CACHE_KEY } from "../../config/constants";

export default class Storage {
    protected static storageKey: string = CACHE_KEY.TENANT_NAME;
    protected static tenantRootFilePath: string = './src/storage/storage-config.json';
    protected static selectTenant: string;
    protected static tenantConfig: TenantConfigInterface;
    protected static storageDrivers: { [tenantName: string]: StorageDriver } = {};
    protected static defaultConfig: StorageConfigInterface;

    static setSelectTenant(tenantName: string): string {
        // set default config
        this.defaultConfig = FileSystem.drivers[FileSystem.default]
        // set tenant
        this.selectTenant = Cache.forever(this.storageKey, tenantName);
        // set storage drivers
        this.setStorageConfig(tenantName);
        return this.selectTenant;
    }

    static getSelectTenant(): string {
        // get tenant
        if (!this.selectTenant) {
            this.selectTenant = Cache.get(this.storageKey);
            if (!this.selectTenant) {
                throw new Error('Tenant not found');
            }
        }
        return this.selectTenant;
    }

    static resetSelectTenant() {
        // reset tenant config
        Cache.forget(this.storageKey);
        this.selectTenant = '';
        this.tenantConfig = {};

        return this.selectTenant;
    }

    static getTenantConfig(): TenantConfigInterface | null {
        // get tenant config
        if (!existsSync(this.tenantRootFilePath)) {
            return null;
        }

        // read tenant storage config
        let fileDrivers = readFileSync(this.tenantRootFilePath, {
            encoding: 'utf8'
        });

        // Check if fileDrivers is empty or not set
        if (!fileDrivers || !JSON.parse(fileDrivers)?.drivers) {
            throw new Error('Storage drivers not found');
        }

        // parse tenant storage config
        this.tenantConfig = JSON.parse(fileDrivers)?.drivers;

        return this.tenantConfig;
    }

    private static setStorageConfig(tenantName?: string): StorageConfigInterface {
        // set storage config
        const selectTenant = this.getSelectTenant() ?? tenantName;
        const storageConfig = this.getTenantConfig();

        // Get storage config
        if (storageConfig?.[selectTenant]) {
            return storageConfig?.[selectTenant];
        } else {
            // Set default storage config from FileSystem
            return this.defaultConfig;
        }
    }

    private static getStorageDriver(tenantName: string): StorageDriver {
        const storageConfig = this.tenantConfig?.[tenantName] ?? this.defaultConfig;
        if (storageConfig) {
            let credentials: LocalStorageInterface | FirebaseStorageInterface | GCPStorageInterface | any = storageConfig.credentials ?? {};
            switch (storageConfig.driver) {
                case DriverEnum.firebase:
                    this.storageDrivers[tenantName] = new FirebaseStorageDriver(tenantName, credentials);
                    break;
                case DriverEnum.gcp:
                    this.storageDrivers[tenantName] = new GCPStorageDriver(tenantName, credentials);
                    break;
                default:
                    this.storageDrivers[tenantName] = new LocalStorageDriver(tenantName, credentials);
                    break;
            }
        } else {
            throw new Error("Storage config not found");
        }
        if (!this.storageDrivers[tenantName]) {
            throw new Error(`Storage driver for ${tenantName} not found`);
        }

        return this.storageDrivers[tenantName];
    }

    static async put(filePath: string, data: any, options?: StoreOptions): Promise<string | null> {
        try {
            const storageDriver = this.getStorageDriver(this.selectTenant);
            filePath = this.getRealFilePath(filePath)
            this.resetSelectTenant();

            return await storageDriver.store(filePath, data, options);
        } catch (error) {
            console.error(error)
            return null
        }
    }

    static async get(filePath: string, options?: StoreOptions): Promise<string | null> {
        try {
            const storageDriver = this.getStorageDriver(this.selectTenant);
            filePath = this.getRealFilePath(filePath)
            this.resetSelectTenant();

            return await storageDriver.get(filePath, options);
        } catch (error) {
            console.error(error)
            return null
        }
    }

    static async download(filePath: string, options?: StoreOptions): Promise<Response> {
        const storageDriver = this.getStorageDriver(this.selectTenant);
        const url = await storageDriver.get(filePath, options);
        if (!url) {
            throw new Error('File not found');
        }
        return fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to fetch file');
                }

                let fileName = '';
                const contentDisposition = response.headers.get('content-disposition');
                if (contentDisposition) {
                    const regex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
                    const matches = regex.exec(contentDisposition);

                    if (matches != null && matches[1]) {
                        fileName = matches[1].replace(/['"]/g, '');
                    }

                }

                const contentType = response.headers.get('content-type');

                return response.blob().then(blob => ({ blob, fileName, contentType }));
            })
            .then(({ blob, fileName, contentType }) => {
                const headers = {
                    'Content-Disposition': `attachment; filename="${fileName}"`,
                    'Content-Type': contentType || 'application/octet-stream',
                };

                this.resetSelectTenant();
                return new Response(blob, { headers });
            })
            .catch(error => {
                console.error(error);
                throw new Error("Failed to download file");
            });
    }

    static async delete(filePath: string, options?: StoreOptions): Promise<boolean> {
        try {
            const storageDriver = this.getStorageDriver(this.selectTenant);
            filePath = this.getRealFilePath(filePath)
            this.resetSelectTenant();

            return await storageDriver.delete(filePath, options);
        } catch (error) {
            console.error(error);
            return false
        }
    }

    private static getRealFilePath(filePath: string): string {
        const selectTenant = this.getSelectTenant();
        return `${selectTenant}/${filePath}`;
    }
}