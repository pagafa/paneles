
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
import { ChevronDown, LogIn } from "lucide-react";
import type { SchoolClass } from "@/types";
import { useLanguage } from "@/context/LanguageContext";
import { Skeleton } from '@/components/ui/skeleton';

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

  useEffect(() => {
    const fetchData = async () => {
      setIsLoadingClasses(true);
      const classesData = await getClassesData();
      setClasses(classesData);
      setIsLoadingClasses(false);
    };
    fetchData();
  }, []);

  return (
    <header className="sticky top-0 z-[60] w-full bg-background/90 backdrop-blur-sm shadow-md">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-16 flex justify-between items-center">
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
