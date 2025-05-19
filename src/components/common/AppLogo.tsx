"use client";

import { School } from 'lucide-react';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';

export function AppLogo() {
  const { t } = useLanguage();
  return (
    <Link href="/" className="flex items-center gap-2 text-primary hover:text-primary/90 transition-colors">
      <School className="h-8 w-8" />
      <span className="text-xl font-semibold">{t('appTitle')}</span>
    </Link>
  );
}
