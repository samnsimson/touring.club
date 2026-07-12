import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import Handlebars from 'handlebars';
import prettier from 'prettier';
import { ApiSdkUtils, CLIENT_REGISTRY } from '@tc/api-sdk';

export async function generateClientApis() {
    console.log(`📝 [client-api] Generating ${CLIENT_REGISTRY.length} service clients...`);

    const templatePath = join(__dirname, 'templates', 'client-api.template.hbs');
    const template = Handlebars.compile(readFileSync(templatePath, 'utf-8'));
    const apisDir = join(__dirname, '..', 'src', 'apis');

    let index = 0;
    for (const service of CLIENT_REGISTRY) {
        index += 1;
        const pascalService = ApiSdkUtils.pascalCase(service);
        const content = template({ service, pascalService });
        const outputPath = join(apisDir, `${service}.client-api.ts`);

        const config = await prettier.resolveConfig(outputPath);
        const formatted = await prettier.format(content, { ...config, filepath: outputPath });
        writeFileSync(outputPath, formatted);

        console.log(`  [${index}/${CLIENT_REGISTRY.length}] ✓ apis/${service}.client-api.ts`);
    }

    console.log(`✅ [client-api] Generated ${CLIENT_REGISTRY.length} service clients.`);
}

generateClientApis();
