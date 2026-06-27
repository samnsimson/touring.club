import { killPort } from '@nx/node/utils';

module.exports = async function () {
    const port = Number(process.env.AUTH_SERVICE_PORT ?? process.env.PORT ?? 3000);
    await killPort(port);
    console.log(globalThis.__TEARDOWN_MESSAGE__);
};
