import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3000'),
  title: "ShopyLinks | Tu tienda en WhatsApp en minutos",
  description: "Crea tu catálogo digital, gestiona inventario y vende por WhatsApp de forma profesional.",
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const mode = localStorage.getItem('shopy-mode');
                  const theme = localStorage.getItem('shopy-theme');
                  if (mode) document.documentElement.setAttribute('data-mode', mode);
                  if (theme) document.documentElement.setAttribute('data-theme', theme);
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className={`${inter.className} antialiased selection:bg-blue-100 selection:text-blue-900 bg-[var(--bg)]`} suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}




