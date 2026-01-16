/* global process */
/** @type {import('next').NextConfig} */
const nextConfig = {
    output: "standalone",
    images: {
        unoptimized: true, // Allow data URLs and any external source
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'lvlwvcftxckjeljrcszt.supabase.co',
                port: '',
                pathname: '/storage/v1/object/public/**',
            },
            {
                protocol: 'https',
                hostname: 'images.unsplash.com',
                port: '',
                pathname: '/**',
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
