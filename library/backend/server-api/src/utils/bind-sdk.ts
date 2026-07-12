type SdkFunction = (options?: Record<string, unknown>) => unknown;
type SdkModule = Record<string, unknown>;

/**
 * Identity on purpose: `client` is already optional on every hey-api operation's options type,
 * so binding a default client at runtime doesn't need to (and must not) rewrite the call signature —
 * doing so would collapse each operation's generic `ThrowOnError` type param and lose the
 * `data` narrowing that `throwOnError: true` callers rely on.
 */
export type BoundSdk<TSdk extends SdkModule> = TSdk;

export class SdkBinder {
    static bind<TSdk extends SdkModule, TClient>(sdk: TSdk, client: TClient): BoundSdk<TSdk> {
        const bound: Record<string, unknown> = {};
        for (const [key, value] of Object.entries(sdk)) {
            bound[key] = typeof value === 'function' ? (options?: Record<string, unknown>) => (value as SdkFunction)({ ...options, client }) : value;
        }
        return bound as BoundSdk<TSdk>;
    }
}
