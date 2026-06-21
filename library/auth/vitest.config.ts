import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        name: 'auth',
        root: __dirname,
        include: ['src/**/adapter.spec.ts'],
        testTimeout: 60_000,
        hookTimeout: 60_000,
    },
});
