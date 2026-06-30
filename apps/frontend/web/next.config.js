//@ts-check

/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
        optimizePackageImports: ['@chakra-ui/react', '@tc/ui'],
    },
};

module.exports = nextConfig;
