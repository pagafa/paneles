export type AnnouncementItemType = 'announcement' | 'exam' | 'deadline';

export interface BaseSchoolItem {
  id: string;
  title: string;
  date: string; // ISO string format
  type: AnnouncementItemType;
  description?: string;
}

export interface Announcement extends BaseSchoolItem {
  type: 'announcement';
  content: string;
}

export interface Exam extends BaseSchoolItem {
  type: 'exam';
  subject: string;
  class?: string; // Optional, for class-specific exams
}

export interface Deadline extends BaseSchoolItem {
  type: 'deadline';
  assignmentName: string;
  class?: string; // Optional, for class-specific deadlines
}

export type SchoolEvent = Announcement | Exam | Deadline;

export type UserRole = 'admin' | 'delegate' | 'guest';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface SchoolClass {
  id: string;
  name: string;
  teacher?: string; // Optional teacher name
  delegateId?: string; // Optional delegate user ID
}
