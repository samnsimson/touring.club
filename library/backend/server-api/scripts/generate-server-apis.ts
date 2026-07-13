import { mkdirSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import Handlebars from 'handlebars';
import prettier from 'prettier';
import { ApiSdkUtils, CLIENT_REGISTRY } from '@tc/api-sdk';

function toEnvVar(service: string) {
    return `${service.toUpperCase().replace(/-/g, '_')}_URL`;
}

export async function generateServerApis() {
    console.log(`📝 [server-api] Generating client.service.ts and per-service type re-exports for ${CLIENT_REGISTRY.length} services...`);

    const services = CLIENT_REGISTRY.map((service) => ({
        service,
        pascalService: ApiSdkUtils.pascalCase(service),
        camelService: ApiSdkUtils.camelCase(service),
        envVar: toEnvVar(service),
    }));

    const serviceTemplatePath = join(__dirname, 'templates', 'client.service.template.hbs');
    const serviceTemplate = Handlebars.compile(readFileSync(serviceTemplatePath, 'utf-8'));
    const serviceContent = serviceTemplate({ services });

    const servicePath = join(__dirname, '..', 'src', 'client.service.ts');
    const serviceConfig = await prettier.resolveConfig(servicePath);
    const formattedService = await prettier.format(serviceContent, { ...serviceConfig, filepath: servicePath });
    writeFileSync(servicePath, formattedService);
    console.log('  ✓ client.service.ts');

    const typesTemplatePath = join(__dirname, 'templates', 'client.types.template.hbs');
    const typesTemplate = Handlebars.compile(readFileSync(typesTemplatePath, 'utf-8'));
    const typesDir = join(__dirname, '..', 'src', 'types');
    mkdirSync(typesDir, { recursive: true });

    for (const { service } of services) {
        const content = typesTemplate({ service });
        const outputPath = join(typesDir, `${service}.ts`);
        const config = await prettier.resolveConfig(outputPath);
        const formatted = await prettier.format(content, { ...config, filepath: outputPath });
        writeFileSync(outputPath, formatted);
        console.log(`  ✓ types/${service}.ts`);
    }

    console.log(`✅ [server-api] Generated client.service.ts and ${CLIENT_REGISTRY.length} type re-export files.`);
}

generateServerApis();
