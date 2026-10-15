import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = { title: 'MediGuide - Healthcare, wherever you go', description: 'Find suitable healthcare providers, understand your options and get help navigating local medical services.', icons: { icon: '/favicon.ico' } };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body>{children}</body>
    </html>
  );
}
