import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { Analytics } from "@vercel/analytics/react";

export const metadata: Metadata = {
  metadataBase: new URL('https://la-leniera.vercel.app'),
  title: {
    default: 'La Leñera | Leña Premium en Cúcuta',
    template: '%s | La Leñera'
  },
  description: 'Venta de leña seleccionada y carbón a domicilio en Cúcuta. Packs Pa\'l Asado, Medio Viaje y Viaje Full. Pedidos rápidos por WhatsApp.',
  keywords: ['leña', 'carbon', 'asado', 'cucuta', 'domicilio', 'bbq'],
  verification: {
    google: 'google-site-verification=CODIGO_AQUI', // Reemplazar con el código real de Search Console
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700&family=Anton&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        {children}
        <Toaster />
        <Analytics />
      </body>
    </html>
  );
}
