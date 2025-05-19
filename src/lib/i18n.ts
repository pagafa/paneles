// src/lib/i18n.ts
export const supportedLanguages = ['en', 'es', 'fr', 'gl'] as const;
export type SupportedLanguage = typeof supportedLanguages[number];
export const defaultLanguage: SupportedLanguage = 'gl';

interface Translations {
  appTitle: string;
  loginTitle: string;
  loginDescription: string;
  adminDashboardTitle: string;
  manageClassesTitle: string;
  manageUsersTitle: string;
  delegateDashboardTitle: string;
  kioskMainTitle: string;
  kioskMainSubtitle: string;
  announcementsSectionTitle: string;
  examsSectionTitle: string;
  deadlinesSectionTitle: string;
  noAnnouncementsHint: string;
  noExamsHint: string;
  noDeadlinesHint: string;
  checkBackLaterHint: string;
  viewClassesButtonLabel: string;
  loginButtonLabel: string;
  footerAllRightsReserved: string;
}

export const translations: Record<SupportedLanguage, Translations> = {
  en: {
    appTitle: "School Announcements",
    loginTitle: "Welcome Back!",
    loginDescription: "Log in to manage announcements and school information.",
    adminDashboardTitle: "Admin Dashboard",
    manageClassesTitle: "Manage Classes",
    manageUsersTitle: "Manage Users",
    delegateDashboardTitle: "Delegate Dashboard",
    kioskMainTitle: "Stay Informed",
    kioskMainSubtitle: "Latest school updates at your fingertips.",
    announcementsSectionTitle: "Announcements",
    examsSectionTitle: "Upcoming Exams",
    deadlinesSectionTitle: "Assignment Deadlines",
    noAnnouncementsHint: "No current announcements.",
    noExamsHint: "No upcoming exams scheduled.",
    noDeadlinesHint: "No assignment deadlines approaching.",
    checkBackLaterHint: "Please check back later for updates.",
    viewClassesButtonLabel: "View Classes",
    loginButtonLabel: "Login",
    footerAllRightsReserved: "All rights reserved.",
  },
  es: {
    appTitle: "Avisos Escolares",
    loginTitle: "¡Bienvenido de nuevo!",
    loginDescription: "Inicia sesión para gestionar avisos e información escolar.",
    adminDashboardTitle: "Panel de Administración",
    manageClassesTitle: "Gestionar Clases",
    manageUsersTitle: "Gestionar Usuarios",
    delegateDashboardTitle: "Panel de Delegado",
    kioskMainTitle: "Mantente Informado",
    kioskMainSubtitle: "Últimas actualizaciones de la escuela al alcance de tu mano.",
    announcementsSectionTitle: "Anuncios",
    examsSectionTitle: "Próximos Exámenes",
    deadlinesSectionTitle: "Fechas de Entrega",
    noAnnouncementsHint: "No hay anuncios actualmente.",
    noExamsHint: "No hay exámenes programados.",
    noDeadlinesHint: "No hay fechas de entrega próximas.",
    checkBackLaterHint: "Por favor, vuelve a consultarlo más tarde para actualizaciones.",
    viewClassesButtonLabel: "Ver Clases",
    loginButtonLabel: "Iniciar Sesión",
    footerAllRightsReserved: "Todos los derechos reservados.",
  },
  fr: { 
    appTitle: "Annonces Scolaires",
    loginTitle: "Content de vous revoir!",
    loginDescription: "Connectez-vous pour gérer les annonces et les informations scolaires.",
    adminDashboardTitle: "Tableau de bord Admin",
    manageClassesTitle: "Gérer les Classes",
    manageUsersTitle: "Gérer les Utilisateurs",
    delegateDashboardTitle: "Tableau de bord Délégué",
    kioskMainTitle: "Restez Informé", // Placeholder
    kioskMainSubtitle: "Dernières mises à jour de l'école à portée de main.", // Placeholder
    announcementsSectionTitle: "Annonces", // Placeholder
    examsSectionTitle: "Examens à Venir", // Placeholder
    deadlinesSectionTitle: "Dates Limites", // Placeholder
    noAnnouncementsHint: "Aucune annonce pour le moment.", // Placeholder
    noExamsHint: "Aucun examen prévu.", // Placeholder
    noDeadlinesHint: "Aucune date limite d'affectation approchant.", // Placeholder
    checkBackLaterHint: "Veuillez revenir plus tard pour les mises à jour.", // Placeholder
    viewClassesButtonLabel: "Voir les Classes", // Placeholder
    loginButtonLabel: "Connexion", // Placeholder
    footerAllRightsReserved: "Tous droits réservés.", // Placeholder
  },
  gl: { 
    appTitle: "Avisos Escolares",
    loginTitle: "Benvido de novo!",
    loginDescription: "Inicia sesión para xestionar avisos e información escolar.",
    adminDashboardTitle: "Panel de Administración",
    manageClassesTitle: "Xestionar Clases",
    manageUsersTitle: "Xestionar Usuarios",
    delegateDashboardTitle: "Panel de Delegado",
    kioskMainTitle: "Mantente Informado",
    kioskMainSubtitle: "Últimas actualizacións da escola ao teu alcance.",
    announcementsSectionTitle: "Anuncios",
    examsSectionTitle: "Próximos Exames",
    deadlinesSectionTitle: "Datas de Entrega de Tarefas",
    noAnnouncementsHint: "Non hai anuncios actualmente.",
    noExamsHint: "Non hai exames programados.",
    noDeadlinesHint: "Non hai datas de entrega de tarefas próximas.",
    checkBackLaterHint: "Por favor, volve máis tarde para ver actualizacións.",
    viewClassesButtonLabel: "Ver Clases",
    loginButtonLabel: "Iniciar Sesión",
    footerAllRightsReserved: "Todos os dereitos reservados.",
  },
};

export type TranslationKey = keyof Translations;
