
import type { SchoolEvent, User, SchoolClass, Announcement, Exam, Deadline } from '@/types';

// --- Mock Classes (Used for DB seeding) ---
// Reset to empty for the "reset database" scenario
export const mockClasses: SchoolClass[] = [];

// --- Mock Users (Used for DB seeding) ---
// Reset to only contain the 'pablo' admin user
export const mockUsers: User[] = [
  {
    id: `user-admin-pablo-reset-${Date.now()}`, // Generate a unique ID for pablo
    name: 'Pablo Admin',
    username: 'pablo',
    role: 'admin',
    password: 'soypablo', // As per reset requirement
  },
];

// --- Mock Admin Announcements (Used for DB seeding) ---
// Reset to empty
export const mockAnnouncements: Announcement[] = [];

// --- Mock Exams (Used for SchoolEvents DB seeding) ---
// Reset to empty
export const mockExams: Exam[] = [];

// --- Mock Deadlines (Used for SchoolEvents DB seeding) ---
// Reset to empty
export const mockDeadlines: Deadline[] = [];

// --- Mock SchoolEvents (Composite for DB seeding - primarily delegate-type submissions) ---
// Reset to empty as its constituents are empty
export const mockSchoolEvents: SchoolEvent[] = [];
