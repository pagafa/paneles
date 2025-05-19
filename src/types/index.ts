
import type { SupportedLanguage } from '@/lib/i18n';

export type AnnouncementItemType = 'announcement' | 'exam' | 'deadline';

export interface BaseSchoolItem {
  id: string;
  title: string;
  date: string; // ISO string format
  type: AnnouncementItemType;
  description?: string;
  // For delegate submissions, to link back to the delegate user
  submittedByDelegateId?: string; 
}

export interface Announcement extends BaseSchoolItem {
  type: 'announcement';
  content: string;
  targetClassIds?: string[]; 
}

export interface Exam extends BaseSchoolItem {
  type: 'exam';
  subject: string;
  classId?: string; // Changed from class?: string
}

export interface Deadline extends BaseSchoolItem {
  type: 'deadline';
  assignmentName: string;
  classId?: string; // Changed from class?: string
}

export type SchoolEvent = Announcement | Exam | Deadline;

export type UserRole = 'admin' | 'delegate' | 'guest';

export interface User {
  id: string;
  name: string;
  username: string; 
  role: UserRole;
}

export interface SchoolClass {
  id: string;
  name: string;
  delegateId?: string; 
  language?: SupportedLanguage; 
}
