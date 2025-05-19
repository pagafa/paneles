
"use client";

import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import Image from 'next/image';

import { mockClasses, mockSchoolEvents, mockUsers } from "@/lib/placeholder-data";
import type { SchoolClass, SchoolEvent, Announcement, Exam, Deadline, User } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { KioskCarousel } from '@/components/kiosk/KioskCarousel';
import { Separator } from '@/components/ui/separator';
import { Book, Megaphone, BookOpenCheck, FileText, Info } from 'lucide-react'; // Changed Library to Book
import { useLanguage } from '@/context/LanguageContext';
import type { TranslationKey } from '@/lib/i18n';

async function getClassDetails(classId: string): Promise<SchoolClass | undefined> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockClasses.find(cls => cls.id === classId));
    }, 100);
  });
}

async function getEventsForClass(className: string): Promise<SchoolEvent[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const today = new Date(new Date().toDateString());
      resolve(
        mockSchoolEvents.filter(event =>
          event.class === className && new Date(event.date) >= today
        ).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      );
    }, 300);
  });
}

async function getUsers(): Promise<User[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockUsers);
    }, 100);
  });
}


export default function PublicClassPage({ params: paramsPromise }: { params: Promise<{ classId: string }> }) {
  const actualParams = use(paramsPromise);
  const { classId } = actualParams;

  const { t } = useLanguage();

  const [classDetails, setClassDetails] = useState<SchoolClass | null | undefined>(undefined);
  const [classEvents, setClassEvents] = useState<SchoolEvent[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const details = await getClassDetails(classId);
      setClassDetails(details);

      const usersData = await getUsers();
      setUsers(usersData);

      if (details) {
        const events = await getEventsForClass(details.name);
        setClassEvents(events);
      }
      setLoading(false);
    }
    if (classId) {
        fetchData();
    }
  }, [classId]);

  if (loading) {
    return (
      <div className="w-full max-w-lg text-center py-10">
        <p>{t('loadingLabel')}</p>
      </div>
    );
  }

  if (!classDetails) {
    return (
      <div className="w-full max-w-lg text-center">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl text-destructive">{t('classNotFoundTitle')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-6">
              {t('classNotFoundMessage')}
            </p>
            <Button asChild>
              <Link href="/">{t('backToHomeButton')}</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const announcements = classEvents.filter(event => event.type === 'announcement') as Announcement[];
  const exams = classEvents.filter(event => event.type === 'exam') as Exam[];
  const deadlines = classEvents.filter(event => event.type === 'deadline') as Deadline[];

  const sectionsConfig: { titleKey: TranslationKey; events: SchoolEvent[]; icon: React.ElementType, emptyImageHint: string }[] = [
    { titleKey: 'announcementsSectionTitle', events: announcements, icon: Megaphone, emptyImageHint: 'megaphone class empty' },
    { titleKey: 'examsSectionTitle', events: exams, icon: BookOpenCheck, emptyImageHint: 'exam calendar class empty' },
    { titleKey: 'deadlinesSectionTitle', events: deadlines, icon: FileText, emptyImageHint: 'deadline list class empty' },
  ];

  const visibleClassSections = sectionsConfig.filter(section => section.events.length > 0);

  let delegateNameDisplay = "N/A";
  if (classDetails.delegateId) {
    const delegateUser = users.find(u => u.id === classDetails.delegateId && u.role === 'delegate');
    if (delegateUser) {
      delegateNameDisplay = delegateUser.name;
    }
  }

  return (
    <div className="w-full max-w-4xl py-8">
      <Card className="shadow-xl overflow-hidden mb-12 bg-card">
        <CardHeader className="bg-primary/10 p-6">
          <div className="flex items-center gap-3">
            <Book className="h-10 w-10 text-primary" /> {/* Changed Library to Book */}
            <div>
              <CardTitle className="text-3xl font-bold text-primary">{classDetails.name}</CardTitle>
              {/* <CardDescription className="text-primary/80">{t('classPageTitle', { className: classDetails.name })}</CardDescription> Removed this line */}
            </div>
          </div>
        </CardHeader>
        {classDetails.delegateId && (
             <CardContent className="p-4 border-t border-border">
                 <p className="text-sm text-muted-foreground">
                    {t('delegateIdLabel')}: {delegateNameDisplay}
                 </p>
             </CardContent>
        )}
      </Card>

      {visibleClassSections.length > 0 ? (
        visibleClassSections.map((section, index) => (
          <section key={section.titleKey} className="w-full mb-12">
            <div className="flex items-center mb-6">
              <section.icon className="h-8 w-8 text-primary mr-3" />
              <h2 className="text-3xl font-semibold text-primary/90">
                {t(section.titleKey)}
              </h2>
            </div>
            <KioskCarousel items={section.events} />
            {index < visibleClassSections.length - 1 && <Separator className="my-12" />}
          </section>
        ))
      ) : (
        <div className="text-center py-10 px-4 bg-card rounded-lg shadow-md">
          <p className="text-xl font-medium text-muted-foreground">{t('noEventsForClassHint')}</p>
          <p className="text-sm text-muted-foreground">{t('checkBackLaterHint')}</p>
        </div>
      )}
    </div>
  );
}
