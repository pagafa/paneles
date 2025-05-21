
import type { SchoolEvent, User, SchoolClass, Announcement, Exam, Deadline } from '@/types';

// --- Mock Classes (Used for DB seeding) ---
export const mockClasses: SchoolClass[] = [
  { id: 'eso1a', name: '1º ESO A', delegateId: 'laura_g_id', password: 'passwordeso1a' },
  { id: 'eso1b', name: '1º ESO B' },
  { id: 'eso2a', name: '2º ESO A' },
  { id: 'bach1a', name: '1º Bacharelato A', delegateId: 'carlos_p_id', password: 'passwordbach1a' },
  { id: 'bach2a', name: '2º Bacharelato A' },
];

// --- Mock Users (Used for DB seeding) ---
export const mockUsers: User[] = [
  { id: 'admin_mv_id', name: 'Administrador Principal', username: 'admin_mv', role: 'admin', password: 'password' },
  { id: 'laura_g_id', name: 'Laura Gómez', username: 'laura_g', role: 'delegate', password: 'password' },
  { id: 'carlos_p_id', name: 'Carlos Pérez', username: 'carlos_p', role: 'delegate', password: 'password' },
  { id: 'ana_r_id', name: 'Ana Rodríguez', username: 'ana_r', role: 'delegate', password: 'password' },
];

// --- Mock Admin Announcements (Used for DB seeding) ---
export const mockAnnouncements: Announcement[] = [
  {
    id: 'admin-ann1-mv',
    title: 'Benvida ao curso 2024-2025 no IES Monte da Vila!',
    content: 'Todo o equipo do IES Monte da Vila deséxavos un bo comezo de curso. Consultade o calendario e os horarios na web do centro.',
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    type: 'announcement',
    targetClassIds: [], // School-wide
  },
  {
    id: 'admin-ann2-mv',
    title: 'Reunión Informativa para Familias de 1º ESO',
    content: 'Convócase ás familias do alumnado de 1º da ESO a unha reunión informativa o vindeiro luns ás 18:00h no salón de actos.',
    date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    type: 'announcement',
    targetClassIds: ['eso1a', 'eso1b'],
  },
];

// --- Mock Exams (Used for SchoolEvents DB seeding) ---
export const mockExams: Exam[] = [
  {
    id: 'exam1-mv',
    title: 'Exame Matemáticas Aplicadas 1º ESO',
    date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days from now
    type: 'exam',
    subject: 'Matemáticas Aplicadas',
    classId: 'eso1a',
    submittedByDelegateId: 'laura_g_id',
    description: "Temas 1-5. Traer calculadora."
  },
  {
    id: 'exam2-mv',
    title: 'Exame Lingua Galega 1º Bacharelato',
    date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days from now
    type: 'exam',
    subject: 'Lingua Galega e Literatura',
    classId: 'bach1a',
    submittedByDelegateId: 'carlos_p_id',
  },
];

// --- Mock Deadlines (Used for SchoolEvents DB seeding) ---
export const mockDeadlines: Deadline[] = [
  {
    id: 'dead1-mv',
    title: 'Entrega Traballo Historia 2º ESO',
    date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days from now
    type: 'deadline',
    assignmentName: 'Investigación Idade Media',
    classId: 'eso2a',
    submittedByDelegateId: 'ana_r_id', 
    description: "Extensión mínima de 5 páxinas."
  },
  {
    id: 'dead2-mv',
    title: 'Prazo Proxecto Tecnoloxía 2º Bacharelato',
    date: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000).toISOString(), // 9 days from now
    type: 'deadline',
    assignmentName: 'Deseño App Móbil',
    classId: 'bach2a', 
  },
];

// --- Mock SchoolEvents (Composite for DB seeding - primarily delegate-type submissions) ---
export const mockSchoolEvents: SchoolEvent[] = [
  ...mockExams,
  ...mockDeadlines,
  {
    id: 'delegate-ann1-mv',
    title: 'Recordatorio: Material de Plástica para 1º ESO A',
    date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days from now
    type: 'announcement',
    content: 'Lembrade traer o material de plástica solicitado para a clase do venres.',
    classId: 'eso1a', 
    submittedByDelegateId: 'laura_g_id',
    description: 'A lista completa está na aula virtual.'
  } as Announcement, // Explicit cast for content field
].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
