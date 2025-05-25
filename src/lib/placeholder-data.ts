
import type { SchoolEvent, User, SchoolClass, Announcement, Exam, Deadline } from '@/types';

// --- Mock Classes (Used for DB seeding) ---
export const mockClasses: SchoolClass[] = [
  {
    id: 'eso1a',
    name: '1º ESO A',
    delegateId: 'laura_g', // Laura Gómez
    isHidden: false,
  },
  {
    id: 'eso2b',
    name: '2º ESO B',
    delegateId: 'carlos_p', // Carlos Pérez
    isHidden: true,
  },
  {
    id: 'bach1c',
    name: '1º Bacharelato C',
    delegateId: undefined, // Sen delegado asignado inicialmente
    isHidden: false,
  },
  {
    id: 'bach2d',
    name: '2º Bacharelato D',
    isHidden: false,
  },
];

// --- Mock Users (Used for DB seeding) ---
// Os contrasinais gardaranse hasheados na base de datos mediante a lóxica de sementado.
export const mockUsers: User[] = [
  {
    id: 'admin-pablo-001', // Static ID for pablo admin
    name: 'Pablo Admin',
    username: 'pablo',
    role: 'admin',
    password: 'soypablo',
  },
  {
    id: 'user-delegate-laura-001',
    name: 'Laura Gómez',
    username: 'laura_g',
    role: 'delegate',
    password: 'password',
  },
  {
    id: 'user-delegate-carlos-002',
    name: 'Carlos Pérez',
    username: 'carlos_p',
    role: 'delegate',
    password: 'password',
  },
  {
    id: 'user-delegate-ana-003',
    name: 'Ana Torres',
    username: 'ana_t',
    role: 'delegate',
    password: 'password',
  },
];

// --- Mock Admin Announcements (Used for DB seeding) ---
// Agora todos os anuncios do administrador deben ter targetClassIds
export const mockAnnouncements: Announcement[] = [
  {
    id: 'ann1',
    title: 'Reunión Informativa Inicio de Curso',
    content: 'Haberá unha reunión informativa para pais e alumnos o vindeiro luns ás 18:00 no salón de actos.',
    date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // En 3 días
    type: 'announcement',
    targetClassIds: ['eso1a', 'bach1c'],
  },
  {
    id: 'ann2',
    title: 'Concurso de Fotografía: O Noso Entorno',
    content: 'Participa no concurso de fotografía! O prazo de entrega é ata finais de mes. Consulta as bases na web.',
    date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(), // En 10 días
    type: 'announcement',
    targetClassIds: ['eso1a', 'eso2b', 'bach1c', 'bach2d'], // Para todas as clases de exemplo
  },
];


// --- Mock Exams (Used for SchoolEvents DB seeding) ---
// Baleirado segundo a solicitude "non hai school events" para o estado inicial
export const mockExams: Exam[] = [
  // Exemplos eliminados, a base de datos sementarase baleira para exames
  // {
  //   id: 'exam1',
  //   title: 'Exame de Matemáticas Aplicadas',
  //   date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  //   type: 'exam',
  //   subject: 'Matemáticas Aplicadas',
  //   classId: 'eso1a',
  //   submittedByDelegateId: 'laura_g',
  // },
];

// --- Mock Deadlines (Used for SchoolEvents DB seeding) ---
// Baleirado segundo a solicitude "non hai school events" para o estado inicial
export const mockDeadlines: Deadline[] = [
  // Exemplos eliminados, a base de datos sementarase baleira para prazos
  // {
  //   id: 'dead1',
  //   title: 'Entrega Traballo de Lingua Castelá',
  //   date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
  //   type: 'deadline',
  //   assignmentName: 'Análise Literaria Quixote',
  //   classId: 'bach1c',
  //   submittedByDelegateId: 'carlos_p',
  // },
];

// Consolidate all school events for easier seeding
// Agora estará baleiro inicialmente
export const mockSchoolEvents: SchoolEvent[] = [
  ...mockExams,
  ...mockDeadlines,
];
