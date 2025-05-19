
"use client";

import type { SchoolEvent, Announcement, Exam, Deadline } from '@/types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { useState, useEffect } from 'react';
import { Megaphone, BookOpenCheck, FileText, Edit3, Trash2 } from 'lucide-react';

interface AnnouncementCardProps {
  item: SchoolEvent;
  onEdit?: (item: SchoolEvent) => void;
  onDeleteRequest?: (item: SchoolEvent) => void;
  showDelegateActions?: boolean;
  showTypeIcon?: boolean; // New prop
}

export function AnnouncementCard({ item, onEdit, onDeleteRequest, showDelegateActions = false, showTypeIcon = false }: AnnouncementCardProps) {
  const [formattedDate, setFormattedDate] = useState<string>("Loading date...");

  useEffect(() => {
    try {
      // Display date in HH:mm format (24-hour)
      setFormattedDate(format(new Date(item.date), 'PPP HH:mm'));
    } catch (error) {
      console.error("Error formatting date:", item.date, error);
      setFormattedDate("Invalid Date");
    }
  }, [item.date]);

  const TypeSpecificIcon =
    item.type === 'announcement' ? Megaphone :
    item.type === 'exam' ? BookOpenCheck :
    item.type === 'deadline' ? FileText : null;

  return (
    <Card className="w-full shadow-lg hover:shadow-xl transition-shadow duration-300 bg-card">
      <CardHeader className="pb-3 pt-4 flex flex-row justify-between items-start">
        <div className="flex items-center gap-2"> {/* Ensure icon and title are grouped and aligned */}
          {showTypeIcon && TypeSpecificIcon && (
            <TypeSpecificIcon className="h-5 w-5 text-muted-foreground flex-shrink-0" aria-label={item.type} />
          )}
          <CardTitle className="text-xl font-semibold text-primary-foreground">{item.title}</CardTitle>
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
      </CardHeader>
      <CardContent className="pt-0">
        {item.type === 'announcement' && <p className="text-base text-foreground/90 mb-2">{(item as Announcement).content}</p>}
        {item.type === 'exam' && <p className="text-base text-foreground/90 mb-2">Subject: {(item as Exam).subject}</p>}
        {item.type === 'deadline' && <p className="text-base text-foreground/90 mb-2">Assignment: {(item as Deadline).assignmentName}</p>}
        
        {item.description && <p className="text-sm text-muted-foreground mb-2">{item.description}</p>}
        
        <p className="text-sm text-muted-foreground">
          {formattedDate}
          {item.class && ` - Class: ${item.class}`}
        </p>
      </CardContent>
    </Card>
  );
}
