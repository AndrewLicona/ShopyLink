/** @type {import('next').NextConfig} */
const nextConfig = {
    output: "standalone",
    async rewrites() {
        // Docker Internal vs Localhost Fallback
        const apiUrl = process.env.INTERNAL_API_URL || 'http://localhost:3001/api';
        console.log(`[Next.js] Proxying /api-proxy to: ${apiUrl}`);

        return [
            {
                source: '/api-proxy/:path*',
                destination: `${apiUrl}/:path*`,
            },
        ];
    },
};

export default nextConfig;
