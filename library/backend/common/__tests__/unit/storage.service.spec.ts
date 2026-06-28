import { S3Client } from '@aws-sdk/client-s3';
import { ConfigService } from '@tc/config';
import { StorageService } from '../../src/lib/storage/storage.service';

describe('StorageService', () => {
    const buildConfig = (overrides: Record<string, string | undefined> = {}) => {
        const values: Record<string, string | undefined> = {
            AWS_S3_BUCKET: 'touring-club-media',
            AWS_REGION: 'us-east-1',
            AWS_S3_PUBLIC_URL: undefined,
            ...overrides,
        };
        return { get: jest.fn((key: string) => values[key]) } as unknown as ConfigService;
    };

    it('uploads an object and returns its public url', async () => {
        const client = { send: jest.fn().mockResolvedValue({}) } as unknown as S3Client;
        const config = buildConfig();
        const service = new StorageService(client, config);

        const result = await service.upload({ key: 'avatars/user-1.png', body: Buffer.from('img'), contentType: 'image/png' });

        expect(client.send).toHaveBeenCalledTimes(1);
        expect(result).toEqual({ key: 'avatars/user-1.png', url: 'https://touring-club-media.s3.us-east-1.amazonaws.com/avatars/user-1.png' });
    });

    it('builds public urls from a configured public base url', () => {
        const client = { send: jest.fn() } as unknown as S3Client;
        const config = buildConfig({ AWS_S3_PUBLIC_URL: 'https://cdn.touring.club/' });
        const service = new StorageService(client, config);

        expect(service.getPublicUrl('avatars/user-1.png')).toBe('https://cdn.touring.club/avatars/user-1.png');
    });

    it('deletes an object', async () => {
        const client = { send: jest.fn().mockResolvedValue({}) } as unknown as S3Client;
        const config = buildConfig();
        const service = new StorageService(client, config);

        await service.delete('avatars/user-1.png');

        expect(client.send).toHaveBeenCalledTimes(1);
    });
});
