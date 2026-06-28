export interface StorageModuleOptions {
    global?: boolean;
}

export interface UploadObjectInput {
    key: string;
    body: Buffer;
    contentType?: string;
}

export interface UploadObjectResult {
    key: string;
    url: string;
}
