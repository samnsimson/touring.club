import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        name: 'auth',
        root: __dirname,
        include: ['src/lib/adapter/tests/**/*.spec.ts'],
        testTimeout: 60_000,
        hookTimeout: 60_000,
    },
});
