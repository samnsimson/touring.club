import { upperFirst, camelCase } from 'lodash';

export class ApiClientUtils {
    static buildBaseUrl(url: string, version = 'v1') {
        return `${url}/api/${version}`;
    }

    static pascalCase(value: string) {
        return upperFirst(camelCase(value));
    }
}
