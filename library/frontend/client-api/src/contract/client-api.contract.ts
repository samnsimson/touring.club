export type AuthToken = string | undefined;

export interface AuthChallenge {
    in?: 'header' | 'query' | 'cookie';
    key?: string;
    name?: string;
    scheme?: 'basic' | 'bearer';
    type: 'apiKey' | 'http';
}

export interface ClientApiOptions {
    baseUrl: string;
    /** @default 'include' — send the Better Auth session cookie through Kong. */
    credentials?: RequestCredentials;
    /** Static bearer token or async callback, forwarded as an Authorization header alongside/instead of the session cookie. */
    auth?: ((challenge: AuthChallenge) => Promise<AuthToken> | AuthToken) | AuthToken;
}
