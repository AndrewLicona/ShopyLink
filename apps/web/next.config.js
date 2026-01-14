/* global process */
/** @type {import('next').NextConfig} */
const nextConfig = {
    output: "standalone",
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'lvlwvcftxckjeljrcszt.supabase.co',
                port: '',
                pathname: '/storage/v1/object/public/**',
            },
        ],
    },
    async rewrites() {
        // Docker Internal vs Localhost Fallback
        const apiUrl = process.env.INTERNAL_API_URL || 'http://localhost:3001/api';

        return [
            {
                source: '/api-proxy/:path*',
                destination: `${apiUrl}/:path*`,
            },
        ];
    },
};

export default nextConfig;
