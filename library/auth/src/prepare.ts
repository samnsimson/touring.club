import { authDataSourceReady } from './lib/auth.datasource';

export async function prepareAuthLibrary(): Promise<void> {
    await authDataSourceReady;
}
