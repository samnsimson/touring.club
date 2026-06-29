import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import Handlebars from 'handlebars';
import prettier from 'prettier';
import { SERVICES } from '../src/services';

const toPascalCase = (service: string) =>
    service
        .replace(/-service$/, '')
        .split('-')
        .map((part) => part[0].toUpperCase() + part.slice(1))
        .join('');

const services = SERVICES.map((service) => {
    const pascal = toPascalCase(service);
    return {
        service,
        sdkImport: `${pascal}Sdk`,
        createClientImport: `create${pascal}Client`,
        field: `${pascal[0].toLowerCase()}${pascal.slice(1)}Client`,
    };
});

export async function generateApiClient() {
    const templatePath = join(__dirname, 'templates', 'client.ts.hbs');
    const outputPath = join(__dirname, '..', 'src', 'client.ts');

    const template = Handlebars.compile(readFileSync(templatePath, 'utf-8'));
    const content = template({ services });

    const config = await prettier.resolveConfig(outputPath);
    const formatted = await prettier.format(content, { ...config, filepath: outputPath });
    writeFileSync(outputPath, formatted);
}

generateApiClient();
