import { mkdirSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import Handlebars from 'handlebars';
import prettier from 'prettier';
import { ApiSdkUtils, CLIENT_REGISTRY } from '@tc/api-sdk';

export async function generateClientApis() {
    console.log(`📝 [client-api] Generating client.ts and per-service type re-exports for ${CLIENT_REGISTRY.length} services...`);

    const services = CLIENT_REGISTRY.map((service) => ({
        service,
        pascalService: ApiSdkUtils.pascalCase(service),
        camelService: ApiSdkUtils.camelCase(service),
    }));

    const clientTemplatePath = join(__dirname, 'templates', 'client.template.hbs');
    const clientTemplate = Handlebars.compile(readFileSync(clientTemplatePath, 'utf-8'));
    const clientContent = clientTemplate({ services });

    const clientOutputPath = join(__dirname, '..', 'src', 'client.ts');
    const clientConfig = await prettier.resolveConfig(clientOutputPath);
    const formattedClient = await prettier.format(clientContent, { ...clientConfig, filepath: clientOutputPath });
    writeFileSync(clientOutputPath, formattedClient);
    console.log('  ✓ client.ts');

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

    console.log(`✅ [client-api] Generated client.ts and ${CLIENT_REGISTRY.length} type re-export files.`);
}

generateClientApis();
