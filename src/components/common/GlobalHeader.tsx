
"use client";

import Link from 'next/link';
import { useEffect, useState, useCallback } from 'react'; // Engadido useCallback
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

const SIDEBAR_WIDTH_DESKTOP_EXPANDED_REM = 16;

async function getClassesData(): Promise<SchoolClass[]> {
  try {
    const response = await fetch('/api/classes');
    if (!response.ok) {
      console.error("Failed to fetch classes for GlobalHeader dropdown", response.status, await response.text().catch(() => ""));
      return [];
    }
    const allClasses: SchoolClass[] = await response.json();
    // Filtrar clases ocultas
    return allClasses.filter(cls => !cls.isHidden).sort((a, b) => a.name.localeCompare(b.name));
  } catch (error) {
    console.error('Error fetching classes for GlobalHeader dropdown:', error);
    return [];
  }
}

export function GlobalHeader() {
  const { t } = useLanguage();
  const [visibleClasses, setVisibleClasses] = useState<SchoolClass[]>([]); // Cambiado a visibleClasses
  const [isLoadingClasses, setIsLoadingClasses] = useState(true);

  const pathname = usePathname();
  const isMobile = useIsMobile();

  const isAuthenticatedRoute = pathname.startsWith('/admin/') || pathname.startsWith('/delegate/');
  const isDesktopAuthLayout = isAuthenticatedRoute && !isMobile;

  const fetchData = useCallback(async () => { // Engadido useCallback
    setIsLoadingClasses(true);
    const classesData = await getClassesData(); // Xa filtradas
    setVisibleClasses(classesData);
    setIsLoadingClasses(false);
  }, []); // useCallback sen dependencias se getClassesData non depende de props/estado deste compoñente

  useEffect(() => {
    fetchData();
  }, [fetchData]); // Dependencia en fetchData (que agora é useCallback)

  const baseContentPaddingX = "px-4 sm:px-6 lg:px-8";

  const headerInternalDivClasses = cn(
    "h-16 flex justify-between items-center w-full",
    isDesktopAuthLayout
      ? `pl-[calc(var(--sidebar-width,${SIDEBAR_WIDTH_DESKTOP_EXPANDED_REM}rem)_+_1rem)] pr-4 sm:pr-6 lg:pr-8`
      : baseContentPaddingX
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
              {!isLoadingClasses && visibleClasses.length > 0 ? ( // Usar visibleClasses
                visibleClasses.map((cls) => ( // Usar visibleClasses
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
