
import type { SchoolEvent, User, SchoolClass, Announcement, Exam, Deadline } from '@/types';

// --- Mock Classes (Used for DB seeding) ---
export const mockClasses: SchoolClass[] = [
  { id: 'eso1a', name: '1º ESO A', delegateId: 'delegate-laura-g' },
  { id: 'eso2b', name: '2º ESO B', delegateId: 'delegate-carlos-p', isHidden: true },
  { id: 'bach1c', name: '1º Bacharelato C' },
  { id: 'bach2d', name: '2º Bacharelato D', delegateId: 'delegate-laura-g' },
  { id: 'fpbasic', name: 'FP Básica Informática', isHidden: false },
  { id: 'fpscm', name: 'CM SMR' },
  { id: 'fpsasir', name: 'CS ASIR' },
  { id: 'fpsdaw', name: 'CS DAW' },
];

// --- Mock Users (Used for DB seeding) ---
export const mockUsers: User[] = [
  {
    id: 'admin-pablo-001',
    name: 'Pablo Admin',
    username: 'pablo',
    role: 'admin',
    password: 'soypablo', // Será hasheado ao sementar
  },
  {
    id: 'delegate-laura-g',
    name: 'Laura Gómez',
    username: 'laura_g',
    role: 'delegate',
    password: 'passwordlaura', // Será hasheado ao sementar
  },
  {
    id: 'delegate-carlos-p',
    name: 'Carlos Pérez',
    username: 'carlos_p',
    role: 'delegate',
    password: 'passwordcarlos', // Será hasheado ao sementar
  },
   {
    id: 'user-ana-s',
    name: 'Ana Suárez',
    username: 'ana_s',
    role: 'delegate',
    password: 'passwordana', // Será hasheado ao sementar
  }
];

// --- Mock Admin Announcements (Used for DB seeding) ---
export const mockAnnouncements: Announcement[] = [
  {
    id: 'ann-xeral-1',
    title: 'Reunión Informativa Xeral de Principio de Curso',
    content: 'Convócase a todas as familias a unha reunión informativa o vindeiro luns ás 18:00 no salón de actos.',
    date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    type: 'announcement',
    targetClassIds: ['eso1a', 'bach1c'],
  },
  {
    id: 'ann-eso1a-1',
    title: 'Material Necesario para Plástica - 1º ESO A',
    content: 'Lémbrase aos alumnos de 1º ESO A que deben traer o material de plástica solicitado para a clase do mércores.',
    date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
    type: 'announcement',
    targetClassIds: ['eso1a'],
  },
  {
    id: 'ann-fp-1',
    title: 'Charla Orientación Profesional FP',
    content: 'O vindeiro venres haberá unha charla sobre saídas profesionais para os ciclos de FP. Asistencia obrigatoria para CS ASIR e CS DAW.',
    date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    type: 'announcement',
    targetClassIds: ['fpsasir', 'fpsdaw'],
  },
];


// --- Mock Exams (Used for SchoolEvents DB seeding) ---
export const mockExams: Exam[] = [
  {
    id: 'exam-math-eso1a',
    title: 'Exame de Matemáticas - Tema 3',
    date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    type: 'exam',
    subject: 'Matemáticas',
    classId: 'eso1a', // Clase visible
    submittedByDelegateId: 'delegate-laura-g',
    description: ' cubrirá os contidos dos temas 1, 2 e 3.'
  },
  {
    id: 'exam-lingua-bach1c',
    title: 'Exame de Lingua Galega - Literatura Medieval',
    date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
    type: 'exam',
    subject: 'Lingua Galega e Literatura',
    classId: 'bach1c', // Clase visible
    description: 'Comentario de texto e preguntas sobre a lírica medieval.'
  },
];

// --- Mock Deadlines (Used for SchoolEvents DB seeding) ---
export const mockDeadlines: Deadline[] = [
  {
    id: 'dead-hist-eso2b', // Esta clase está oculta por defecto
    title: 'Entrega Traballo Historia - Exipto (Clase Oculta)',
    date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    type: 'deadline',
    assignmentName: 'Investigación sobre o Antigo Exipto',
    classId: 'eso2b',
    submittedByDelegateId: 'delegate-carlos-p',
    description: 'Extensión mínima de 5 páxinas, incluíndo bibliografía.'
  },
  {
    id: 'dead-fisica-bach2d',
    title: 'Prazo Problemas Física - Tema 2',
    date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    type: 'deadline',
    assignmentName: 'Boletín Problemas Termodinámica',
    classId: 'bach2d', // Clase visible
    submittedByDelegateId: 'delegate-laura-g',
  },
];

export const mockSchoolEvents: SchoolEvent[] = [
  ...(mockExams as SchoolEvent[]),
  ...(mockDeadlines as SchoolEvent[]),
  // Engadir un anuncio de delegado para probar
  {
    id: 'ann-deleg-fpscm-1',
    title: 'Recordatorio: Prácticas CM SMR',
    content: 'Non esquezades traer as vosas ferramentas para as prácticas de taller mañá.',
    date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
    type: 'announcement',
    classId: 'fpscm', // Clase visible
    submittedByDelegateId: 'user-ana-s',
    description: 'Importante para a avaliación continua.'
  }
];
