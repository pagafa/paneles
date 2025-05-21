
import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { LanguageProvider } from '@/context/LanguageContext';
import { SchoolNameProvider } from '@/context/SchoolNameContext';
import { defaultLanguage } from '@/lib/i18n';
import { GlobalHeader } from '@/components/common/GlobalHeader'; // Import GlobalHeader

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'School Announcements Central',
  description: 'Central hub for school announcements, exams, and deadlines.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang={defaultLanguage}>
      <body className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased flex flex-col min-h-screen`}>
        <SchoolNameProvider>
          <LanguageProvider>
            <GlobalHeader /> {/* GlobalHeader is sticky and h-16 (4rem) */}
            <main className="flex-grow pt-16"> {/* Added pt-16 to offset GlobalHeader */}
              {children}
            </main>
            <Toaster />
          </LanguageProvider>
        </SchoolNameProvider>
      </body>
    </html>
  );
}
