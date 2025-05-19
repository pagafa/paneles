
import type { SchoolEvent, User, SchoolClass, Announcement, Exam, Deadline } from '@/types';

// mockAnnouncements is now managed by announcements.db and API routes.
// Leaving this commented out for reference or if easy restoration is needed.
/*
export const mockAnnouncements: Announcement[] = [
  {
    id: 'ann1',
    title: 'School Reopens Monday!',
    date: new Date(new Date().setDate(new Date().getDate() + 3)).toISOString(),
    type: 'announcement',
    content: 'Welcome back everyone! School reopens this Monday. Please check the updated schedule on the notice board.',
    targetClassIds: [], // School-wide
  },
  // ... other mock announcements
].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
*/

// mockClasses will be seeded into classes.db on first DB creation.
// It can still be used for components that haven't been migrated to API fetching for class lists yet.
export const mockClasses: SchoolClass[] = [
  { id: 'class1', name: 'Grade 10A', delegateId: 'user2' },
  { id: 'class2', name: 'Grade 10B' },
  { id: 'class3', name: 'Grade 11C', delegateId: 'user3' },
  { id: 'class4', name: 'Grade 12B' },
];

// mockUsers will be seeded into users.db on first DB creation.
// Still used directly by ClassForm for availableDelegates and DelegateDashboardPage for initial delegate info.
// These will need to be updated to fetch from /api/users.
export const mockUsers: User[] = [
  { id: 'user1', name: 'Admin User', username: 'admin_user', role: 'admin' },
  { id: 'user2', name: 'John Delegate', username: 'john_delegate', role: 'delegate' },
  { id: 'user3', name: 'Jane Delegate', username: 'jane_delegate', role: 'delegate' },
];


// mockSchoolEvents will be seeded into schoolevents.db (for delegate submissions)
// Admin announcements come from announcements.db
// Kiosk and PublicClass pages will need to fetch from multiple API endpoints or a combined one.
const exampleAnnouncementsForKiosk: Announcement[] = [
    {
    id: 'kiosk-ann1',
    title: 'Welcome to Our School Portal!',
    date: new Date(new Date().setDate(new Date().getDate() + 1)).toISOString(),
    type: 'announcement',
    content: 'Find all your school news and updates here.',
    targetClassIds: [], 
  },
   {
    id: 'kiosk-ann2',
    title: 'Library Books Due',
    date: new Date(new Date().setDate(new Date().getDate() + 2)).toISOString(),
    type: 'announcement',
    content: 'Remember to return your library books by Friday.',
    targetClassIds: ['class1'], // Example of a targeted announcement that might also appear on Kiosk if logic allows
  }
];


export const mockExams: Exam[] = [
  {
    id: 'exam1',
    title: 'Mathematics Mid-Term Exam',
    date: new Date(new Date().setDate(new Date().getDate() + 10)).toISOString(),
    type: 'exam',
    subject: 'Mathematics',
    class: 'Grade 10A', // This 'class' field (name) will be used by Delegate submissions
  },
  {
    id: 'exam2',
    title: 'Science Final Exam',
    date: new Date(new Date().setDate(new Date().getDate() + 14)).toISOString(),
    type: 'exam',
    subject: 'Science',
    class: 'Grade 12B',
  },
];

export const mockDeadlines: Deadline[] = [
  {
    id: 'dead1',
    title: 'History Essay Submission',
    date: new Date(new Date().setDate(new Date().getDate() + 5)).toISOString(),
    type: 'deadline',
    assignmentName: 'World War II Essay',
    class: 'Grade 11C',
  },
  {
    id: 'dead2',
    title: 'Art Project Deadline',
    date: new Date(new Date().setDate(new Date().getDate() + 9)).toISOString(),
    type: 'deadline',
    assignmentName: 'Modern Art Sculpture',
    // class: undefined, // Example of a general deadline if applicable
  },
];

// This composite mockSchoolEvents is used for seeding schoolevents.db (delegate-type events)
// and potentially by Kiosk/PublicClass pages until they fully fetch from distinct API endpoints.
// Admin announcements (school-wide or targeted) are now primarily managed via announcements.db and its API.
export const mockSchoolEvents: SchoolEvent[] = [
  ...exampleAnnouncementsForKiosk, 
  ...mockExams,
  ...mockDeadlines,
].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
