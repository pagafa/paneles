
"use client"; 

import type { SchoolClass, Announcement, SchoolEvent } from '@/types';
// Separator might not be needed anymore if carousels are gone
// import { Separator } from '@/components/ui/separator'; 
import { LogIn, ChevronDown, Activity } from 'lucide-react'; 
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Card, CardContent } from '@/components/ui/card'; 
import { Badge } from '@/components/ui/badge'; 
import { useLanguage } from '@/context/LanguageContext'; 
import { useEffect, useState, useCallback } from 'react';
// TranslationKey is not directly used here, but t function implies it
// import type { TranslationKey } from '@/lib/i18n';
import { Skeleton } from '@/components/ui/skeleton';

// Fetch classes data (remains the same)
async function getClassesData(): Promise<SchoolClass[]> {
  try {
    const response = await fetch('/api/classes');
    if (!response.ok) {
      console.error("Failed to fetch classes for kiosk dropdown", response.status, await response.text().catch(() => ""));
      return [];
    }
    return (await response.json()).sort((a:SchoolClass, b:SchoolClass) => a.name.localeCompare(b.name));
  } catch (error) {
    console.error('Error fetching classes for Kiosk dropdown:', error);
    return [];
  }
}

// Fetch all admin announcements (for counts)
async function getAllAdminAnnouncements(): Promise<Announcement[]> {
  try {
    const response = await fetch('/api/announcements');
    if (!response.ok) {
      console.error("Failed to fetch all admin announcements for counts", response.status, await response.text().catch(() => ""));
      return [];
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching all admin announcements for counts:', error);
    return [];
  }
}

// Fetch ALL school events (delegate submissions for counts)
async function getAllSchoolEventsData(): Promise<SchoolEvent[]> {
  try {
    const response = await fetch('/api/schoolevents'); // No type filter
    if (!response.ok) {
      console.error("Failed to fetch all school events for counts", response.status, await response.text().catch(() => ""));
      return [];
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching all school events for counts:', error);
    return [];
  }
}


export default function KioskPage() {
  const { t } = useLanguage(); 
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [isLoadingClasses, setIsLoadingClasses] = useState(true);

  const [classMessageCounts, setClassMessageCounts] = useState<{ [classId: string]: number }>({});
  const [isLoadingClassCounts, setIsLoadingClassCounts] = useState(true);


  const fetchData = useCallback(async () => {
    setIsLoadingClasses(true);
    setIsLoadingClassCounts(true);

    try {
      const [
        classesData,
        allAdminAnnouncementsData,
        allSchoolEventsForCountsData,
      ] = await Promise.all([
        getClassesData(),
        getAllAdminAnnouncements(),
        getAllSchoolEventsData(),
      ]);

      setClasses(classesData); 
      setIsLoadingClasses(false);
    
      const counts: { [classId: string]: number } = {};
      if (classesData.length > 0) {
        classesData.forEach(cls => {
          let count = 0;
          allAdminAnnouncementsData.forEach(ann => {
            if (ann.targetClassIds && ann.targetClassIds.includes(cls.id)) {
              count++;
            }
          });
          allSchoolEventsForCountsData.forEach(event => {
            if (event.classId === cls.id) {
              count++;
            }
          });
          counts[cls.id] = count;
        });
      }
      setClassMessageCounts(counts);
      setIsLoadingClassCounts(false);

    } catch (e) { 
      console.error("Error fetching data for KioskPage", e); 
      setIsLoadingClasses(false);
      setIsLoadingClassCounts(false);
    }
  }, []); // t removed as it's not used in this useCallback

  useEffect(() => {
    fetchData();
  }, [fetchData]);


  if (isLoadingClasses && isLoadingClassCounts) { 
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-background to-secondary/30 p-4 pt-24 md:pt-28">
        <Skeleton className="h-10 w-48 mb-4" />
        <Skeleton className="h-64 w-full max-w-4xl" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background to-secondary/30">
      
      <nav className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur-sm shadow-md">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-16 flex justify-end items-center space-x-3 sm:space-x-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="flex items-center" disabled={isLoadingClasses}>
                {t('viewClassesButtonLabel')} <ChevronDown className="ml-1.5 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="mt-2">
              {isLoadingClasses && <DropdownMenuItem disabled>{t('loadingLabel')}</DropdownMenuItem>}
              {!isLoadingClasses && classes && classes.length > 0 ? (
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
          <Button asChild variant="default" size="sm">
            <Link href="/login" className="flex items-center">
              <LogIn className="mr-1.5 h-4 w-4" /> {t('loginButtonLabel')}
            </Link>
          </Button>
        </div>
      </nav>

      {/* Main content area - now only shows class activity */}
      <main className="w-full flex-grow flex flex-col items-center p-4 sm:p-8 pt-10 md:pt-12"> 
        
        <section className="w-full max-w-4xl">
          <div className="flex items-center mb-6">
            <Activity className="h-8 w-8 text-primary mr-3" />
            <h2 className="text-3xl font-semibold text-primary/90">{t('activityByClassSectionTitle')}</h2>
          </div>
          {isLoadingClassCounts || isLoadingClasses ? (
            <Card><CardContent className="pt-6"><div className="space-y-3">
              <Skeleton className="h-8 w-3/4 rounded-md" />
              <Skeleton className="h-8 w-2/3 rounded-md" />
              <Skeleton className="h-8 w-1/2 rounded-md" />
            </div></CardContent></Card>
          ) : classes.length > 0 ? (
            <Card className="shadow-md">
              <CardContent className="pt-6">
                {Object.values(classMessageCounts).some(count => count > 0) || (classes.length > 0 && Object.keys(classMessageCounts).length > 0) ? (
                  <ul className="space-y-3">
                    {classes.map((cls) => (
                      <li key={cls.id} className="flex justify-between items-center p-3 rounded-md hover:bg-muted/50 transition-colors border border-border">
                        <span className="font-medium text-foreground/90 text-lg">{cls.name}</span>
                        <Badge variant={(classMessageCounts[cls.id] || 0) > 0 ? "default" : "secondary"} className="text-sm px-3 py-1">
                          {t('messagesCountLabel', { count: classMessageCounts[cls.id] || 0 })}
                        </Badge>
                      </li>
                    ))}
                  </ul>
                ) : (
                   <p className="text-center text-muted-foreground py-4">{t('noClassActivityHint')}</p>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card className="shadow-md">
                <CardContent className="pt-6">
                    <p className="text-center text-muted-foreground py-4">{t('noClassesAvailableForActivity')}</p>
                </CardContent>
            </Card>
          )}
        </section>
      </main>
    </div>
  );
}

    