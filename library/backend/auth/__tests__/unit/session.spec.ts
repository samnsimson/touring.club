import { UnauthorizedException } from '@nestjs/common';
import { describe, expect, it } from 'vitest';
import { ExecutionContext } from '@nestjs/common';
import { AuthUtils } from '../../src/lib/utils/auth.utils';
import { currentSessionFactory } from '../../src/lib/decorators/current-session.decorator';

const resolveSessionUserId = AuthUtils.resolveSessionUserId;

function createContext(session: unknown): ExecutionContext {
    return {
        switchToHttp: () => ({
            getRequest: () => ({ session }),
        }),
    } as ExecutionContext;
}

describe('resolveSessionUserId', () => {
    it('returns userId when present on the session', () => {
        expect(resolveSessionUserId({ userId: 'user-1', sub: 'user-1' })).toBe('user-1');
    });

    it('falls back to sub when userId is absent', () => {
        expect(resolveSessionUserId({ sub: 'user-2' })).toBe('user-2');
    });

    it('throws when neither userId nor sub is available', () => {
        expect(() => resolveSessionUserId({})).toThrow(UnauthorizedException);
    });
});

describe('currentSessionFactory', () => {
    it('returns the full session when no key is provided', () => {
        const session = { userId: 'user-1', sub: 'user-1', email: 'a@example.com' };
        expect(currentSessionFactory(undefined, createContext(session))).toEqual(session);
    });

    it('returns userId with sub fallback when userId key is provided', () => {
        expect(currentSessionFactory('userId', createContext({ sub: 'user-2' }))).toBe('user-2');
    });

    it('returns a specific session property when a key is provided', () => {
        expect(currentSessionFactory('email', createContext({ sub: 'user-1', email: 'a@example.com' }))).toBe('a@example.com');
    });

    it('throws when session is missing', () => {
        expect(() => currentSessionFactory(undefined, createContext(undefined))).toThrow(UnauthorizedException);
    });
});
