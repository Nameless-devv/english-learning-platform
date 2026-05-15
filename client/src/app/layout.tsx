import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from 'react-hot-toast';
import { HeartbeatProvider } from '@/components/layout/HeartbeatProvider';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: "ELP - Ingliz Tili O'rganish Platformasi",
  description: "AI yordamida ingliz tilini samarali oʻrganing",
  keywords: "ingliz tili, english, learning, uzbek, AI",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="uz">
      <body className={inter.className}>
        <HeartbeatProvider>{children}</HeartbeatProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: { borderRadius: '12px', background: '#333', color: '#fff' },
            success: { style: { background: '#22c55e', color: '#fff' } },
            error: { style: { background: '#ef4444', color: '#fff' } },
          }}
        />
      </body>
    </html>
  );
}
