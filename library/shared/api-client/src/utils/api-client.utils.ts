import { upperFirst, camelCase } from 'lodash';
import { SERVICE_REGISTRY } from '../lib/api-client.registry';
export class ApiClientUtils {
    static buildBaseUrl(url: string, version = 'v1') {
        return `${url}/api/${version}`;
    }

    static getServiceEndpoint(name: string) {
        const target = SERVICE_REGISTRY.find((service) => service.name === name);
        if (!target) return undefined;
        return target.endpoint;
    }

    static pascalCase(value: string) {
        return upperFirst(camelCase(value));
    }
}
