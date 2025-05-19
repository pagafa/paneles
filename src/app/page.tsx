"use client"; // Make KioskPage a Client Component

import { KioskCarousel } from '@/components/kiosk/KioskCarousel';
import { mockSchoolEvents, mockClasses } from '@/lib/placeholder-data';
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
import { useLanguage } from '@/context/LanguageContext'; // Import useLanguage
import { useEffect, useState } from 'react';


// Simulate fetching data (can remain as is, or be moved to useEffect if it becomes client-side specific)
async function getSchoolEvents(): Promise<SchoolEvent[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockSchoolEvents.filter(event => new Date(event.date) >= new Date(new Date().toDateString())));
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
  const { t } = useLanguage(); // Get translation function
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
      setAllEvents(eventsData);
      setClasses(classesData);
      setLoading(false);
    }
    fetchData();
  }, []);

  const announcements = allEvents.filter(event => event.type === 'announcement') as Announcement[];
  const exams = allEvents.filter(event => event.type === 'exam') as Exam[];
  const deadlines = allEvents.filter(event => event.type === 'deadline') as Deadline[];

  const sections: { titleKey: keyof import('@/lib/i18n').translations; events: SchoolEvent[]; icon: React.ElementType, emptyHintKey: keyof import('@/lib/i18n').translations, emptyImageHint: string }[] = [
    { titleKey: 'announcementsSectionTitle', events: announcements, icon: Megaphone, emptyHintKey: 'noAnnouncementsHint', emptyImageHint: 'megaphone empty' },
    { titleKey: 'examsSectionTitle', events: exams, icon: BookOpenCheck, emptyHintKey: 'noExamsHint', emptyImageHint: 'exam calendar' },
    { titleKey: 'deadlinesSectionTitle', events: deadlines, icon: FileText, emptyHintKey: 'noDeadlinesHint', emptyImageHint: 'deadline list' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-background to-secondary/30 p-4">
        <p>{t('kioskMainTitle', 'Loading...')}</p> {/* Example usage of t during loading */}
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
                <DropdownMenuItem disabled>{t('noClassesHint', 'No classes available')}</DropdownMenuItem> // Assuming noClassesHint exists or add it
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
          {sections.map((section, index) => (
            <section key={section.titleKey} className="w-full max-w-4xl">
              <div className="flex items-center mb-6">
                <section.icon className="h-8 w-8 text-primary mr-3" />
                <h2 className="text-3xl font-semibold text-primary/90">{t(section.titleKey)}</h2>
              </div>
              {section.events.length > 0 ? (
                <KioskCarousel items={section.events} />
              ) : (
                <div className="text-center py-8 px-4 bg-card rounded-lg shadow-md">
                  <Image 
                    src={`https://placehold.co/300x200.png`} 
                    alt={t(section.emptyHintKey)}
                    width={200} 
                    height={133} 
                    className="mx-auto mb-4 rounded-lg shadow-sm"
                    data-ai-hint={section.emptyImageHint}
                  />
                  <p className="text-xl font-medium text-muted-foreground">{t(section.emptyHintKey)}</p>
                  <p className="text-sm text-muted-foreground">{t('checkBackLaterHint')}</p>
                </div>
              )}
              {index < sections.length - 1 && <Separator className="my-12" />}
            </section>
          ))}
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
