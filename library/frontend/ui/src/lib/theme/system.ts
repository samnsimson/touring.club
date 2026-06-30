import { createSystem, defaultConfig, defineConfig } from '@chakra-ui/react';

const config = defineConfig({
    theme: {
        tokens: {
            colors: {
                sunset: {
                    50: { value: '#fff4ed' },
                    100: { value: '#ffe4d2' },
                    200: { value: '#ffc7a3' },
                    300: { value: '#ffa166' },
                    400: { value: '#ff7e33' },
                    500: { value: '#f4631a' },
                    600: { value: '#d94b10' },
                    700: { value: '#b3380f' },
                    800: { value: '#8f2e14' },
                    900: { value: '#742813' },
                },
                ocean: {
                    50: { value: '#edf9fa' },
                    100: { value: '#d2eef1' },
                    200: { value: '#a6dde4' },
                    300: { value: '#71c3cf' },
                    400: { value: '#3da3b3' },
                    500: { value: '#247f8f' },
                    600: { value: '#1c6573' },
                    700: { value: '#19515c' },
                    800: { value: '#18434c' },
                    900: { value: '#173941' },
                },
            },
            fonts: {
                heading: { value: "'Poppins', 'Segoe UI', sans-serif" },
                body: { value: "'Inter', 'Segoe UI', sans-serif" },
            },
        },
        semanticTokens: {
            colors: {
                brand: {
                    solid: { value: '{colors.sunset.500}' },
                    contrast: { value: 'white' },
                    fg: { value: '{colors.sunset.600}' },
                    muted: { value: '{colors.sunset.100}' },
                    subtle: { value: '{colors.sunset.50}' },
                    emphasized: { value: '{colors.sunset.300}' },
                    focusRing: { value: '{colors.sunset.500}' },
                },
                accent: {
                    solid: { value: '{colors.ocean.600}' },
                    contrast: { value: 'white' },
                    fg: { value: '{colors.ocean.700}' },
                    muted: { value: '{colors.ocean.100}' },
                    subtle: { value: '{colors.ocean.50}' },
                },
            },
        },
    },
    globalCss: {
        'html, body': {
            backgroundColor: '{colors.gray.50}',
        },
    },
});

export const system = createSystem(defaultConfig, config);
