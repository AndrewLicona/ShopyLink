/** @type {import('next').NextConfig} */
const nextConfig = {
    output: "standalone",
    async rewrites() {
        const apiUrl = process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL;
        console.log('Proxying API requests to:', apiUrl);
        return [
            {
                source: '/api-proxy/:path*',
                destination: `${apiUrl}/:path*`, // Proxy to Backend (Internal or Public)
            },
        ];
    },
};

export default nextConfig;
