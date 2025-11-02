import type { Metadata } from 'next';
import './globals.css';
import { WatchlistProvider } from '@/contexts/watchlist-context';
import { FirebaseClientProvider } from '@/firebase/client-provider';
import ClientLayout from './client-layout';

export const metadata: Metadata = {
  title: 'CineView',
  description: 'Your gateway to movies and series.',
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
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body antialiased">
        <FirebaseClientProvider>
          <WatchlistProvider>
            <ClientLayout>{children}</ClientLayout>
          </WatchlistProvider>
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
