
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
  noEventsGeneralHint: string; 
  checkBackLaterHint: string;
  viewClassesButtonLabel: string;
  noClassesHint: string; 
  loginButtonLabel: string;
  footerAllRightsReserved: string;

  // For PublicClassPage
  classPageTitle: string; 
  // As chaves 'announcementsForClassSectionTitle', 'examsForClassSectionTitle', 'deadlinesForClassSectionTitle' xa non se usan para os títulos de sección na páxina da clase,
  // no seu lugar úsanse as xenéricas de arriba ('announcementsSectionTitle', etc.)
  // Mantemos as chaves que inclúen {className} no caso de que se necesiten noutro contexto, pero non para os títulos das seccións internas.
  announcementsForClassSectionTitle: string; 
  examsForClassSectionTitle: string; 
  deadlinesForClassSectionTitle: string; 
  noClassAnnouncementsHint: string; 
  noClassExamsHint: string; 
  noClassDeadlinesHint: string; 
  classNotFoundTitle: string; 
  classNotFoundMessage: string; 
  backToHomeButton: string; 
  backToAllAnnouncementsButton: string;
  delegateIdLabel: string;
  noEventsForClassHint: string; 
  loadingLabel: string; 
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
    examsSectionTitle: "Exams", // Changed
    deadlinesSectionTitle: "Assignments", // Changed
    noAnnouncementsHint: "No current announcements.",
    noExamsHint: "No upcoming exams scheduled.",
    noDeadlinesHint: "No assignment deadlines approaching.",
    noEventsGeneralHint: "No events posted at the moment.",
    checkBackLaterHint: "Please check back later for updates.",
    viewClassesButtonLabel: "View Classes",
    noClassesHint: "No classes available",
    loginButtonLabel: "Login",
    footerAllRightsReserved: "All rights reserved.",

    classPageTitle: "Events for {className}",
    announcementsForClassSectionTitle: "Announcements for {className}", 
    examsForClassSectionTitle: "Exams for {className}", 
    deadlinesForClassSectionTitle: "Deadlines for {className}", 
    noClassAnnouncementsHint: "No current announcements for this class.",
    noClassExamsHint: "No upcoming exams scheduled for this class.",
    noClassDeadlinesHint: "No assignment deadlines approaching for this class.",
    classNotFoundTitle: "Class Not Found",
    classNotFoundMessage: "The class you are looking for does not exist or is not available.",
    backToHomeButton: "Back to Home",
    backToAllAnnouncementsButton: "Back to All Announcements",
    delegateIdLabel: "Delegate ID",
    noEventsForClassHint: "No events posted for this class yet.",
    loadingLabel: "Loading...",
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
    examsSectionTitle: "Exámenes", // Changed
    deadlinesSectionTitle: "Tareas", // Changed
    noAnnouncementsHint: "No hay anuncios actualmente.",
    noExamsHint: "No hay exámenes programados.",
    noDeadlinesHint: "No hay fechas de entrega próximas.",
    noEventsGeneralHint: "No hay eventos publicados por el momento.",
    checkBackLaterHint: "Por favor, vuelve a consultarlo más tarde para actualizaciones.",
    viewClassesButtonLabel: "Ver Clases",
    noClassesHint: "No hay clases disponibles",
    loginButtonLabel: "Iniciar Sesión",
    footerAllRightsReserved: "Todos los derechos reservados.",

    classPageTitle: "Eventos para {className}",
    announcementsForClassSectionTitle: "Anuncios para {className}",
    examsForClassSectionTitle: "Exámenes para {className}",
    deadlinesForClassSectionTitle: "Fechas de Entrega para {className}",
    noClassAnnouncementsHint: "No hay anuncios actuales para esta clase.",
    noClassExamsHint: "No hay exámenes programados para esta clase.",
    noClassDeadlinesHint: "No hay fechas de entrega próximas para esta clase.",
    classNotFoundTitle: "Clase no encontrada",
    classNotFoundMessage: "La clase que estás buscando no existe o no está disponible.",
    backToHomeButton: "Volver al Inicio",
    backToAllAnnouncementsButton: "Volver a Todos los Anuncios",
    delegateIdLabel: "ID del Delegado",
    noEventsForClassHint: "No hay eventos publicados para esta clase todavía.",
    loadingLabel: "Cargando...",
  },
  fr: { 
    appTitle: "Annonces Scolaires",
    loginTitle: "Content de vous revoir!",
    loginDescription: "Connectez-vous pour gérer les annonces et les informations scolaires.",
    adminDashboardTitle: "Tableau de bord Admin",
    manageClassesTitle: "Gérer les Classes",
    manageUsersTitle: "Gérer les Utilisateurs",
    delegateDashboardTitle: "Tableau de bord Délégué",
    kioskMainTitle: "Restez Informé", 
    kioskMainSubtitle: "Dernières mises à jour de l'école à portée de main.", 
    announcementsSectionTitle: "Annonces", 
    examsSectionTitle: "Examens", // Changed
    deadlinesSectionTitle: "Devoirs", // Changed
    noAnnouncementsHint: "Aucune annonce pour le moment.", 
    noExamsHint: "Aucun examen prévu.", 
    noDeadlinesHint: "Aucune date limite d'affectation approchant.", 
    noEventsGeneralHint: "Aucun événement publié pour le moment.",
    checkBackLaterHint: "Veuillez revenir plus tard pour les mises à jour.", 
    viewClassesButtonLabel: "Voir les Classes", 
    noClassesHint: "Aucune classe disponible",
    loginButtonLabel: "Connexion", 
    footerAllRightsReserved: "Tous droits réservés.", 

    classPageTitle: "Événements pour {className}",
    announcementsForClassSectionTitle: "Annonces pour {className}",
    examsForClassSectionTitle: "Examens pour {className}",
    deadlinesForClassSectionTitle: "Dates Limites pour {className}",
    noClassAnnouncementsHint: "Aucune annonce actuelle pour cette classe.",
    noClassExamsHint: "Aucun examen prévu pour cette classe.",
    noClassDeadlinesHint: "Aucune date limite d'affectation approchant pour cette classe.",
    classNotFoundTitle: "Classe non trouvée",
    classNotFoundMessage: "La classe que vous recherchez n'existe pas ou n'est pas disponible.",
    backToHomeButton: "Retour à l'accueil",
    backToAllAnnouncementsButton: "Retour à Toutes les Annonces",
    delegateIdLabel: "ID du Délégué",
    noEventsForClassHint: "Aucun événement publié pour cette classe pour le moment.",
    loadingLabel: "Chargement...",
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
    examsSectionTitle: "Exames", // Cambiado
    deadlinesSectionTitle: "Tarefas", // Cambiado
    noAnnouncementsHint: "Non hai anuncios actualmente.",
    noExamsHint: "Non hai exames programados.",
    noDeadlinesHint: "Non hai datas de entrega de tarefas próximas.",
    noEventsGeneralHint: "Non hai eventos publicados polo momento.",
    checkBackLaterHint: "Por favor, volve máis tarde para ver actualizacións.",
    viewClassesButtonLabel: "Ver Clases",
    noClassesHint: "Non hai clases dispoñibles",
    loginButtonLabel: "Iniciar Sesión",
    footerAllRightsReserved: "Todos os dereitos reservados.",

    classPageTitle: "Eventos para {className}",
    announcementsForClassSectionTitle: "Anuncios para {className}",
    examsForClassSectionTitle: "Exames para {className}", 
    deadlinesForClassSectionTitle: "Prazos para {className}", 
    noClassAnnouncementsHint: "Non hai anuncios actuais para esta clase.",
    noClassExamsHint: "Non hai exames programados para esta clase.",
    noClassDeadlinesHint: "Non hai prazos de entrega de tarefas próximos para esta clase.",
    classNotFoundTitle: "Clase Non Atopada",
    classNotFoundMessage: "A clase que buscas non existe ou non está dispoñible.",
    backToHomeButton: "Volver ao Inicio",
    backToAllAnnouncementsButton: "Volver a Todos os Anuncios",
    delegateIdLabel: "ID do Delegado",
    noEventsForClassHint: "Aínda non hai eventos publicados para esta clase.",
    loadingLabel: "Cargando...",
  },
};

export type TranslationKey = keyof Translations;
export type TranslationVariables = { [key: string]: string | number | undefined };

// Helper function type for the 't' function to allow for variables
export type TFunction = (key: TranslationKey, variables?: TranslationVariables) => string;


    
