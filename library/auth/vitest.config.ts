import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        name: 'auth',
        root: __dirname,
        include: ['__tests__/unit/**/*.spec.ts', '__tests__/unit/**/*.test.ts'],
        passWithNoTests: true,
        testTimeout: 60_000,
        hookTimeout: 60_000,
    },
});
