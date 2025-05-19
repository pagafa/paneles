
import { KioskCarousel } from '@/components/kiosk/KioskCarousel';
import { mockSchoolEvents } from '@/lib/placeholder-data';
import type { SchoolEvent, Announcement, Exam, Deadline } from '@/types';
import Image from 'next/image';
import { AppLogo } from '@/components/common/AppLogo';
import { Separator } from '@/components/ui/separator';
import { Megaphone, BookOpenCheck, FileText } from 'lucide-react';

// Simulate fetching data
async function getSchoolEvents(): Promise<SchoolEvent[]> {
  // In a real app, this would fetch from an API
  return new Promise((resolve) => {
    setTimeout(() => {
      // Filter out past events for this example, adjust as needed
      resolve(mockSchoolEvents.filter(event => new Date(event.date) >= new Date(new Date().toDateString())));
    }, 500);
  });
}

export default async function KioskPage() {
  const allEvents = await getSchoolEvents();

  const announcements = allEvents.filter(event => event.type === 'announcement') as Announcement[];
  const exams = allEvents.filter(event => event.type === 'exam') as Exam[];
  const deadlines = allEvents.filter(event => event.type === 'deadline') as Deadline[];

  const sections: { title: string; events: SchoolEvent[]; icon: React.ElementType, emptyHint: string, emptyImageHint: string }[] = [
    { title: 'Announcements', events: announcements, icon: Megaphone, emptyHint: 'No current announcements.', emptyImageHint: 'megaphone empty' },
    { title: 'Upcoming Exams', events: exams, icon: BookOpenCheck, emptyHint: 'No upcoming exams scheduled.', emptyImageHint: 'exam calendar' },
    { title: 'Assignment Deadlines', events: deadlines, icon: FileText, emptyHint: 'No assignment deadlines approaching.', emptyImageHint: 'deadline list' },
  ];

  return (
    <div className="min-h-screen flex flex-col items-center p-4 sm:p-8 bg-gradient-to-br from-background to-secondary/30">
      <header className="w-full max-w-6xl mb-8 text-center">
        <div className="inline-block mb-4">
          <AppLogo />
        </div>
        <h1 className="text-4xl font-bold text-primary tracking-tight sm:text-5xl">
          Stay Informed
        </h1>
        <p className="mt-3 text-lg text-foreground/80 sm:text-xl">
          Latest school updates at your fingertips.
        </p>
      </header>

      <main className="w-full flex-grow flex flex-col items-center space-y-12">
        {sections.map((section, index) => (
          <section key={section.title} className="w-full max-w-4xl">
            <div className="flex items-center mb-6">
              <section.icon className="h-8 w-8 text-primary mr-3" />
              <h2 className="text-3xl font-semibold text-primary/90">{section.title}</h2>
            </div>
            {section.events.length > 0 ? (
              <KioskCarousel items={section.events} />
            ) : (
              <div className="text-center py-8 px-4 bg-card rounded-lg shadow-md">
                <Image 
                  src={`https://placehold.co/300x200.png`} 
                  alt={`No ${section.title.toLowerCase()}`}
                  width={200} 
                  height={133} 
                  className="mx-auto mb-4 rounded-lg shadow-sm"
                  data-ai-hint={section.emptyImageHint}
                />
                <p className="text-xl font-medium text-muted-foreground">{section.emptyHint}</p>
                <p className="text-sm text-muted-foreground">Please check back later for updates.</p>
              </div>
            )}
            {index < sections.length - 1 && <Separator className="my-12" />}
          </section>
        ))}
      </main>

      <footer className="w-full max-w-6xl mt-16 text-center">
        <p className="text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} School Announcements Central. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
