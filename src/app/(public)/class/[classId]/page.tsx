
"use client";

import { useEffect, useState, use, useCallback } from 'react';
import Link from 'next/link';
// Image component from next/image removed as per previous request

import type { SchoolClass, SchoolEvent, Announcement, Exam, Deadline, User } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { KioskCarousel } from '@/components/kiosk/KioskCarousel';
import { Separator } from '@/components/ui/separator';
import { Book, Megaphone, BookOpenCheck, FileText, AlertTriangle } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import type { TranslationKey } from '@/lib/i18n';
import { Skeleton } from '@/components/ui/skeleton';

const sortEvents = (events: SchoolEvent[]) => {
  return [...events].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

async function getClassDetails(classId: string): Promise<SchoolClass | undefined> {
  try {
    const response = await fetch(`/api/classes/${classId}`);
    if (!response.ok) {
      if (response.status === 404) return undefined;
      console.error(`Failed to fetch class details for ${classId}: ${response.status}`);
      throw new Error(`API error: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Error in getClassDetails for ${classId}:`, error);
    return undefined;
  }
}

async function getSchoolWideAnnouncements(): Promise<Announcement[]> {
   try {
    const response = await fetch('/api/announcements');
    if (!response.ok) {
        console.error("Failed to fetch announcements for class page", response.status, await response.text().catch(() => ""));
        return [];
    }
    const allAnnouncements: Announcement[] = await response.json();
    return allAnnouncements.filter(event => !event.targetClassIds || event.targetClassIds.length === 0);
  } catch (error) {
    console.error('Error fetching school-wide announcements:', error);
    return [];
  }
}

async function getClassSpecificAnnouncements(classId: string): Promise<Announcement[]> {
  try {
    const response = await fetch('/api/announcements');
    if (!response.ok) {
        console.error("Failed to fetch announcements for class page (specific)", response.status, await response.text().catch(() => ""));
        return [];
    }
    const allAnnouncements: Announcement[] = await response.json();
    return allAnnouncements.filter(event => event.targetClassIds && event.targetClassIds.includes(classId));
  } catch (error) {
    console.error(`Error fetching class-specific announcements for ${classId}:`, error);
    return [];
  }
}

async function getClassExams(classId: string): Promise<Exam[]> {
  try {
    const response = await fetch(`/api/schoolevents?type=exam&classId=${classId}`);
    if (!response.ok) {
      console.error("Failed to fetch exams for class:", classId, response.status, await response.text().catch(() => ""));
      return [];
    }
    return await response.json();
  } catch (error) {
    console.error(`Error fetching class exams for ${classId}:`, error);
    return [];
  }
}

async function getClassDeadlines(classId: string): Promise<Deadline[]> {
   try {
    const response = await fetch(`/api/schoolevents?type=deadline&classId=${classId}`);
    if (!response.ok) {
      console.error("Failed to fetch deadlines for class:", classId, response.status, await response.text().catch(() => ""));
      return [];
    }
    return await response.json();
  } catch (error) {
    console.error(`Error fetching class deadlines for ${classId}:`, error);
    return [];
  }
}

async function getUsers(): Promise<User[]> {
  try {
    const response = await fetch('/api/users');
    if (!response.ok) {
      console.error("Failed to fetch users for class page", response.status, await response.text().catch(() => ""));
      return [];
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching users for delegate name:', error);
    return [];
  }
}


export default function PublicClassPage({ params: paramsPromise }: { params: Promise<{ classId: string }> }) {
  const actualParams = use(paramsPromise);
  const { classId } = actualParams;

  const { t } = useLanguage();

  const [classDetails, setClassDetails] = useState<SchoolClass | null | undefined>(undefined);
  const [users, setUsers] = useState<User[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [deadlines, setDeadlines] = useState<Deadline[]>([]);
  
  const [isLoadingClassDetails, setIsLoadingClassDetails] = useState(true);
  const [isLoadingEvents, setIsLoadingEvents] = useState(true); 
  const [error, setError] = useState<string | null>(null);

  const loading = isLoadingClassDetails || isLoadingEvents;

  const fetchData = useCallback(async () => {
    if (!classId) {
        setIsLoadingClassDetails(false);
        setIsLoadingEvents(false);
        setError(t('classNotFoundMessage'));
        return;
    }

    setIsLoadingClassDetails(true);
    setIsLoadingEvents(true);
    setError(null);

    try {
      const details = await getClassDetails(classId);
      setClassDetails(details);

      if (!details) {
        setError(t('classNotFoundMessage'));
        setIsLoadingClassDetails(false);
        setIsLoadingEvents(false);
        return;
      }
      
      const usersData = await getUsers();
      setUsers(usersData);

      const [schoolWideAnns, classSpecificAnns, classExamsData, classDeadlinesData] = await Promise.all([
        getSchoolWideAnnouncements(),
        getClassSpecificAnnouncements(classId),
        getClassExams(classId), 
        getClassDeadlines(classId)
      ]);
      
      const combinedAnnouncements = sortEvents([...schoolWideAnns, ...classSpecificAnns]);
      const uniqueAnnouncements = Array.from(new Map(combinedAnnouncements.map(ann => [ann.id, ann])).values());

      setAnnouncements(uniqueAnnouncements);
      setExams(sortEvents(classExamsData));
      setDeadlines(sortEvents(classDeadlinesData));

    } catch (err) {
      console.error("Error fetching data for class page:", err);
      setError((err as Error).message || "An unexpected error occurred");
      setClassDetails(null);
      setAnnouncements([]);
      setExams([]);
      setDeadlines([]);
    } finally {
      setIsLoadingClassDetails(false);
      setIsLoadingEvents(false);
    }
  }, [classId, t]);


  useEffect(() => {
    fetchData();
  }, [fetchData]);


  if (isLoadingClassDetails) {
    return (
      <div className="w-full max-w-4xl py-8 space-y-8">
        <Skeleton className="h-24 w-full rounded-lg" />
        <Skeleton className="h-64 w-full rounded-lg" />
        <Skeleton className="h-64 w-full rounded-lg" />
      </div>
    );
  }

  if (error && !classDetails) { 
    return (
      <div className="w-full max-w-lg text-center py-10">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl text-destructive flex items-center justify-center gap-2">
              <AlertTriangle /> {t('classNotFoundTitle')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-6">{error}</p>
            <Button asChild>
              <Link href="/">{t('backToHomeButton')}</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  if (!classDetails) { 
     return (
      <div className="w-full max-w-lg text-center py-10">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl text-destructive">{t('classNotFoundTitle')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-6">{t('classNotFoundMessage')}</p>
            <Button asChild><Link href="/">{t('backToHomeButton')}</Link></Button>
          </CardContent>
        </Card>
      </div>
    );
  }


  const sectionsConfig: { titleKey: TranslationKey; events: SchoolEvent[]; icon: React.ElementType, emptyImageHint: string, isLoading: boolean }[] = [
    { titleKey: 'announcementsSectionTitle', events: announcements, icon: Megaphone, emptyImageHint: 'megaphone class empty', isLoading: isLoadingEvents },
    { titleKey: 'examsSectionTitle', events: exams, icon: BookOpenCheck, emptyImageHint: 'exam calendar class empty', isLoading: isLoadingEvents },
    { titleKey: 'deadlinesSectionTitle', events: deadlines, icon: FileText, emptyImageHint: 'deadline list class empty', isLoading: isLoadingEvents },
  ];

  const visibleClassSections = sectionsConfig.filter(section => section.events.length > 0 || section.isLoading);
  const noEventsForAllSections = !isLoadingEvents && announcements.length === 0 && exams.length === 0 && deadlines.length === 0;


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
            <Book className="h-10 w-10 text-primary" />
            <div>
              <CardTitle className="text-3xl font-bold text-primary">{classDetails.name}</CardTitle>
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

      {isLoadingEvents && visibleClassSections.length > 0 && (
         <div className="space-y-12">
          {sectionsConfig.map(section => ( 
            <div key={section.titleKey} className="w-full mb-12">
              <div className="flex items-center mb-6">
                <section.icon className="h-8 w-8 text-primary mr-3" />
                <h2 className="text-3xl font-semibold text-primary/90">{t(section.titleKey)}</h2>
              </div>
              <Skeleton className="h-64 w-full rounded-lg" />
            </div>
          ))}
        </div>
      )}

      {!isLoadingEvents && visibleClassSections.length > 0 && (
        visibleClassSections.map((section, index) => (
          (section.events.length > 0) && 
          <section key={section.titleKey} className="w-full mb-12">
            <div className="flex items-center mb-6">
              <section.icon className="h-8 w-8 text-primary mr-3" />
              <h2 className="text-3xl font-semibold text-primary/90">
                {t(section.titleKey)}
              </h2>
            </div>
            <KioskCarousel items={section.events} />
            {index < visibleClassSections.filter(s => s.events.length > 0).length - 1 && <Separator className="my-12" />}
          </section>
        ))
      )}
      
      {noEventsForAllSections && (
        <div className="text-center py-10 px-4 bg-card rounded-lg shadow-md">
          <p className="text-xl font-medium text-muted-foreground">{t('noEventsForClassHint')}</p>
          <p className="text-sm text-muted-foreground">{t('checkBackLaterHint')}</p>
        </div>
      )}
    </div>
  );
}
