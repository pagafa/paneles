
"use client"; 

import type { SchoolClass, Announcement, SchoolEvent } from '@/types';
import { Activity } from 'lucide-react'; 
import { Card, CardContent } from '@/components/ui/card'; 
import { Badge } from '@/components/ui/badge'; 
import { useLanguage } from '@/context/LanguageContext'; 
import { useEffect, useState, useCallback } from 'react';
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
          // Count admin announcements targeted to this class
          allAdminAnnouncementsData.forEach(ann => {
            if (ann.targetClassIds && ann.targetClassIds.includes(cls.id)) {
              count++;
            }
            // Also count school-wide admin announcements for every class for simplicity in this view
            if (!ann.targetClassIds || ann.targetClassIds.length === 0) {
                count++;
            }
          });
          // Count school events (exams, deadlines, delegate announcements) for this class
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
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);


  if (isLoadingClasses && isLoadingClassCounts) { 
    return (
      // The KioskPage is now a direct child of RootLayout's <main>
      // The PublicLayout provides padding, so no need for full screen centering here directly
      <div className="w-full max-w-4xl mx-auto py-8">
        <Skeleton className="h-10 w-48 mb-4" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    // KioskPage content no longer needs to define its own nav, as GlobalHeader handles it
    // The outer div of PublicLayout handles padding and centering.
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
  );
}
