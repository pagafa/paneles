
import type { SupportedLanguage } from '@/lib/i18n';

export type AnnouncementItemType = 'announcement' | 'exam' | 'deadline';

export interface BaseSchoolItem {
  id: string;
  title: string;
  date: string; // ISO string format
  type: AnnouncementItemType;
  description?: string;
  submittedByDelegateId?: string; // For delegate submissions
  // classId is defined more specifically in extending types where applicable
}

// For Admin-created, potentially multi-class announcements stored in announcements.db
export interface Announcement extends BaseSchoolItem {
  type: 'announcement';
  content: string;
  targetClassIds: string[]; // Non-optional, must target specific classes
}

// For Delegate-submitted Exams stored in schoolevents.db
export interface Exam extends BaseSchoolItem {
  type: 'exam';
  subject: string;
  classId: string; // Mandatory for exams submitted by delegates
}

// For Delegate-submitted Deadlines stored in schoolevents.db
export interface Deadline extends BaseSchoolItem {
  type: 'deadline';
  assignmentName: string;
  classId: string; // Mandatory for deadlines submitted by delegates
}

// SchoolEvent represents items typically submitted by delegates and stored in schoolevents.db
// This includes class-specific announcements, exams, or deadlines.
export type SchoolEvent =
  | (BaseSchoolItem & { type: 'announcement'; content: string; classId: string; }) // Delegate Announcement
  | Exam
  | Deadline;


export type UserRole = 'admin' | 'delegate' | 'guest';

export interface User {
  id: string;
  name: string;
  username: string;
  password?: string; // Hashed password, optional as it's not always needed/returned
  role: UserRole;
}

export interface SchoolClass {
  id: string;
  name: string;
  delegateId?: string;
  language?: SupportedLanguage;
  password?: string; // Plaintext password for class page protection
}

// For the public class page API response, which doesn't need the actual password
export interface ClassPageDetails extends Omit<SchoolClass, 'password'> {
  passwordProtected: boolean;
}

export interface ClassPasswordVerificationResponse {
  verified: boolean;
  message?: string;
}
