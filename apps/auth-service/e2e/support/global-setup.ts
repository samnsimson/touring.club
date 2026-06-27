import { waitForPortOpen } from '@nx/node/utils';
import axios from 'axios';

/* eslint-disable */
var __TEARDOWN_MESSAGE__: string;

module.exports = async function () {
    console.log('\nSetting up...\n');

    const host = process.env.HOST ?? 'localhost';
    const port = process.env.PORT ? Number(process.env.PORT) : 3000;
    await waitForPortOpen(port, { host });

    const baseURL = `http://${host}:${port}`;
    for (let attempt = 0; attempt < 30; attempt += 1) {
        try {
            const response = await axios.get(`${baseURL}/api/health`, { timeout: 2_000 });
            if (response.status === 200) break;
        } catch {
            await new Promise((resolve) => setTimeout(resolve, 1_000));
        }
    }

    globalThis.__TEARDOWN_MESSAGE__ = '\nTearing down...\n';
};
