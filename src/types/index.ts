
import type { SupportedLanguage } from '@/lib/i18n';

export type AnnouncementItemType = 'announcement' | 'exam' | 'deadline';

export interface BaseSchoolItem {
  id: string;
  title: string;
  date: string; // ISO string format
  type: AnnouncementItemType;
  description?: string;
  submittedByDelegateId?: string;
  classId?: string; // For delegate-submitted exams, deadlines, or class-specific announcements
}

export interface Announcement extends BaseSchoolItem {
  type: 'announcement';
  content: string;
  targetClassIds: string[]; // Non-optional, must target specific classes
}

export interface Exam extends BaseSchoolItem {
  type: 'exam';
  subject: string;
  classId?: string;
}

export interface Deadline extends BaseSchoolItem {
  type: 'deadline';
  assignmentName: string;
  classId?: string;
}

export type SchoolEvent = Announcement | Exam | Deadline;

export type UserRole = 'admin' | 'delegate' | 'guest';

export interface User {
  id: string;
  name: string;
  username: string;
  password?: string; // Hashed password
  role: UserRole;
}

export interface SchoolClass {
  id: string;
  name: string;
  delegateId?: string;
  language?: SupportedLanguage;
  password?: string;
}

// For the public class page, which doesn't need the actual password
export interface ClassPageDetails extends Omit<SchoolClass, 'password'> {
  passwordProtected: boolean;
}

export interface ClassPasswordVerificationResponse {
  verified: boolean;
  message?: string;
}
