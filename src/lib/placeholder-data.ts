
import type { SchoolEvent, User, SchoolClass, Announcement, Exam, Deadline } from '@/types';

// --- Mock Classes (Used for DB seeding) ---
// Baleirado segundo a solicitude
export const mockClasses: SchoolClass[] = [
  // {
  //   id: 'eso1a',
  //   name: '1º ESO A',
  //   delegateId: 'laura_g', // Laura Gómez
  //   isHidden: false,
  // },
  // {
  //   id: 'eso2b',
  //   name: '2º ESO B',
  //   delegateId: 'carlos_p', // Carlos Pérez
  //   isHidden: true,
  // },
  // {
  //   id: 'bach1c',
  //   name: '1º Bacharelato C',
  //   delegateId: undefined, // Sen delegado asignado inicialmente
  //   isHidden: false,
  // },
  // {
  //   id: 'bach2d',
  //   name: '2º Bacharelato D',
  //   isHidden: false,
  // },
];

// --- Mock Users (Used for DB seeding) ---
// Os contrasinais gardaranse hasheados na base de datos mediante a lóxica de sementado.
export const mockUsers: User[] = [
  {
    id: 'admin-iesmdv-001', // Static ID for the main admin
    name: 'Administrador IESMDV',
    username: 'iesmdv',
    role: 'admin',
    password: 'iesmdv', // This will be hashed during seeding
  },
  // {
  //   id: 'user-delegate-laura-001',
  //   name: 'Laura Gómez',
  //   username: 'laura_g',
  //   role: 'delegate',
  //   password: 'password',
  // },
  // {
  //   id: 'user-delegate-carlos-002',
  //   name: 'Carlos Pérez',
  //   username: 'carlos_p',
  //   role: 'delegate',
  //   password: 'password',
  // },
  // {
  //   id: 'user-delegate-ana-003',
  //   name: 'Ana Torres',
  //   username: 'ana_t',
  //   role: 'delegate',
  //   password: 'password',
  // },
];

// --- Mock Admin Announcements (Used for DB seeding) ---
// Baleirado segundo a solicitude
export const mockAnnouncements: Announcement[] = [
  // {
  //   id: 'ann1',
  //   title: 'Reunión Informativa Inicio de Curso (IES Monte da Vila)',
  //   content: 'Haberá unha reunión informativa para pais e alumnos o vindeiro luns ás 18:00 no salón de actos do IES Monte da Vila.',
  //   date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // En 3 días
  //   type: 'announcement',
  //   targetClassIds: ['eso1a', 'bach1c'], // Asegurarse de que estes IDs existan en mockClasses se se restauran
  // },
  // {
  //   id: 'ann2',
  //   title: 'Concurso de Fotografía: O Noso Entorno no IES Monte da Vila',
  //   content: 'Participa no concurso de fotografía! O prazo de entrega é ata finais de mes. Consulta as bases na web do IES Monte da Vila.',
  //   date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(), // En 10 días
  //   type: 'announcement',
  //   targetClassIds: ['eso1a', 'eso2b', 'bach1c', 'bach2d'], // Para todas as clases de exemplo
  // },
];


// --- Mock Exams (Used for SchoolEvents DB seeding) ---
// Baleirado segundo a solicitude "non hai school events" para o estado inicial
export const mockExams: Exam[] = [];

// --- Mock Deadlines (Used for SchoolEvents DB seeding) ---
// Baleirado segundo a solicitude "non hai school events" para o estado inicial
export const mockDeadlines: Deadline[] = [];

// Consolidate all school events for easier seeding
// Agora estará baleiro inicialmente
export const mockSchoolEvents: SchoolEvent[] = [
  ...mockExams,
  ...mockDeadlines,
];
