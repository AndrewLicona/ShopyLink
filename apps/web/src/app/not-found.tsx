import Link from 'next/link';

export default function NotFound() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center p-4">
            <div className="text-center">
                <h2 className="mb-4 text-2xl font-bold">Página no encontrada</h2>
                <p className="mb-8 text-gray-600">
                    Lo sentimos, no pudimos encontrar la página que buscas.
                </p>
                <Link
                    href="/"
                    className="rounded bg-blue-600 px-4 py-2 font-bold text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                >
                    Volver al inicio
                </Link>
            </div>
        </div>
    );
}
