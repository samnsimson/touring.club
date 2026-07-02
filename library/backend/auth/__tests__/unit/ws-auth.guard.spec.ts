import { ExecutionContext } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { WsAuthGuard } from '../../src/lib/guard/ws-auth.guard';
import { AuthUtils } from '../../src/lib/utils/auth.utils';

function createContext(client: unknown): ExecutionContext {
    return {
        switchToWs: () => ({ getClient: () => client }),
    } as ExecutionContext;
}

describe('WsAuthGuard', () => {
    let guard: WsAuthGuard;

    beforeEach(() => {
        guard = new WsAuthGuard();
        vi.restoreAllMocks();
    });

    it('sets client.data.userId when the handshake auth token is valid', async () => {
        vi.spyOn(AuthUtils, 'verifyAuthToken').mockResolvedValue({ userId: 'user-1' });
        const client = { handshake: { auth: { token: 'valid-token' }, query: {} }, data: {} as { userId?: string } };
        await expect(guard.canActivate(createContext(client))).resolves.toBe(true);
        expect(client.data.userId).toBe('user-1');
    });

    it('falls back to the handshake query token', async () => {
        vi.spyOn(AuthUtils, 'verifyAuthToken').mockResolvedValue({ sub: 'user-2' });
        const client = { handshake: { auth: {}, query: { token: 'query-token' } }, data: {} as { userId?: string } };
        await expect(guard.canActivate(createContext(client))).resolves.toBe(true);
        expect(client.data.userId).toBe('user-2');
    });

    it('throws WsException when no token is present', async () => {
        const client = { handshake: { auth: {}, query: {} }, data: {} };
        await expect(guard.canActivate(createContext(client))).rejects.toBeInstanceOf(WsException);
    });

    it('throws WsException when the token is invalid', async () => {
        vi.spyOn(AuthUtils, 'verifyAuthToken').mockRejectedValue(new Error('invalid'));
        const client = { handshake: { auth: { token: 'bad-token' }, query: {} }, data: {} };
        await expect(guard.canActivate(createContext(client))).rejects.toBeInstanceOf(WsException);
    });
});
