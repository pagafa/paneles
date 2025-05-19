
"use client";

import type { SchoolEvent, Announcement, Exam, Deadline } from '@/types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Megaphone, BookOpenCheck, FileText, CalendarDays } from 'lucide-react';
import { format } from 'date-fns';
import { useState, useEffect } from 'react';

interface AnnouncementCardProps {
  item: SchoolEvent;
}

const IconMap: Record<SchoolEvent['type'], React.ElementType> = {
  announcement: Megaphone,
  exam: BookOpenCheck,
  deadline: FileText,
};

export function AnnouncementCard({ item }: AnnouncementCardProps) {
  const Icon = IconMap[item.type] || CalendarDays;
  const [formattedDate, setFormattedDate] = useState<string>("Loading date...");

  useEffect(() => {
    try {
      setFormattedDate(format(new Date(item.date), 'PPP p'));
    } catch (error) {
      setFormattedDate("Invalid Date");
    }
  }, [item.date]);

  return (
    <Card className="w-full shadow-lg hover:shadow-xl transition-shadow duration-300 bg-card">
      <CardHeader className="flex flex-row items-center gap-4 pb-2">
        <Icon className="h-8 w-8 text-primary" aria-hidden="true" />
        <div>
          <CardTitle className="text-xl font-semibold text-primary-foreground">{item.title}</CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            {formattedDate}
            {item.type === 'exam' && (item as Exam).class && ` - Class: ${(item as Exam).class}`}
            {item.type === 'deadline' && (item as Deadline).class && ` - Class: ${(item as Deadline).class}`}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        {item.type === 'announcement' && <p className="text-foreground/90">{(item as Announcement).content}</p>}
        {item.type === 'exam' && <p className="text-foreground/90">Subject: {(item as Exam).subject}</p>}
        {item.type === 'deadline' && <p className="text-foreground/90">Assignment: {(item as Deadline).assignmentName}</p>}
        {item.description && <p className="mt-2 text-sm text-muted-foreground">{item.description}</p>}
      </CardContent>
    </Card>
  );
}
