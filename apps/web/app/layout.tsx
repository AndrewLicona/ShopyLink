import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ShopyLink | Tu tienda en WhatsApp en minutos",
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
      <body className={`${inter.className} antialiased selection:bg-blue-100 selection:text-blue-900`} suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
