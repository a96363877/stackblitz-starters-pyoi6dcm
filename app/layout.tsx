import type React from 'react';
import './globals.css';
import { Cairo } from 'next/font/google';
import { SonnerProvider } from '@/components/sonner-provaider';
import { ThemeProvider } from 'next-themes';

const cairo = Cairo({ subsets: ['arabic'] });

export const metadata = {
  title: " الرئيسية",
  description: 'الصفحة الرئيسية',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl">
      <body className={cairo.className}>
        <ThemeProvider attribute="class" defaultTheme="light">
          {children}
          <SonnerProvider />

        </ThemeProvider>
      </body>
    </html>
  );
}
