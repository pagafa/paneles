
"use client";

import type { SchoolEvent, Announcement, Exam, Deadline } from '@/types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { enUS, es, fr, gl } from 'date-fns/locale'; // Import locales
import { useState, useEffect } from 'react';
import { Megaphone, BookOpenCheck, FileText, Edit3, Trash2 } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext'; // Import useLanguage

interface AnnouncementCardProps {
  item: SchoolEvent;
  onEdit?: (item: SchoolEvent) => void;
  onDeleteRequest?: (item: SchoolEvent) => void;
  showDelegateActions?: boolean;
  showTypeIcon?: boolean;
}

export function AnnouncementCard({ item, onEdit, onDeleteRequest, showDelegateActions = false, showTypeIcon = false }: AnnouncementCardProps) {
  const [formattedDate, setFormattedDate] = useState<string>("Loading date...");
  const { language } = useLanguage(); // Get current language

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
  }, [item.date, language]); // Add language to dependency array

  const TypeSpecificIcon =
    item.type === 'announcement' ? Megaphone :
    item.type === 'exam' ? BookOpenCheck :
    item.type === 'deadline' ? FileText : null;

  return (
    <Card className="w-full shadow-lg hover:shadow-xl transition-shadow duration-300 bg-card">
      <CardHeader className="pb-3 pt-4">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            {showTypeIcon && TypeSpecificIcon && (
              <TypeSpecificIcon className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-1" aria-label={item.type} />
            )}
            <CardTitle className="text-xl font-semibold">{item.title}</CardTitle>
          </div>
          {showDelegateActions && onEdit && onDeleteRequest && (
            <div className="flex gap-2">
              <Button variant="outline" size="icon" onClick={() => onEdit(item)} aria-label="Edit Submission">
                <Edit3 className="h-4 w-4" />
              </Button>
              <Button variant="destructive" size="icon" onClick={() => onDeleteRequest(item)} aria-label="Delete Submission">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {item.type === 'announcement' && <p className="text-lg text-foreground/90 mb-2">{(item as Announcement).content}</p>}
        {item.type === 'exam' && <p className="text-lg text-foreground/90 mb-2">Subject: {(item as Exam).subject}</p>}
        {item.type === 'deadline' && <p className="text-lg text-foreground/90 mb-2">Assignment: {(item as Deadline).assignmentName}</p>}
        
        {item.description && <p className="text-sm text-muted-foreground mb-2">{item.description}</p>}
        
        <p className="text-sm text-muted-foreground mt-2">
          {formattedDate}
        </p>
      </CardContent>
    </Card>
  );
}
