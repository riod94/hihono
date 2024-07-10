import { DriverEnum, StorageConfigInterface, VisibilityEnum } from "../utils/Storage/Types";

const FileSystem: { [key: string]: any, drivers: { [key: string]: StorageConfigInterface } } = {
    "default": process.env.FILESYSTEM_DRIVER ?? DriverEnum.local,
    "drivers": {
        "local": {
            "driver": DriverEnum.local,
            "credentials": {
                "root": "./src/storage",
                "visibility": VisibilityEnum.public
            }
        },
        "firebase": {
            "driver": DriverEnum.firebase,
            "credentials": {
                "project_id": process.env.FIREBASE_PROJECT_ID ?? '',
                "api_key": process.env.FIREBASE_API_KEY ?? '',
                "app_id": process.env.FIREBASE_APP_ID ?? '',
                "storage_bucket": process.env.FIREBASE_STORAGE_BUCKET ?? ''
            }
        },
        "gcp": {
            "driver": DriverEnum.gcp,
            "credentials": {
                "project_id": process.env.GCP_PROJECT_ID ?? '',
                "private_key": process.env.GCP_PRIVATE_KEY ?? '',
                "client_id": process.env.GCP_CLIENT_ID ?? '',
                "client_email": process.env.GCP_CLIENT_EMAIL ?? '',
                "storage_bucket": process.env.GCP_STORAGE_BUCKET ?? ''
            }
        }
    }
}

export default FileSystem