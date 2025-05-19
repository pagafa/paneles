
"use client";

import type { SchoolEvent, Announcement, Exam, Deadline } from '@/types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
// import { Megaphone, BookOpenCheck, FileText, CalendarDays } from 'lucide-react'; // Icons no longer used here
import { format } from 'date-fns';
import { useState, useEffect } from 'react';

interface AnnouncementCardProps {
  item: SchoolEvent;
}

// IconMap no longer needed as icons are removed from the card itself
// const IconMap: Record<SchoolEvent['type'], React.ElementType> = {
//   announcement: Megaphone,
//   exam: BookOpenCheck,
//   deadline: FileText,
// };

export function AnnouncementCard({ item }: AnnouncementCardProps) {
  // const Icon = IconMap[item.type] || CalendarDays; // Icon no longer used
  const [formattedDate, setFormattedDate] = useState<string>("Loading date...");

  useEffect(() => {
    // This useEffect is to prevent hydration errors by ensuring date formatting happens client-side
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
      <CardHeader className="pb-2">
        {/* Icon removed from here */}
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
