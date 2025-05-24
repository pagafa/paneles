
"use client";

import { useEffect, useState, use, useCallback } from 'react';
import Link from 'next/link';

import type { SchoolEvent, Announcement, Exam, Deadline, User, SchoolClass } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { KioskCarousel } from '@/components/kiosk/KioskCarousel';
import { Separator } from '@/components/ui/separator';
import { Book, Megaphone, BookOpenCheck, FileText, AlertTriangle } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import type { TranslationKey } from '@/lib/i18n';
import { Skeleton } from '@/components/ui/skeleton';

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

// Gets Admin announcements specifically targeted to this class
async function getClassSpecificAdminAnnouncements(classId: string): Promise<Announcement[]> {
  try {
    const response = await fetch('/api/announcements');
    if (!response.ok) {
        console.error("Failed to fetch admin announcements for class page", response.status, await response.text().catch(() => ""));
        return [];
    }
    const allAdminAnnouncements: Announcement[] = await response.json();
    // Filter for announcements that target this classId
    return allAdminAnnouncements.filter(ann => ann.targetClassIds && ann.targetClassIds.includes(classId));
  } catch (error) {
    console.error(`Error fetching admin announcements for ${classId}:`, error);
    return [];
  }
}

// Gets Delegate-submitted announcements for this class
async function getClassDelegateAnnouncements(classId: string): Promise<SchoolEvent[]> {
  try {
    const response = await fetch(`/api/schoolevents?type=announcement&classId=${classId}`);
    if (!response.ok) {
      console.error("Failed to fetch delegate announcements for class:", classId, response.status, await response.text().catch(() => ""));
      return [];
    }
    const data = await response.json();
    return data.filter((event: SchoolEvent) => event.type === 'announcement' && event.classId === classId);
  } catch (error) {
    console.error(`Error fetching delegate announcements for ${classId}:`, error);
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
    const data = await response.json();
    return data.filter((event: SchoolEvent): event is Exam => event.type === 'exam' && event.classId === classId);
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
    const data = await response.json();
    return data.filter((event: SchoolEvent): event is Deadline => event.type === 'deadline' && event.classId === classId);
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

const sortEvents = <T extends SchoolEvent | Announcement>(events: T[]): T[] => {
  return [...events].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

const filterUpcomingEvents = <T extends SchoolEvent | Announcement>(events: T[]): T[] => {
  const now = new Date();
  return events.filter(event => new Date(event.date) >= now);
};

export default function PublicClassPage({ params: paramsPromise }: { params: Promise<{ classId: string }> }) {
  const actualParams = use(paramsPromise);
  const { classId } = actualParams;
  const { t } = useLanguage();

  const [classDetails, setClassDetails] = useState<SchoolClass | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [announcements, setAnnouncements] = useState<(Announcement | SchoolEvent)[]>([]);
  const [exams, setExams] = useState<SchoolEvent[]>([]);
  const [deadlines, setDeadlines] = useState<SchoolEvent[]>([]);

  const [isLoadingClassDetails, setIsLoadingClassDetails] = useState(true);
  const [isLoadingEvents, setIsLoadingEvents] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchClassPageData = useCallback(async () => {
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
      setClassDetails(details || null); // Ensure it's null if undefined
      setIsLoadingClassDetails(false);

      if (!details || details.isHidden) {
        setError(t('classNotFoundMessage'));
        setIsLoadingEvents(false);
        return;
      }

      // Class exists and is not hidden
      const usersData = await getUsers();
      setUsers(usersData);

      const [
        adminAnnouncementsForClass,
        delegateAnnouncementsForClass,
        classExamsData,
        classDeadlinesData
      ] = await Promise.all([
        getClassSpecificAdminAnnouncements(classId),
        getClassDelegateAnnouncements(classId),
        getClassExams(classId),
        getClassDeadlines(classId)
      ]);
      
      const combinedAnnouncements: (Announcement | SchoolEvent)[] = [...adminAnnouncementsForClass, ...delegateAnnouncementsForClass];
      setAnnouncements(filterUpcomingEvents(sortEvents(combinedAnnouncements)));
      setExams(filterUpcomingEvents(sortEvents(classExamsData)));
      setDeadlines(filterUpcomingEvents(sortEvents(classDeadlinesData)));
      
    } catch (err) {
      console.error("Error fetching data for class page:", err);
      setError((err as Error).message || t('errorDialogTitle'));
      setClassDetails(null);
    } finally {
        setIsLoadingClassDetails(false); // Ensure this is always set
        setIsLoadingEvents(false);
    }
  }, [classId, t]);

  useEffect(() => {
    fetchClassPageData();
  }, [fetchClassPageData]);

  if (isLoadingClassDetails) {
    return (
      <div className="w-full max-w-4xl py-8 space-y-8">
        <Skeleton className="h-24 w-full rounded-lg" />
        <Skeleton className="h-64 w-full rounded-lg" />
        <Skeleton className="h-64 w-full rounded-lg" />
      </div>
    );
  }

  if (error || !classDetails) {
    return (
      <div className="w-full max-w-lg text-center py-10">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl text-destructive flex items-center justify-center gap-2">
              <AlertTriangle /> {t('classNotFoundTitle')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-6">{error || t('classNotFoundMessage')}</p>
            <Button asChild>
              <Link href="/">{t('backToHomeButton')}</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  // Class exists and is publicly accessible
  const sectionsConfig: { titleKey: TranslationKey; events: (Announcement | SchoolEvent)[]; icon: React.ElementType; isLoading: boolean }[] = [
    { titleKey: 'announcementsSectionTitle', events: announcements, icon: Megaphone, isLoading: isLoadingEvents },
    { titleKey: 'examsSectionTitle', events: exams, icon: BookOpenCheck, isLoading: isLoadingEvents },
    { titleKey: 'deadlinesSectionTitle', events: deadlines, icon: FileText, isLoading: isLoadingEvents },
  ];

  const visibleClassSections = sectionsConfig.filter(section => section.isLoading || section.events.length > 0);
  const noEventsForAllSections = !isLoadingEvents && announcements.length === 0 && exams.length === 0 && deadlines.length === 0;

  let delegateNameDisplay = t('noDelegateOption');
  if (classDetails.delegateId) {
    const delegateUser = users.find(u => u.id === classDetails.delegateId && u.role === 'delegate');
    if (delegateUser) {
      delegateNameDisplay = delegateUser.name;
    } else if (isLoadingEvents && !users.length) { 
        delegateNameDisplay = t('loadingLabel');
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
                    {t('classDelegateLabel')}: {delegateNameDisplay}
                 </p>
             </CardContent>
        )}
      </Card>

      {isLoadingEvents && ( 
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
          <p className="text-xl font-medium text-muted-foreground">{t('noEventsForClassHint', { className: classDetails.name })}</p>
          <p className="text-sm text-muted-foreground">{t('checkBackLaterHint')}</p>
        </div>
      )}
    </div>
  );
}
