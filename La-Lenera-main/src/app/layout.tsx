import type { Metadata } from 'next';
import { Inter, Anton } from 'next/font/google';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { Analytics } from "@vercel/analytics/react";

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const anton = Anton({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-anton',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://la-leniera.vercel.app'),
  title: {
    default: 'La Leñera | Leña Premium en Cúcuta',
    template: '%s | La Leñera'
  },
  description: 'Venta de leña seleccionada y carbón a domicilio en Cúcuta. Packs Pa\'l Asado, Medio Viaje y Viaje Full. Pedidos rápidos por WhatsApp.',
  keywords: ['leña', 'carbon', 'asado', 'cucuta', 'domicilio', 'bbq'],
  verification: {
    google: 'google390e0a55723f2003',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} ${anton.variable} font-sans antialiased`}>
        {children}
        <Toaster />
        <Analytics />
      </body>
    </html>
  );
}
