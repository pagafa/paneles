
// src/types/index.ts
import type { SupportedLanguage } from '@/lib/i18n';

export type AnnouncementItemType = 'announcement' | 'exam' | 'deadline';

export interface BaseSchoolItem {
  id: string;
  title: string;
  date: string; // ISO string format
  type: AnnouncementItemType;
  description?: string;
  submittedByDelegateId?: string;
}

// For Admin-created, announcements stored in announcements.db
export interface Announcement extends BaseSchoolItem {
  type: 'announcement';
  content: string;
  targetClassIds: string[]; // Non-optional, must target specific classes
}

// SchoolEvent represents items typically submitted by delegates and stored in schoolevents.db
export type SchoolEvent =
  | (BaseSchoolItem & { type: 'announcement'; content: string; classId: string; }) // Delegate Announcement
  | (BaseSchoolItem & { type: 'exam'; subject: string; classId: string; })       // Delegate Exam
  | (BaseSchoolItem & { type: 'deadline'; assignmentName: string; classId: string; }); // Delegate Deadline

export type Exam = Extract<SchoolEvent, { type: 'exam' }>;
export type Deadline = Extract<SchoolEvent, { type: 'deadline' }>;


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
  // language?: SupportedLanguage; // Removed
  isHidden?: boolean;
  // password?: string; // Removed
}

// This type is no longer needed as class passwords were removed.
// export interface ClassPasswordVerificationResponse {
//   verified: boolean;
//   message?: string;
//   errorDetails?: string;
// }
