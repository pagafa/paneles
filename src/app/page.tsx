import { KioskCarousel } from '@/components/kiosk/KioskCarousel';
import { mockSchoolEvents } from '@/lib/placeholder-data';
import type { SchoolEvent } from '@/types';
import Image from 'next/image';
import { AppLogo } from '@/components/common/AppLogo';

// Simulate fetching data
async function getSchoolEvents(): Promise<SchoolEvent[]> {
  // In a real app, this would fetch from an API
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockSchoolEvents.filter(event => new Date(event.date) >= new Date())); // Filter out past events
    }, 500);
  });
}

export default async function KioskPage() {
  const events = await getSchoolEvents();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-8 bg-gradient-to-br from-background to-secondary/30">
      <header className="w-full max-w-4xl mb-8 text-center">
        <div className="inline-block mb-4">
          <AppLogo />
        </div>
        <h1 className="text-4xl font-bold text-primary tracking-tight sm:text-5xl">
          Stay Informed
        </h1>
        <p className="mt-3 text-lg text-foreground/80 sm:text-xl">
          Latest announcements, exam schedules, and assignment deadlines.
        </p>
      </header>

      <main className="w-full flex-grow flex items-center justify-center">
        {events.length > 0 ? (
          <KioskCarousel items={events} />
        ) : (
          <div className="text-center">
            <Image 
              src="https://placehold.co/300x200.png" 
              alt="No announcements" 
              width={300} 
              height={200} 
              className="mx-auto mb-4 rounded-lg shadow-md"
              data-ai-hint="empty state illustration" 
            />
            <p className="text-2xl font-semibold text-muted-foreground">No current announcements.</p>
            <p className="text-md text-muted-foreground">Please check back later for updates.</p>
          </div>
        )}
      </main>

      <footer className="w-full max-w-4xl mt-12 text-center">
        <p className="text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} School Announcements Central. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
