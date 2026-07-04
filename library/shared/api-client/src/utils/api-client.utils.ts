export class ApiClientUtils {
    static buildBaseUrl(url: string, version = 'v1') {
        return `${url}/api/${version}`;
    }
}
