
"use client";

import type { SchoolEvent, Announcement, Exam, Deadline } from '@/types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { format } from 'date-fns';
import { useState, useEffect } from 'react';

interface AnnouncementCardProps {
  item: SchoolEvent;
}

export function AnnouncementCard({ item }: AnnouncementCardProps) {
  const [formattedDate, setFormattedDate] = useState<string>("Loading date...");

  useEffect(() => {
    if (item.date) {
      try {
        setFormattedDate(format(new Date(item.date), 'PPP p'));
      } catch (error) {
        console.error("Error formatting date:", item.date, error);
        setFormattedDate("Invalid Date");
      }
    } else {
      setFormattedDate("Date not available");
    }
  }, [item.date]);

  return (
    <Card className="w-full shadow-lg hover:shadow-xl transition-shadow duration-300 bg-card">
      <CardHeader className="pb-3 pt-4"> {/* Adjusted padding */}
        <CardTitle className="text-xl font-semibold text-primary-foreground">{item.title}</CardTitle>
      </CardHeader>
      <CardContent className="pt-0"> {/* Adjusted padding */}
        {item.type === 'announcement' && <p className="text-base text-foreground/90 mb-2">{(item as Announcement).content}</p>}
        {item.type === 'exam' && <p className="text-base text-foreground/90 mb-2">Subject: {(item as Exam).subject}</p>}
        {item.type === 'deadline' && <p className="text-base text-foreground/90 mb-2">Assignment: {(item as Deadline).assignmentName}</p>}
        
        {item.description && <p className="text-sm text-muted-foreground mb-2">{item.description}</p>}
        
        <p className="text-sm text-muted-foreground">
          {formattedDate}
          {item.type === 'exam' && (item as Exam).class && ` - Class: ${(item as Exam).class}`}
          {item.type === 'deadline' && (item as Deadline).class && ` - Class: ${(item as Deadline).class}`}
        </p>
      </CardContent>
    </Card>
  );
}
