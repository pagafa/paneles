
import type { SchoolEvent, User, SchoolClass, Announcement, Exam, Deadline } from '@/types';

// mockClasses will be seeded into classes.db on first DB creation.
export const mockClasses: SchoolClass[] = [
  { id: 'class1', name: 'Grade 10A', delegateId: 'user2' },
  { id: 'class2', name: 'Grade 10B' },
  { id: 'class3', name: 'Grade 11C', delegateId: 'user3' },
  { id: 'class4', name: 'Grade 12B' },
];

// mockUsers will be seeded into users.db on first DB creation.
export const mockUsers: User[] = [
  { id: 'user1', name: 'Admin User', username: 'admin_user', role: 'admin' },
  { id: 'user2', name: 'John Delegate', username: 'john_delegate', role: 'delegate' },
  { id: 'user3', name: 'Jane Delegate', username: 'jane_delegate', role: 'delegate' },
];


// Example announcements (admin-created, school-wide or targeted) are now managed by announcements.db and its API.
// This section can be removed or kept for reference.
/*
export const exampleAdminAnnouncements: Announcement[] = [
    {
    id: 'admin-ann1',
    title: 'Welcome to Our School Portal!',
    date: new Date(new Date().setDate(new Date().getDate() + 1)).toISOString(),
    type: 'announcement',
    content: 'Find all your school news and updates here.',
    targetClassIds: [], 
  },
   {
    id: 'admin-ann2',
    title: 'Library Books Due',
    date: new Date(new Date().setDate(new Date().getDate() + 2)).toISOString(),
    type: 'announcement',
    content: 'Remember to return your library books by Friday.',
    targetClassIds: ['class1'],
  }
];
*/

// mockExams and mockDeadlines are for seeding schoolevents.db (delegate-type events)
// They now use classId.
export const mockExams: Exam[] = [
  {
    id: 'exam1',
    title: 'Mathematics Mid-Term Exam',
    date: new Date(new Date().setDate(new Date().getDate() + 10)).toISOString(),
    type: 'exam',
    subject: 'Mathematics',
    classId: 'class1', 
    submittedByDelegateId: 'user2',
  },
  {
    id: 'exam2',
    title: 'Science Final Exam',
    date: new Date(new Date().setDate(new Date().getDate() + 14)).toISOString(),
    type: 'exam',
    subject: 'Science',
    classId: 'class4', 
  },
];

export const mockDeadlines: Deadline[] = [
  {
    id: 'dead1',
    title: 'History Essay Submission',
    date: new Date(new Date().setDate(new Date().getDate() + 5)).toISOString(),
    type: 'deadline',
    assignmentName: 'World War II Essay',
    classId: 'class3', 
    submittedByDelegateId: 'user3',
  },
  {
    id: 'dead2',
    title: 'Art Project Deadline',
    date: new Date(new Date().setDate(new Date().getDate() + 9)).toISOString(),
    type: 'deadline',
    assignmentName: 'Modern Art Sculpture',
    // classId: undefined, // Example of a general deadline if applicable
  },
];

// This composite mockSchoolEvents is used for seeding schoolevents.db.
// It primarily contains delegate-submitted type events.
// Admin announcements (school-wide or targeted) are managed via announcements.db.
export const mockSchoolEvents: SchoolEvent[] = [
  ...mockExams,
  ...mockDeadlines,
  // Example of an announcement that might be submitted by a delegate for their class,
  // distinguished from admin announcements.
  {
    id: 'delegate-ann1',
    title: 'Class 10A Meeting',
    date: new Date(new Date().setDate(new Date().getDate() + 3)).toISOString(),
    type: 'announcement',
    content: 'Short meeting for all Grade 10A students after school on Wednesday in Room 5.',
    classId: 'class1', // This could be a way to scope delegate announcements if not using targetClassIds
    submittedByDelegateId: 'user2',
  } as Announcement, // Cast as Announcement to satisfy SchoolEvent union
].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
