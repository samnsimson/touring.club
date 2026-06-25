import { format, resolveConfig } from 'prettier';

export async function formatGeneratedSource(source: string, filepath: string): Promise<string> {
    const config = await resolveConfig(filepath);

    return format(source, {
        ...config,
        filepath,
        parser: 'typescript',
    });
}
