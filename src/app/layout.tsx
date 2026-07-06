import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Bots Teaching Aid',
  description: 'Quick lesson plans and classroom activities for Botswana primary school teachers.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
