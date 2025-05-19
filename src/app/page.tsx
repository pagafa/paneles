
"use client"; 

import { KioskCarousel } from '@/components/kiosk/KioskCarousel';
import { mockSchoolEvents, mockClasses } from '@/lib/placeholder-data';
import type { SchoolEvent, Announcement, Exam, Deadline, SchoolClass } from '@/types';
import Image from 'next/image';
import { Separator } from '@/components/ui/separator';
import { Megaphone, BookOpenCheck, FileText, LogIn, ChevronDown, Info } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useLanguage } from '@/context/LanguageContext'; 
import { useEffect, useState } from 'react';
import type { TranslationKey } from '@/lib/i18n';

const sortEvents = (events: SchoolEvent[]) => {
  return events.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

async function getSchoolEvents(): Promise<SchoolEvent[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Filter out past events, including those from today but earlier time
      const now = new Date();
      resolve(mockSchoolEvents.filter(event => new Date(event.date) >= now)); // mockSchoolEvents is already sorted newest first
    }, 500);
  });
}

async function getClassesData(): Promise<SchoolClass[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockClasses);
    }, 100);
  });
}


export default function KioskPage() {
  const { t } = useLanguage(); 
  const [allEvents, setAllEvents] = useState<SchoolEvent[]>([]);
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const [eventsData, classesData] = await Promise.all([
        getSchoolEvents(),
        getClassesData()
      ]);
      setAllEvents(eventsData); // Already sorted by getSchoolEvents if mockSchoolEvents is sorted
      setClasses(classesData);
      setLoading(false);
    }
    fetchData();
  }, []);

  const announcements = sortEvents(allEvents.filter(event => 
    event.type === 'announcement' && 
    (!event.targetClassIds || event.targetClassIds.length === 0)
  ) as Announcement[]);
  
  const exams = sortEvents(allEvents.filter(event => event.type === 'exam') as Exam[]);
  const deadlines = sortEvents(allEvents.filter(event => event.type === 'deadline') as Deadline[]);

  const sectionsConfig: { titleKey: TranslationKey; events: SchoolEvent[]; icon: React.ElementType, emptyImageHint: string }[] = [
    { titleKey: 'announcementsSectionTitle', events: announcements, icon: Megaphone, emptyImageHint: 'megaphone empty' },
    { titleKey: 'examsSectionTitle', events: exams, icon: BookOpenCheck, emptyImageHint: 'exam calendar' },
    { titleKey: 'deadlinesSectionTitle', events: deadlines, icon: FileText, emptyImageHint: 'deadline list' },
  ];

  const visibleSections = sectionsConfig.filter(section => section.events.length > 0);

  if (loading) {
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
              <Button variant="outline" size="sm" className="flex items-center">
                {t('viewClassesButtonLabel')} <ChevronDown className="ml-1.5 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="mt-2">
              {classes && classes.length > 0 ? (
                classes.map((cls) => (
                  <DropdownMenuItem key={cls.id} asChild>
                    <Link href={`/class/${cls.id}`} className="w-full text-left">
                      {cls.name}
                    </Link>
                  </DropdownMenuItem>
                ))
              ) : (
                <DropdownMenuItem disabled>{t('noClassesHint')}</DropdownMenuItem>
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
              <section key={section.titleKey} className="w-full max-w-4xl">
                <div className="flex items-center mb-6">
                  <section.icon className="h-8 w-8 text-primary mr-3" />
                  <h2 className="text-3xl font-semibold text-primary/90">{t(section.titleKey)}</h2>
                </div>
                <KioskCarousel items={section.events} />
                {index < visibleSections.length - 1 && <Separator className="my-12" />}
              </section>
            ))
          ) : (
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
