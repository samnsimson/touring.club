import { Inject, Injectable } from '@nestjs/common';
import { DeleteObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { ConfigService } from '@tc/config';
import { STORAGE_S3_CLIENT } from './storage.tokens';
import type { UploadObjectInput, UploadObjectResult } from './storage.contract';

@Injectable()
export class StorageService {
    constructor(
        @Inject(STORAGE_S3_CLIENT) private readonly client: S3Client,
        private readonly config: ConfigService,
    ) {}

    async upload(input: UploadObjectInput): Promise<UploadObjectResult> {
        const bucket = this.config.get('AWS_S3_BUCKET');
        await this.client.send(new PutObjectCommand({ Bucket: bucket, Key: input.key, Body: input.body, ContentType: input.contentType }));
        return { key: input.key, url: this.getPublicUrl(input.key) };
    }

    async delete(key: string): Promise<void> {
        const bucket = this.config.get('AWS_S3_BUCKET');
        await this.client.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
    }

    getPublicUrl(key: string): string {
        const publicUrl = this.config.get('AWS_S3_PUBLIC_URL');
        if (publicUrl) return `${publicUrl.replace(/\/$/, '')}/${key}`;

        const bucket = this.config.get('AWS_S3_BUCKET');
        const region = this.config.get('AWS_REGION');
        return `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
    }
}
