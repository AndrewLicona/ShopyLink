/** @type {import('next').NextConfig} */
const nextConfig = {
    output: "standalone",
    async rewrites() {
        console.log('Next.js Rewrites: Proxying /api-proxy to http://api:3001/api');
        return [
            {
                source: '/api-proxy/:path*',
                destination: 'http://api:3001/api/:path*', // Hardcoded Internal Docker URL
            },
        ];
    },
};

export default nextConfig;
