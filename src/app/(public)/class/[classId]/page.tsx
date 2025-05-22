
"use client";

import { useEffect, useState, use, useCallback } from 'react';
import Link from 'next/link';

import type { SchoolEvent, Announcement, Exam, Deadline, User } from "@/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { KioskCarousel } from '@/components/kiosk/KioskCarousel';
import { Separator } from '@/components/ui/separator';
import { Book, Megaphone, BookOpenCheck, FileText, AlertTriangle, KeyRound, Unlock } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import type { TranslationKey } from '@/lib/i18n';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';


interface ClassPageDetailsData extends Omit<SchoolClass, 'password'> {
  passwordProtected: boolean;
}

const sortEvents = <T extends SchoolEvent | Announcement>(events: T[]): T[] => {
  return [...events].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

const filterUpcomingEvents = <T extends SchoolEvent | Announcement>(events: T[]): T[] => {
  const now = new Date();
  return events.filter(event => new Date(event.date) >= now);
};

async function getClassDetails(classId: string): Promise<ClassPageDetailsData | undefined> {
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
async function getClassAdminAnnouncements(classId: string): Promise<Announcement[]> {
  try {
    const response = await fetch('/api/announcements');
    if (!response.ok) {
        console.error("Failed to fetch admin announcements for class page", response.status, await response.text().catch(() => ""));
        return [];
    }
    const allAdminAnnouncements: Announcement[] = await response.json();
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
    return data.filter((event: any) => event.type === 'announcement' && event.classId === classId);
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
    return data.filter((event: SchoolEvent) => event.type === 'exam') as Exam[];
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
    return data.filter((event: SchoolEvent) => event.type === 'deadline') as Deadline[];
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

  const [classDetails, setClassDetails] = useState<ClassPageDetailsData | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [announcements, setAnnouncements] = useState<(Announcement | SchoolEvent)[]>([]);
  const [exams, setExams] = useState<SchoolEvent[]>([]);
  const [deadlines, setDeadlines] = useState<SchoolEvent[]>([]);

  const [isLoadingClassDetails, setIsLoadingClassDetails] = useState(true);
  const [isLoadingEvents, setIsLoadingEvents] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isClassUnlockedThisVisit, setIsClassUnlockedThisVisit] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [isVerifyingPassword, setIsVerifyingPassword] = useState(false);


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
    setPasswordError(null);

    try {
      const details = await getClassDetails(classId);
      setClassDetails(details);
      setIsLoadingClassDetails(false);

      if (!details) {
        setError(t('classNotFoundMessage'));
        setIsLoadingEvents(false);
        return;
      }

      if (!details.passwordProtected || isClassUnlockedThisVisit) {
        const usersData = await getUsers();
        setUsers(usersData);

        const [
          adminAnnouncementsForClass,
          delegateAnnouncementsForClass,
          classExamsData,
          classDeadlinesData
        ] = await Promise.all([
          getClassAdminAnnouncements(classId),
          getClassDelegateAnnouncements(classId),
          getClassExams(classId),
          getClassDeadlines(classId)
        ]);
        
        const combinedAnnouncements: (Announcement | SchoolEvent)[] = [...adminAnnouncementsForClass, ...delegateAnnouncementsForClass];
        setAnnouncements(filterUpcomingEvents(sortEvents(combinedAnnouncements)));
        setExams(filterUpcomingEvents(sortEvents(classExamsData)));
        setDeadlines(filterUpcomingEvents(sortEvents(classDeadlinesData)));
        setIsLoadingEvents(false);
      } else {
        setIsLoadingEvents(false); // If password protected and not unlocked, don't load events yet
      }

    } catch (err) {
      console.error("Error fetching data for class page:", err);
      setError((err as Error).message || "An unexpected error occurred");
      setClassDetails(null);
      setIsLoadingClassDetails(false);
      setIsLoadingEvents(false);
    }
  }, [classId, t, isClassUnlockedThisVisit]);

  useEffect(() => {
    fetchClassPageData();
  }, [fetchClassPageData]); // fetchClassPageData will re-run if isClassUnlockedThisVisit changes

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!classDetails || !classId) return;

    setIsVerifyingPassword(true);
    setPasswordError(null);

    try {
      const response = await fetch(`/api/classes/${classId}/verify-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: passwordInput }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || t('classPasswordVerificationError'));
      }

      if (result.verified) {
        setIsClassUnlockedThisVisit(true); // This will trigger fetchClassPageData to re-run
      } else {
        setPasswordError(t('classPasswordIncorrectError'));
      }
    } catch (err) {
      setPasswordError((err as Error).message);
    } finally {
      setIsVerifyingPassword(false);
      setPasswordInput(''); // Clear password input after attempt
    }
  };

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
  
  if (!classDetails) { // Fallback if error didn't set and details are still null
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

  if (classDetails.passwordProtected && !isClassUnlockedThisVisit) {
    return (
      <div className="w-full max-w-md mx-auto py-12">
        <Card className="shadow-xl">
          <CardHeader className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-primary/10 mb-4">
                <KeyRound className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-2xl">{t('classPasswordPromptTitle')}</CardTitle>
            <CardDescription>{t('classPasswordPromptDescription', { className: classDetails.name })}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <Label htmlFor="classPassword">{t('classPasswordInputLabel')}</Label>
                <Input
                  id="classPassword"
                  type="password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  className="mt-1"
                  required
                />
              </div>
              {passwordError && <p className="text-sm text-destructive">{passwordError}</p>}
              <Button type="submit" className="w-full" disabled={isVerifyingPassword}>
                {isVerifyingPassword ? t('loadingLabel') : t('classPasswordUnlockButton')}
                {!isVerifyingPassword && <Unlock className="ml-2 h-4 w-4" />}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Only show content if class is not password protected OR if it is and has been unlocked
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
          <p className="text-xl font-medium text-muted-foreground">{t('noEventsForClassHint', { className: classDetails.name })}</p>
          <p className="text-sm text-muted-foreground">{t('checkBackLaterHint')}</p>
        </div>
      )}
    </div>
  );
}
