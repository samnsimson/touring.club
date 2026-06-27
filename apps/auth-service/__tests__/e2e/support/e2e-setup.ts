import { bootstrapAuthE2EApp, closeAuthE2EApp } from './create-e2e-app';

beforeAll(async () => {
    await bootstrapAuthE2EApp();
}, 60_000);

afterAll(async () => {
    await closeAuthE2EApp();
});
