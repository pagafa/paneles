
"use client";

import { useEffect, useState, use, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';

// mockSchoolEvents and mockUsers are no longer the primary source for this page.
import type { SchoolClass, SchoolEvent, Announcement, Exam, Deadline, User } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { KioskCarousel } from '@/components/kiosk/KioskCarousel';
import { Separator } from '@/components/ui/separator';
import { Book, Megaphone, BookOpenCheck, FileText, Info, AlertTriangle } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import type { TranslationKey } from '@/lib/i18n';
import { Skeleton } from '@/components/ui/skeleton';

const sortEvents = (events: SchoolEvent[]) => {
  return [...events].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

// Fetch class details from API
async function getClassDetails(classId: string): Promise<SchoolClass | undefined> {
  try {
    const response = await fetch(`/api/classes/${classId}`);
    if (!response.ok) {
      if (response.status === 404) return undefined; // Class not found
      console.error(`Failed to fetch class details for ${classId}: ${response.status}`);
      throw new Error(`API error: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Error in getClassDetails for ${classId}:`, error);
    return undefined; // Treat as not found on network or parsing error
  }
}

// Fetch ALL school-wide announcements from API
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

// Fetch class-specific announcements from API
async function getClassSpecificAnnouncements(classId: string): Promise<Announcement[]> {
  try {
    const response = await fetch('/api/announcements'); // Fetch all, then filter. Could be an API param like /api/announcements?classId=...
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


// TODO: Implement API for class-specific exams and deadlines
// For now, these might be empty or use limited mock data.
// These should filter based on event.class === classDetails.name (if class name is reliable)
// or better, event.classId === classId
async function getClassExams(className: string): Promise<Exam[]> {
  // Placeholder: In a real app, fetch from `/api/schoolevents?type=exam&className=${className}`
  return [];
}

async function getClassDeadlines(className: string): Promise<Deadline[]> {
  // Placeholder: In a real app, fetch from `/api/schoolevents?type=deadline&className=${className}`
  return [];
}

// Fetch users to get delegate name
async function getUsers(): Promise<User[]> {
   // This should ideally fetch from /api/users, but for now, to avoid making ManageUsersPage API dependent first.
  // return new Promise((resolve) => setTimeout(() => resolve(mockUsers), 100));
  // For now, return empty array if mockUsers are not guaranteed to be up-to-date with DB.
  // The delegate name feature will rely on a proper /api/users endpoint eventually.
  // For now, let's assume we can fetch users for delegate display
  try {
    const response = await fetch('/api/users'); // Assuming /api/users is implemented
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
  const [isLoadingEvents, setIsLoadingEvents] = useState(true); // Combined loading for all event types
  const [error, setError] = useState<string | null>(null);

  const loading = isLoadingClassDetails || isLoadingEvents;

  const fetchData = useCallback(async () => {
    if (!classId) {
        setIsLoadingClassDetails(false);
        setIsLoadingEvents(false);
        setError(t('classNotFoundMessage')); // Or a more specific error
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
      
      // Fetch users for delegate name
      const usersData = await getUsers();
      setUsers(usersData);

      // Fetch events
      const [schoolWideAnns, classSpecificAnns, classExams, classDeadlines] = await Promise.all([
        getSchoolWideAnnouncements(),
        getClassSpecificAnnouncements(classId),
        getClassExams(details.name), // Assuming filter by name for now
        getClassDeadlines(details.name) // Assuming filter by name for now
      ]);
      
      const combinedAnnouncements = sortEvents([...schoolWideAnns, ...classSpecificAnns]);
      // Remove duplicates if any announcement is both school-wide and targeted (by ID)
      const uniqueAnnouncements = Array.from(new Map(combinedAnnouncements.map(ann => [ann.id, ann])).values());

      setAnnouncements(uniqueAnnouncements);
      setExams(sortEvents(classExams));
      setDeadlines(sortEvents(classDeadlines));

    } catch (err) {
      console.error("Error fetching data for class page:", err);
      setError((err as Error).message || "An unexpected error occurred");
      // Reset states on error
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

  if (error && !classDetails) { // Error occurred and no class details could be loaded
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
  
  if (!classDetails) { // Should be caught by error state above if initial fetch failed
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
              {/* Subtitle removed as per previous request */}
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
          {sectionsConfig.map(section => ( // Show skeletons for all potential sections during load
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
          section.events.length > 0 && // Only render section if it has events after loading
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
          {/* Image removed as per previous request */}
          <p className="text-xl font-medium text-muted-foreground">{t('noEventsForClassHint')}</p>
          <p className="text-sm text-muted-foreground">{t('checkBackLaterHint')}</p>
        </div>
      )}
    </div>
  );
}
