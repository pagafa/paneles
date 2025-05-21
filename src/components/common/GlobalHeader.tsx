
"use client";

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { AppLogo } from "@/components/common/AppLogo";
import { UserNav } from "@/components/common/UserNav";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import type { SchoolClass } from "@/types";
import { useLanguage } from "@/context/LanguageContext";
import { Skeleton } from '@/components/ui/skeleton';
import { usePathname } from 'next/navigation';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

// This should match the --sidebar-width CSS variable in globals.css or sidebar.tsx
const SIDEBAR_WIDTH_DESKTOP_EXPANDED_REM = 16;

async function getClassesData(): Promise<SchoolClass[]> {
  try {
    const response = await fetch('/api/classes');
    if (!response.ok) {
      console.error("Failed to fetch classes for GlobalHeader dropdown", response.status, await response.text().catch(() => ""));
      return [];
    }
    return (await response.json()).sort((a:SchoolClass, b:SchoolClass) => a.name.localeCompare(b.name));
  } catch (error) {
    console.error('Error fetching classes for GlobalHeader dropdown:', error);
    return [];
  }
}

export function GlobalHeader() {
  const { t } = useLanguage();
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [isLoadingClasses, setIsLoadingClasses] = useState(true);

  const pathname = usePathname();
  const isMobile = useIsMobile();

  const isAuthenticatedRoute = pathname.startsWith('/admin/') || pathname.startsWith('/delegate/');
  const isDesktopAuthLayout = isAuthenticatedRoute && !isMobile;

  useEffect(() => {
    const fetchData = async () => {
      setIsLoadingClasses(true);
      const classesData = await getClassesData();
      setClasses(classesData);
      setIsLoadingClasses(false);
    };
    fetchData();
  }, []);

  // Base horizontal padding for content within the header for public pages or mobile
  const baseContentPaddingX = "px-4 sm:px-6 lg:px-8";

  // Classes for the main content div inside the header
  const headerInternalDivClasses = cn(
    "h-16 flex justify-between items-center w-full", // Always full-width and flex properties
    isDesktopAuthLayout
      ? `pl-[${SIDEBAR_WIDTH_DESKTOP_EXPANDED_REM}rem] pr-4 sm:pr-6 lg:pr-8` // Padding for desktop authenticated view
      : baseContentPaddingX // Standard padding for public/mobile
  );

  return (
    <header className="sticky top-0 z-[60] w-full bg-background/90 backdrop-blur-sm shadow-md">
      <div className={headerInternalDivClasses}>
        <div className="flex-shrink-0">
          <AppLogo />
        </div>
        <div className="flex items-center space-x-3 sm:space-x-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="flex items-center text-sm" disabled={isLoadingClasses}>
                {isLoadingClasses ? <Skeleton className="h-5 w-20" /> : t('viewClassesButtonLabel')}
                {!isLoadingClasses && <ChevronDown className="ml-1.5 h-4 w-4" />}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="mt-2">
              {isLoadingClasses && <DropdownMenuItem disabled>{t('loadingLabel')}</DropdownMenuItem>}
              {!isLoadingClasses && classes.length > 0 ? (
                classes.map((cls) => (
                  <DropdownMenuItem key={cls.id} asChild>
                    <Link href={`/class/${cls.id}`} className="w-full text-left">
                      {cls.name}
                    </Link>
                  </DropdownMenuItem>
                ))
              ) : (
                !isLoadingClasses && <DropdownMenuItem disabled>{t('noClassesHint')}</DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
          <UserNav />
        </div>
      </div>
    </header>
  );
}
