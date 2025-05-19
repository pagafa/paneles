
"use client"; 

import { KioskCarousel } from '@/components/kiosk/KioskCarousel';
import type { SchoolEvent, Announcement, Exam, Deadline, SchoolClass } from '@/types';
import Image from 'next/image';
import { Separator } from '@/components/ui/separator';
import { Megaphone, BookOpenCheck, FileText, LogIn, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useLanguage } from '@/context/LanguageContext'; 
import { useEffect, useState, useCallback } from 'react';
import type { TranslationKey } from '@/lib/i18n';
import { Skeleton } from '@/components/ui/skeleton';

const sortEvents = (events: SchoolEvent[]) => {
  return [...events].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

// Fetch school-wide announcements from API
async function getSchoolWideAnnouncements(): Promise<Announcement[]> {
  try {
    const response = await fetch('/api/announcements');
    if (!response.ok) {
      console.error("Failed to fetch announcements for kiosk", response.status, await response.text().catch(() => ""));
      return [];
    }
    const allAnnouncements: Announcement[] = await response.json();
    return allAnnouncements.filter(event => 
      event.type === 'announcement' && 
      (!event.targetClassIds || event.targetClassIds.length === 0)
    );
  } catch (error) {
    console.error('Error fetching school-wide announcements for Kiosk:', error);
    return [];
  }
}

// Fetch kiosk-wide exams from API
async function getKioskExams(): Promise<Exam[]> {
  try {
    const response = await fetch('/api/schoolevents?type=exam');
    if (!response.ok) {
      console.error("Failed to fetch exams for kiosk", response.status, await response.text().catch(() => ""));
      return [];
    }
    const allExams: Exam[] = await response.json();
    // Further filter if kiosk exams should only be those not tied to a specific class
    return allExams.filter(exam => !exam.classId); 
  } catch (error) {
    console.error('Error fetching kiosk exams:', error);
    return [];
  }
}

// Fetch kiosk-wide deadlines from API
async function getKioskDeadlines(): Promise<Deadline[]> {
  try {
    const response = await fetch('/api/schoolevents?type=deadline');
    if (!response.ok) {
      console.error("Failed to fetch deadlines for kiosk", response.status, await response.text().catch(() => ""));
      return [];
    }
    const allDeadlines: Deadline[] = await response.json();
    // Further filter if kiosk deadlines should only be those not tied to a specific class
    return allDeadlines.filter(deadline => !deadline.classId);
  } catch (error) {
    console.error('Error fetching kiosk deadlines:', error);
    return [];
  }
}


async function getClassesData(): Promise<SchoolClass[]> {
  try {
    const response = await fetch('/api/classes');
    if (!response.ok) {
      console.error("Failed to fetch classes for kiosk dropdown", response.status, await response.text().catch(() => ""));
      return [];
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching classes for Kiosk dropdown:', error);
    return [];
  }
}


export default function KioskPage() {
  const { t } = useLanguage(); 
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [deadlines, setDeadlines] = useState<Deadline[]>([]);
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  
  const [isLoadingAnnouncements, setIsLoadingAnnouncements] = useState(true);
  const [isLoadingClasses, setIsLoadingClasses] = useState(true);
  const [isLoadingExams, setIsLoadingExams] = useState(true);
  const [isLoadingDeadlines, setIsLoadingDeadlines] = useState(true);

  const loading = isLoadingAnnouncements || isLoadingClasses || isLoadingExams || isLoadingDeadlines; 

  const fetchData = useCallback(async () => {
    setIsLoadingAnnouncements(true);
    setIsLoadingClasses(true);
    setIsLoadingExams(true);
    setIsLoadingDeadlines(true);

    try {
      const announcementsData = await getSchoolWideAnnouncements();
      setAnnouncements(sortEvents(announcementsData));
    } catch (e) { console.error("Error fetching announcements data for Kiosk", e); setAnnouncements([]);} 
    finally { setIsLoadingAnnouncements(false); }

    try {
      const classesData = await getClassesData();
      setClasses(classesData);
    } catch (e) { console.error("Error fetching classes data for Kiosk", e); setClasses([]);}
    finally { setIsLoadingClasses(false); }
    
    try {
      const examsData = await getKioskExams();
      setExams(sortEvents(examsData));
    } catch (e) { console.error("Error fetching exams data for Kiosk", e); setExams([]);}
    finally { setIsLoadingExams(false); }
    
    try {
      const deadlinesData = await getKioskDeadlines();
      setDeadlines(sortEvents(deadlinesData));
    } catch (e) { console.error("Error fetching deadlines data for Kiosk", e); setDeadlines([]);}
    finally { setIsLoadingDeadlines(false); }

  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);


  const sectionsConfig: { titleKey: TranslationKey; events: SchoolEvent[]; icon: React.ElementType, emptyImageHint: string, isLoading: boolean }[] = [
    { titleKey: 'announcementsSectionTitle', events: announcements, icon: Megaphone, emptyImageHint: 'megaphone empty', isLoading: isLoadingAnnouncements },
    { titleKey: 'examsSectionTitle', events: exams, icon: BookOpenCheck, emptyImageHint: 'exam calendar', isLoading: isLoadingExams },
    { titleKey: 'deadlinesSectionTitle', events: deadlines, icon: FileText, emptyImageHint: 'deadline list', isLoading: isLoadingDeadlines },
  ];

  const visibleSections = sectionsConfig.filter(section => section.events.length > 0 || section.isLoading);
  const noEventsForAllSections = !loading && announcements.length === 0 && exams.length === 0 && deadlines.length === 0;


  if (loading && visibleSections.length === 0) { 
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-background to-secondary/30 p-4">
        <p>{t('loadingLabel')}</p> 
      </div>
    );
  }

  const currentYear = new Date().getFullYear();

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

      <div className="flex flex-col items-center p-4 sm:p-8 flex-grow">
        <header className="w-full max-w-6xl mb-8 text-center pt-8 sm:pt-12">
          <h1 className="text-4xl font-bold text-primary tracking-tight sm:text-5xl">
            {t('kioskMainTitle')}
          </h1>
          <p className="mt-3 text-lg text-foreground/80 sm:text-xl">
            {t('kioskMainSubtitle')}
          </p>
        </header>

        <main className="w-full flex-grow flex flex-col items-center space-y-12">
          {visibleSections.length > 0 ? (
            visibleSections.map((section, index) => (
              section.isLoading || section.events.length > 0 ? (
                <section key={section.titleKey} className="w-full max-w-4xl">
                  <div className="flex items-center mb-6">
                    <section.icon className="h-8 w-8 text-primary mr-3" />
                    <h2 className="text-3xl font-semibold text-primary/90">{t(section.titleKey)}</h2>
                  </div>
                  {section.isLoading ? (
                    <div className="w-full max-w-3xl mx-auto" style={{ minHeight: '300px' }}>
                       <Skeleton className="h-64 w-full rounded-lg" />
                    </div>
                  ) : section.events.length > 0 ? (
                    <KioskCarousel items={section.events} />
                  ) : (
                     <p className="text-center text-muted-foreground text-lg">{t('noEventsGeneralHint')}</p>
                  )}
                  {index < visibleSections.filter(s => s.isLoading || s.events.length > 0).length - 1 && <Separator className="my-12" />}
                </section>
              ) : null
            ))
          ) : (
            !loading && noEventsForAllSections &&
            <div className="text-center py-10 px-4 bg-card rounded-lg shadow-md">
              <Image 
                src="https://placehold.co/300x200.png"
                alt={t('noEventsGeneralHint')} 
                width={200}
                height={133}
                className="mx-auto mb-4 rounded-lg shadow-sm"
                data-ai-hint="empty board"
              />
              <p className="text-xl font-medium text-muted-foreground">{t('noEventsGeneralHint')}</p>
              <p className="text-sm text-muted-foreground">{t('checkBackLaterHint')}</p>
            </div>
          )}
        </main>

        <footer className="w-full max-w-6xl mt-16 text-center">
          <p className="text-sm text-muted-foreground">
            &copy; {currentYear} {t('appTitle')}. {t('footerAllRightsReserved')}
          </p>
        </footer>
      </div>
    </div>
  );
}
