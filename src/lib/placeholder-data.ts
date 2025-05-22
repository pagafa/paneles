
import type { SchoolEvent, User, SchoolClass, Announcement, Exam, Deadline } from '@/types';

// --- Mock Classes (Used for DB seeding) ---
export const mockClasses: SchoolClass[] = [
  { id: 'eso1a', name: '1º ESO A', delegateId: 'delegate-laura-g', password: 'passwordeso1a' },
  { id: 'eso2b', name: '2º ESO B', delegateId: 'delegate-carlos-p' },
  { id: 'bach1c', name: '1º Bacharelato C', password: 'passwordbach1c' },
  { id: 'bach2d', name: '2º Bacharelato D', delegateId: 'delegate-laura-g' },
  { id: 'fpbasic', name: 'FP Básica Informática' },
  { id: 'fpscm', name: 'CM SMR' },
  { id: 'fpsasir', name: 'CS ASIR' },
  { id: 'fpsdaw', name: 'CS DAW' },
];

// --- Mock Users (Used for DB seeding) ---
export const mockUsers: User[] = [
  {
    id: 'admin-pablo-001', // Static ID for the main admin
    name: 'Pablo Admin',
    username: 'pablo',
    role: 'admin',
    password: 'soypablo', // This will be hashed during seeding
  },
  {
    id: 'delegate-laura-g',
    name: 'Laura Gómez',
    username: 'laura_g',
    role: 'delegate',
    password: 'passwordlaura', // This will be hashed
  },
  {
    id: 'delegate-carlos-p',
    name: 'Carlos Pérez',
    username: 'carlos_p',
    role: 'delegate',
    password: 'passwordcarlos', // This will be hashed
  },
   {
    id: 'user-ana-s',
    name: 'Ana Suárez',
    username: 'ana_s',
    role: 'delegate', // Example of another delegate
    password: 'passwordana', // This will be hashed
  }
];

// --- Mock Admin Announcements (Used for DB seeding) ---
export const mockAnnouncements: Announcement[] = [
  {
    id: 'ann-global-1',
    title: 'Reunión Informativa Xeral de Principio de Curso',
    content: 'Convócase a todas as familias a unha reunión informativa o vindeiro luns ás 18:00 no salón de actos.',
    date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // In 2 days
    type: 'announcement',
    targetClassIds: [], // School-wide
  },
  {
    id: 'ann-eso1a-1',
    title: 'Material Necesario para Plástica - 1º ESO A',
    content: 'Lémbrase aos alumnos de 1º ESO A que deben traer o material de plástica solicitado para a clase do mércores.',
    date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
    type: 'announcement',
    targetClassIds: ['eso1a'],
  },
];


// --- Mock Exams (Used for SchoolEvents DB seeding) ---
export const mockExams: Exam[] = [
  {
    id: 'exam-math-eso1a',
    title: 'Exame de Matemáticas - Tema 3',
    date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // In 1 week
    type: 'exam',
    subject: 'Matemáticas',
    classId: 'eso1a',
    submittedByDelegateId: 'delegate-laura-g',
    description: ' cubrirá os contidos dos temas 1, 2 e 3.'
  },
  {
    id: 'exam-lingua-bach1c',
    title: 'Exame de Lingua Galega - Literatura Medieval',
    date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(), // In 10 days
    type: 'exam',
    subject: 'Lingua Galega e Literatura',
    classId: 'bach1c',
    description: 'Comentario de texto e preguntas sobre a lírica medieval.'
  },
];

// --- Mock Deadlines (Used for SchoolEvents DB seeding) ---
export const mockDeadlines: Deadline[] = [
  {
    id: 'dead-hist-eso2b',
    title: 'Entrega Traballo Historia - Exipto',
    date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), // In 5 days
    type: 'deadline',
    assignmentName: 'Investigación sobre o Antigo Exipto',
    classId: 'eso2b',
    submittedByDelegateId: 'delegate-carlos-p',
    description: 'Extensión mínima de 5 páxinas, incluíndo bibliografía.'
  },
  {
    id: 'dead-fisica-bach2d',
    title: 'Prazo Problemas Física - Tema 2',
    date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // In 3 days
    type: 'deadline',
    assignmentName: 'Boletín Problemas Termodinámica',
    classId: 'bach2d',
    submittedByDelegateId: 'delegate-laura-g',
  },
];

// --- Mock SchoolEvents (Composite for DB seeding - primarily delegate-type submissions) ---
// This list will now only contain exams and deadlines, as delegate announcements
// can be handled as regular announcements with targetClassIds and submittedByDelegateId if needed,
// or we could add a specific 'delegate-announcement' type to SchoolEvent if distinct handling is required.
// For now, keeping it simpler.
export const mockSchoolEvents: SchoolEvent[] = [
  ...mockExams,
  ...mockDeadlines,
  // Example of a delegate-submitted announcement if we were to handle it via schoolevents
  // {
  //   id: 'evt-ann-delegate-1',
  //   title: 'Recordatorio Asemblea Delegados 1º ESO A',
  //   date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
  //   type: 'announcement', // Could be a special type like 'delegate_announcement'
  //   content: 'Lembrade a asemblea de delegados mañá no recreo na aula de usos múltiples.',
  //   classId: 'eso1a',
  //   submittedByDelegateId: 'delegate-laura-g',
  //   description: 'Traede as vosas propostas.'
  // }
];
