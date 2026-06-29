import { writeFileSync } from 'fs';
import { join } from 'path';
import prettier from 'prettier';
import { SERVICES } from '../src/services';

const toPascalCase = (service: string) =>
    service
        .replace(/-service$/, '')
        .split('-')
        .map((part) => part[0].toUpperCase() + part.slice(1))
        .join('');

const names = SERVICES.map((service) => {
    const pascal = toPascalCase(service);
    return {
        service,
        sdkImport: `${pascal}Sdk`,
        createClientImport: `create${pascal}Client`,
        field: `${pascal[0].toLowerCase()}${pascal.slice(1)}Sdk`,
        getter: `${pascal[0].toLowerCase()}${pascal.slice(1)}Client`,
    };
});

const sdkImports = names.map((n) => `import { Sdk as ${n.sdkImport} } from './lib/${n.service}-client';`).join('\n');

const clientImports = names.map((n) => `import { createClient as ${n.createClientImport} } from './lib/${n.service}-client/client';`).join('\n');

const fields = names.map((n) => `    private readonly ${n.field}: ${n.sdkImport};`).join('\n');

const assignments = names
    .map((n) => `        this.${n.field} = new ${n.sdkImport}({ client: ${n.createClientImport}({ baseUrl: config.baseUrl }) });`)
    .join('\n');

const getters = names
    .map(
        (n) => `    get ${n.getter}() {
        return this.${n.field};
    }`,
    )
    .join('\n\n');

const content = `${sdkImports}

${clientImports}

export interface ApiClientConfig {
    baseUrl?: string;
}

export class ApiClient {
${fields}

    constructor(config: ApiClientConfig = {}) {
${assignments}
    }

${getters}
}
`;

export async function generateApiClient() {
    const outputPath = join(__dirname, '..', 'src', 'client.ts');
    const config = await prettier.resolveConfig(outputPath);
    const formatted = await prettier.format(content, { ...config, filepath: outputPath });
    writeFileSync(outputPath, formatted);
}

generateApiClient();
