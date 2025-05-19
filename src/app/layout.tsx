import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { LanguageProvider } from '@/context/LanguageContext';
import { SchoolNameProvider } from '@/context/SchoolNameContext'; // Import SchoolNameProvider
import { defaultLanguage } from '@/lib/i18n';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'School Announcements Central', // This could also be internationalized later if needed
  description: 'Central hub for school announcements, exams, and deadlines.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang={defaultLanguage}>
      <body className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}>
        <SchoolNameProvider> {/* Wrap LanguageProvider with SchoolNameProvider */}
          <LanguageProvider>
            {children}
            <Toaster />
          </LanguageProvider>
        </SchoolNameProvider>
      </body>
    </html>
  );
}
