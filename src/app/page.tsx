
"use client";

import type { SchoolClass, Announcement, SchoolEvent, Exam, Deadline } from '@/types';
import { Activity } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/context/LanguageContext';
import { useEffect, useState, useCallback } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

// Obter datos das clases
async function getClassesData(): Promise<SchoolClass[]> {
  try {
    const response = await fetch('/api/classes');
    if (!response.ok) {
      console.error("Failed to fetch classes for Kiosk", response.status, await response.text().catch(() => ""));
      return [];
    }
    const allClasses: SchoolClass[] = await response.json();
    // Filtrar clases ocultas
    return allClasses.filter(cls => !cls.isHidden).sort((a, b) => a.name.localeCompare(b.name));
  } catch (error) {
    console.error('Error fetching classes for Kiosk:', error);
    return [];
  }
}

// Obter todos os anuncios do administrador
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

// Obter TODOS os eventos escolares
async function getAllSchoolEventsData(): Promise<SchoolEvent[]> {
  try {
    const response = await fetch('/api/schoolevents');
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
  const [visibleClasses, setVisibleClasses] = useState<SchoolClass[]>([]);
  const [isLoadingClasses, setIsLoadingClasses] = useState(true);

  const [classMessageCounts, setClassMessageCounts] = useState<{ [classId: string]: number }>({});
  const [isLoadingClassCounts, setIsLoadingClassCounts] = useState(true);


  const fetchData = useCallback(async () => {
    setIsLoadingClasses(true);
    setIsLoadingClassCounts(true);

    try {
      const [
        classesData, // Xa filtradas para excluír as ocultas
        allAdminAnnouncementsData,
        allSchoolEventsForCountsData,
      ] = await Promise.all([
        getClassesData(),
        getAllAdminAnnouncements(),
        getAllSchoolEventsData(),
      ]);

      setVisibleClasses(classesData);
      setIsLoadingClasses(false);

      const counts: { [classId: string]: number } = {};
      if (classesData.length > 0) { // Usar classesData (xa filtradas)
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
      // Considerar mostrar un erro na UI
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);


  if (isLoadingClasses && isLoadingClassCounts) {
    return (
      <div className="w-full max-w-4xl mx-auto py-8">
        <Skeleton className="h-10 w-48 mb-4" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <section className="w-full max-w-4xl mx-auto py-8">
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
      ) : visibleClasses.length > 0 ? ( // Usar visibleClasses
        <Card className="shadow-md">
          <CardContent className="pt-6">
            {Object.keys(classMessageCounts).length > 0 ? (
              <ul className="space-y-3">
                {visibleClasses.map((cls) => ( // Usar visibleClasses
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
