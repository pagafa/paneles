
import type { SchoolEvent, User, SchoolClass, Announcement, Exam, Deadline } from '@/types';

// mockAnnouncements is now managed by announcements.data.json and API routes.
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
  {
    id: 'ann2',
    title: 'Annual Sports Day Next Week',
    date: new Date(new Date().setDate(new Date().getDate() + 7)).toISOString(),
    type: 'announcement',
    content: 'Get ready for the Annual Sports Day! Events will be held throughout next week. Sign up for your favorite sports.',
    targetClassIds: [], // School-wide
  },
  {
    id: 'ann3',
    title: 'Special Meeting for Grade 10A',
    date: new Date(new Date().setDate(new Date().getDate() + 4)).toISOString(),
    type: 'announcement',
    content: 'There will be a special meeting for all students of Grade 10A regarding the upcoming science fair.',
    targetClassIds: ['class1'] // Assuming 'class1' is Grade 10A
  },
].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
*/

// For mockSchoolEvents, we need to ensure it still has some announcements if other parts of the app use it directly.
// Ideally, those parts would also fetch from an API. For now, let's create a placeholder that might be empty
// or include some very basic examples if needed elsewhere. Or, if no other part relies on mockAnnouncements,
// this can be simplified.

// Let's assume mockSchoolEvents is still needed for other parts (Kiosk, Class pages) for now.
// We'll reconstruct it without relying on the old mockAnnouncements variable directly.
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
    targetClassIds: ['class1'],
  }
];


export const mockExams: Exam[] = [
  {
    id: 'exam1',
    title: 'Mathematics Mid-Term Exam',
    date: new Date(new Date().setDate(new Date().getDate() + 10)).toISOString(),
    type: 'exam',
    subject: 'Mathematics',
    class: 'Grade 10A',
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
  },
];

export const mockSchoolEvents: SchoolEvent[] = [
  ...exampleAnnouncementsForKiosk, // Use the new example announcements for parts still using mockSchoolEvents
  ...mockExams,
  ...mockDeadlines,
].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());


export const mockUsers: User[] = [
  { id: 'user1', name: 'Admin User', username: 'admin_user', role: 'admin' },
  { id: 'user2', name: 'John Delegate', username: 'john_delegate', role: 'delegate' },
  { id: 'user3', name: 'Jane Delegate', username: 'jane_delegate', role: 'delegate' },
];

export const mockClasses: SchoolClass[] = [
  { id: 'class1', name: 'Grade 10A', delegateId: 'user2' },
  { id: 'class2', name: 'Grade 10B' },
  { id: 'class3', name: 'Grade 11C', delegateId: 'user3' },
  { id: 'class4', name: 'Grade 12B' },
];
