
"use client";

import type { SchoolEvent, Announcement, Exam, Deadline } from '@/types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { enUS, es, fr, gl } from 'date-fns/locale';
import { useState, useEffect } from 'react';
import { Edit3, Trash2, Megaphone, BookOpenCheck, FileText, CalendarOff } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

interface AnnouncementCardProps {
  item: SchoolEvent | Announcement; 
  onEdit?: (item: SchoolEvent | Announcement) => void;
  onDeleteRequest?: (item: SchoolEvent | Announcement) => void;
  showDelegateActions?: boolean;
  showTypeIcon?: boolean;
  isPastEvent?: boolean; // New prop
}

export function AnnouncementCard({ 
  item, 
  onEdit, 
  onDeleteRequest, 
  showDelegateActions = false, 
  showTypeIcon = false,
  isPastEvent = false // Default to false
}: AnnouncementCardProps) {
  const [formattedDate, setFormattedDate] = useState<string>("Loading date...");
  const { language, t } = useLanguage();

  const getLocaleObject = () => {
    switch (language) {
      case 'es': return es;
      case 'fr': return fr;
      case 'gl': return gl;
      case 'en':
      default: return enUS;
    }
  };

  useEffect(() => {
    try {
      setFormattedDate(format(new Date(item.date), 'PPP HH:mm', { locale: getLocaleObject() }));
    } catch (error) {
      console.error("Error formatting date:", item.date, error);
      setFormattedDate("Invalid Date");
    }
  }, [item.date, language]);

  let displayContentOrSubject = "";
  
  if (item.type === 'announcement') {
    if ('content' in item && typeof item.content === 'string') {
      displayContentOrSubject = item.content;
    }
  } else if (item.type === 'exam') {
    displayContentOrSubject = `${t('formExamSubjectLabel')}: ${(item as Exam).subject}`;
  } else if (item.type === 'deadline') {
    displayContentOrSubject = `${t('formDeadlineAssignmentNameLabel')}: ${(item as Deadline).assignmentName}`;
  }
  
  const TypeSpecificIcon =
    item.type === 'announcement' ? Megaphone :
    item.type === 'exam' ? BookOpenCheck :
    item.type === 'deadline' ? FileText : null;

  return (
    <Card className="w-full shadow-lg hover:shadow-xl transition-shadow duration-300 bg-card">
      <CardHeader className="pb-3 pt-4">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            {showTypeIcon && TypeSpecificIcon && (
              <TypeSpecificIcon className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" aria-label={item.type} />
            )}
            <CardTitle className="text-xl font-semibold flex items-center">
              {item.title}
              {isPastEvent && (
                <CalendarOff className="h-4 w-4 text-muted-foreground ml-2" aria-label={t('pastEventIndicatorLabel')} />
              )}
            </CardTitle>
          </div>
          {showDelegateActions && onEdit && onDeleteRequest && (
            <div className="flex gap-2">
              <Button variant="outline" size="icon" onClick={() => onEdit(item)} aria-label={t('editButtonLabel') || "Edit Submission"}>
                <Edit3 className="h-4 w-4" />
              </Button>
              <Button variant="destructive" size="icon" onClick={() => onDeleteRequest(item)} aria-label={t('deleteButtonLabel') || "Delete Submission"}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-lg text-foreground/90 mb-2">{displayContentOrSubject}</p>
        {item.description && <p className="text-sm text-muted-foreground mb-2">{item.description}</p>}
        <p className="text-sm text-muted-foreground mt-2">
          {formattedDate}
        </p>
      </CardContent>
    </Card>
  );
}
