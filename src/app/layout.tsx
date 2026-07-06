import type { Metadata } from 'next';
import { Schoolbell } from 'next/font/google';
import './globals.css';

const schoolbell = Schoolbell({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-hand',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Bots Teaching Aid',
  description: 'Quick lesson plans and classroom activities for Botswana primary school teachers.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={schoolbell.variable}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
