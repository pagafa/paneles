
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
  noClassAnnouncementsHint: string;
  noClassExamsHint: string;
  noClassDeadlinesHint: string;
  classNotFoundTitle: string;
  classNotFoundMessage: string;
  backToHomeButton: string;
  delegateIdLabel: string; 
  noEventsForClassHint: string; 
  loadingLabel: string;

  // For DelegateDashboardPage
  assignedClassesLabel: string;
  noAssignedClassesLabel: string;
  editInformationTitle: string;
  submitNewInformationTitle: string;
  editingSubmissionDescription: string; 
  cancelEditButton: string;
  delegateFormDescription: string;
  yourRecentSubmissionsTitle: string;
  noSubmissionsYetHint: string;
  alertDialogTitle: string;
  alertDialogDescription: string; 
  cancelButton: string;
  deleteButton: string;
  submissionUpdatedToastTitle: string;
  submissionUpdatedToastDescription: string; 
  submissionSubmittedToastTitle: string;
  submissionSubmittedToastDescription: string; 
  submissionDeletedToastTitle: string;
  submissionDeletedToastDescription: string; 

  // For DelegateInputForm (tabs)
  announcementTabLabel: string;
  examTabLabel: string;
  deadlineTabLabel: string;
  // For DelegateInputForm (fields)
  formTitleLabel: string;
  formTitlePlaceholder: string; 
  formDateTimeLabel: string;
  formPickDateTimeButton: string;
  formClassLabel: string;
  formSelectClassPlaceholder: string;
  formNoAssignedClassesWarning: string;
  formAnnouncementContentLabel: string;
  formAnnouncementContentPlaceholder: string;
  formExamSubjectLabel: string;
  formExamSubjectPlaceholder: string;
  formDeadlineAssignmentNameLabel: string;
  formDeadlineAssignmentNamePlaceholder: string;
  formAdditionalDescriptionLabel: string;
  formAdditionalDescriptionPlaceholder: string;
  formSubmitButton: string;
  formUpdateButton: string;

  // School Name Editing
  editSchoolNameCardTitle: string;
  schoolNameInputLabel: string;
  schoolNameInputPlaceholder: string;
  saveSchoolNameButton: string;
  schoolNameUpdatedToastTitle: string;
  schoolNameUpdatedToastDescription: string; 

  // Admin Dashboard Announcement Management
  editAnnouncementTitle: string;
  postNewAnnouncementTitle: string;
  editingAnnouncementDescription: string; // e.g. "Editing: {title}"
  currentAnnouncementsTitle: string;
  noAnnouncementsPostedHint: string;
  schoolWideTarget: string;
  classesTargetLabel: string; // e.g. "Classes"
  targetLabel: string; // e.g. "Target"
  editButtonLabel: string;
  deleteButtonLabel: string;
  deleteAnnouncementConfirmation: string; // e.g. "This will permanently delete the announcement titled "{title}"."
  announcementUpdatedToastTitle: string;
  announcementPostedToastTitle: string;
  announcementActionSuccessToastDescription: string; // e.g. "{title} has been successfully {action}."
  updated: string; // "updated"
  posted: string; // "posted"
  announcementDeletedToastTitle: string;
  announcementDeletedToastDescription: string;
  errorDialogTitle: string; // Generic error title for dialogs/toasts
  errorFetchingAnnouncements: string; // e.g. "Error fetching announcements: {message}"
  errorLoadingAnnouncementsTitle: string; // e.g. "Error Loading Announcements"
  retryButtonLabel: string;

}

export const translations: Record<SupportedLanguage, Translations> = {
  en: {
    appTitle: "School Hub", 
    loginTitle: "Welcome Back!",
    loginDescription: "Log in to manage announcements and school information.",
    adminDashboardTitle: "Admin Dashboard",
    manageClassesTitle: "Manage Classes",
    manageUsersTitle: "Manage Users",
    delegateDashboardTitle: "Delegate Dashboard",
    kioskMainTitle: "Stay Informed",
    kioskMainSubtitle: "Latest school updates at your fingertips.",
    announcementsSectionTitle: "Announcements",
    examsSectionTitle: "Exams",
    deadlinesSectionTitle: "Assignments",
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
    noClassAnnouncementsHint: "No current announcements for this class.",
    noClassExamsHint: "No upcoming exams scheduled for this class.",
    noClassDeadlinesHint: "No assignment deadlines approaching for this class.",
    classNotFoundTitle: "Class Not Found",
    classNotFoundMessage: "The class you are looking for does not exist or is not available.",
    backToHomeButton: "Back to Home",
    delegateIdLabel: "Delegate", 
    noEventsForClassHint: "Looks like this class is on a secret mission! Nothing to show right now.",
    loadingLabel: "Loading...",

    assignedClassesLabel: "Assigned classes",
    noAssignedClassesLabel: "You currently have no classes assigned.",
    editInformationTitle: "Edit Information",
    submitNewInformationTitle: "Submit New Information",
    editingSubmissionDescription: "Editing: \"{title}\"",
    cancelEditButton: "Cancel Edit",
    delegateFormDescription: "Enter announcements, exam schedules, or assignment deadlines for your assigned classes.",
    yourRecentSubmissionsTitle: "Your Recent Submissions",
    noSubmissionsYetHint: "You haven't submitted any information yet, or you have no classes assigned.",
    alertDialogTitle: "Are you absolutely sure?",
    alertDialogDescription: "This action cannot be undone. This will permanently delete your submission titled \"{title}\".",
    cancelButton: "Cancel",
    deleteButton: "Delete",
    submissionUpdatedToastTitle: "Information Updated",
    submissionUpdatedToastDescription: "\"{title}\" has been updated.",
    submissionSubmittedToastTitle: "Information Submitted",
    submissionSubmittedToastDescription: "\"{title}\" has been submitted.",
    submissionDeletedToastTitle: "Submission Deleted",
    submissionDeletedToastDescription: "\"{title}\" has been successfully deleted.",
    announcementTabLabel: "Announcement",
    examTabLabel: "Exam",
    deadlineTabLabel: "Deadline",
    formTitleLabel: "Title",
    formTitlePlaceholder: "Title for {tabName}",
    formDateTimeLabel: "Date and Time",
    formPickDateTimeButton: "Pick date and time",
    formClassLabel: "Class",
    formSelectClassPlaceholder: "Select a class",
    formNoAssignedClassesWarning: "You have no classes assigned to submit information for.",
    formAnnouncementContentLabel: "Announcement Content",
    formAnnouncementContentPlaceholder: "Detailed information...",
    formExamSubjectLabel: "Exam Subject",
    formExamSubjectPlaceholder: "e.g., Mathematics, Physics",
    formDeadlineAssignmentNameLabel: "Assignment Name",
    formDeadlineAssignmentNamePlaceholder: "e.g., History Essay, Science Project",
    formAdditionalDescriptionLabel: "Additional Description (Optional)",
    formAdditionalDescriptionPlaceholder: "Any extra details or notes...",
    formSubmitButton: "Submit Information",
    formUpdateButton: "Update Information",

    editSchoolNameCardTitle: "Edit School Name",
    schoolNameInputLabel: "School Name",
    schoolNameInputPlaceholder: "Enter the name of your school",
    saveSchoolNameButton: "Save Name",
    schoolNameUpdatedToastTitle: "School Name Updated",
    schoolNameUpdatedToastDescription: "The school name has been updated to \"{schoolName}\".",

    editAnnouncementTitle: "Edit Announcement",
    postNewAnnouncementTitle: "Post New School-Wide Announcement",
    editingAnnouncementDescription: "You are editing: \"{title}\"",
    currentAnnouncementsTitle: "Current Announcements",
    noAnnouncementsPostedHint: "No announcements posted yet.",
    schoolWideTarget: "School-wide",
    classesTargetLabel: "Classes",
    targetLabel: "Target",
    editButtonLabel: "Edit",
    deleteButtonLabel: "Delete",
    deleteAnnouncementConfirmation: "This action cannot be undone. This will permanently delete the announcement titled \"{title}\".",
    announcementUpdatedToastTitle: "Announcement Updated!",
    announcementPostedToastTitle: "Announcement Posted!",
    announcementActionSuccessToastDescription: "\"{title}\" has been successfully {action}.",
    updated: "updated",
    posted: "posted",
    announcementDeletedToastTitle: "Announcement Deleted",
    announcementDeletedToastDescription: "The announcement has been successfully deleted.",
    errorDialogTitle: "Error",
    errorFetchingAnnouncements: "Error fetching announcements: {message}",
    errorLoadingAnnouncementsTitle: "Error Loading Announcements",
    retryButtonLabel: "Retry",
  },
  es: {
    appTitle: "Portal Escolar",
    loginTitle: "¡Bienvenido de nuevo!",
    loginDescription: "Inicia sesión para gestionar avisos e información escolar.",
    adminDashboardTitle: "Panel de Administración",
    manageClassesTitle: "Gestionar Clases",
    manageUsersTitle: "Gestionar Usuarios",
    delegateDashboardTitle: "Panel de Delegado",
    kioskMainTitle: "Mantente Informado",
    kioskMainSubtitle: "Últimas actualizaciones de la escuela al alcance de tu mano.",
    announcementsSectionTitle: "Anuncios",
    examsSectionTitle: "Exámenes",
    deadlinesSectionTitle: "Tareas", 
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
    noClassAnnouncementsHint: "No hay anuncios actuales para esta clase.",
    noClassExamsHint: "No hay exámenes programados para esta clase.",
    noClassDeadlinesHint: "No hay fechas de entrega próximas para esta clase.",
    classNotFoundTitle: "Clase no encontrada",
    classNotFoundMessage: "La clase que estás buscando no existe o no está disponible.",
    backToHomeButton: "Volver al Inicio",
    delegateIdLabel: "Delegado/a", 
    noEventsForClassHint: "¡Parece que esta clase está en una misión secreta! No hay nada que mostrar por ahora.",
    loadingLabel: "Cargando...",

    assignedClassesLabel: "Clases asignadas",
    noAssignedClassesLabel: "Actualmente no tienes clases asignadas.",
    editInformationTitle: "Editar Información",
    submitNewInformationTitle: "Enviar Nueva Información",
    editingSubmissionDescription: "Editando: \"{title}\"",
    cancelEditButton: "Cancelar Edición",
    delegateFormDescription: "Introduce anuncios, horarios de exámenes o fechas de entrega para tus clases asignadas.",
    yourRecentSubmissionsTitle: "Tus Envíos Recientes",
    noSubmissionsYetHint: "Aún no has enviado ninguna información, o no tienes clases asignadas.",
    alertDialogTitle: "¿Estás absolutamente seguro?",
    alertDialogDescription: "Esta acción no se puede deshacer. Esto eliminará permanentemente tu envío titulado \"{title}\".",
    cancelButton: "Cancelar",
    deleteButton: "Eliminar",
    submissionUpdatedToastTitle: "Información Actualizada",
    submissionUpdatedToastDescription: "\"{title}\" ha sido actualizado.",
    submissionSubmittedToastTitle: "Información Enviada",
    submissionSubmittedToastDescription: "\"{title}\" ha sido enviado.",
    submissionDeletedToastTitle: "Envío Eliminado",
    submissionDeletedToastDescription: "\"{title}\" ha sido eliminado correctamente.",
    announcementTabLabel: "Anuncio",
    examTabLabel: "Examen",
    deadlineTabLabel: "Plazo",
    formTitleLabel: "Título",
    formTitlePlaceholder: "Título para {tabName}",
    formDateTimeLabel: "Fecha y Hora",
    formPickDateTimeButton: "Elige fecha y hora",
    formClassLabel: "Clase",
    formSelectClassPlaceholder: "Selecciona una clase",
    formNoAssignedClassesWarning: "No tienes clases asignadas para enviar información.",
    formAnnouncementContentLabel: "Contenido del Anuncio",
    formAnnouncementContentPlaceholder: "Información detallada...",
    formExamSubjectLabel: "Asignatura del Examen",
    formExamSubjectPlaceholder: "p.ej., Matemáticas, Física",
    formDeadlineAssignmentNameLabel: "Nombre de la Tarea",
    formDeadlineAssignmentNamePlaceholder: "p.ej., Ensayo de Historia, Proyecto de Ciencias",
    formAdditionalDescriptionLabel: "Descripción Adicional (Opcional)",
    formAdditionalDescriptionPlaceholder: "Cualquier detalle o nota extra...",
    formSubmitButton: "Enviar Información",
    formUpdateButton: "Actualizar Información",

    editSchoolNameCardTitle: "Editar Nombre de la Escuela",
    schoolNameInputLabel: "Nombre de la Escuela",
    schoolNameInputPlaceholder: "Introduce el nombre de tu escuela",
    saveSchoolNameButton: "Guardar Nombre",
    schoolNameUpdatedToastTitle: "Nombre de Escuela Actualizado",
    schoolNameUpdatedToastDescription: "El nombre de la escuela ha sido actualizado a \"{schoolName}\".",

    editAnnouncementTitle: "Editar Anuncio",
    postNewAnnouncementTitle: "Publicar Nuevo Anuncio Escolar",
    editingAnnouncementDescription: "Estás editando: \"{title}\"",
    currentAnnouncementsTitle: "Anuncios Actuales",
    noAnnouncementsPostedHint: "No hay anuncios publicados todavía.",
    schoolWideTarget: "Toda la escuela",
    classesTargetLabel: "Clases",
    targetLabel: "Dirigido a",
    editButtonLabel: "Editar",
    deleteButtonLabel: "Eliminar",
    deleteAnnouncementConfirmation: "Esta acción no se puede deshacer. Esto eliminará permanentemente el anuncio titulado \"{title}\".",
    announcementUpdatedToastTitle: "¡Anuncio Actualizado!",
    announcementPostedToastTitle: "¡Anuncio Publicado!",
    announcementActionSuccessToastDescription: "\"{title}\" ha sido {action} correctamente.",
    updated: "actualizado",
    posted: "publicado",
    announcementDeletedToastTitle: "Anuncio Eliminado",
    announcementDeletedToastDescription: "El anuncio ha sido eliminado correctamente.",
    errorDialogTitle: "Error",
    errorFetchingAnnouncements: "Error al cargar los anuncios: {message}",
    errorLoadingAnnouncementsTitle: "Error al Cargar Anuncios",
    retryButtonLabel: "Reintentar",
  },
  fr: {
    appTitle: "Portail Scolaire",
    loginTitle: "Content de vous revoir!",
    loginDescription: "Connectez-vous pour gérer les annonces et les informations scolaires.",
    adminDashboardTitle: "Tableau de bord Admin",
    manageClassesTitle: "Gérer les Classes",
    manageUsersTitle: "Gérer les Utilisateurs",
    delegateDashboardTitle: "Tableau de bord Délégué",
    kioskMainTitle: "Restez Informé",
    kioskMainSubtitle: "Dernières mises à jour de l'école à portée de main.",
    announcementsSectionTitle: "Annonces",
    examsSectionTitle: "Examens",
    deadlinesSectionTitle: "Devoirs", 
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
    noClassAnnouncementsHint: "Aucune annonce actuelle pour cette classe.",
    noClassExamsHint: "Aucun examen prévu pour cette classe.",
    noClassDeadlinesHint: "Aucune date limite d'affectation approchant pour cette classe.",
    classNotFoundTitle: "Classe non trouvée",
    classNotFoundMessage: "La classe que vous recherchez n'existe pas ou n'est pas disponible.",
    backToHomeButton: "Retour à l'accueil",
    delegateIdLabel: "Délégué(e)", 
    noEventsForClassHint: "On dirait que cette classe est en mission secrète ! Rien à afficher pour le moment.",
    loadingLabel: "Chargement...",

    assignedClassesLabel: "Classes assignées",
    noAssignedClassesLabel: "Vous n'avez actuellement aucune classe assignée.",
    editInformationTitle: "Modifier les Informations",
    submitNewInformationTitle: "Soumettre de Nouvelles Informations",
    editingSubmissionDescription: "Modification de : \"{title}\"",
    cancelEditButton: "Annuler la Modification",
    delegateFormDescription: "Saisissez les annonces, les horaires d'examens ou les dates limites de devoirs pour vos classes assignées.",
    yourRecentSubmissionsTitle: "Vos Soumissions Récentes",
    noSubmissionsYetHint: "Vous n'avez encore soumis aucune information ou vous n'avez aucune classe assignée.",
    alertDialogTitle: "Êtes-vous absolument sûr(e) ?",
    alertDialogDescription: "Cette action est irréversible. Cela supprimera définitivement votre soumission intitulée \"{title}\".",
    cancelButton: "Annuler",
    deleteButton: "Supprimer",
    submissionUpdatedToastTitle: "Informations Mises à Jour",
    submissionUpdatedToastDescription: "\"{title}\" a été mis à jour.",
    submissionSubmittedToastTitle: "Informations Soumises",
    submissionSubmittedToastDescription: "\"{title}\" a été soumis.",
    submissionDeletedToastTitle: "Soumission Supprimée",
    submissionDeletedToastDescription: "\"{title}\"a été supprimé avec succès.",
    announcementTabLabel: "Annonce",
    examTabLabel: "Examen",
    deadlineTabLabel: "Date Limite",
    formTitleLabel: "Titre",
    formTitlePlaceholder: "Titre pour {tabName}",
    formDateTimeLabel: "Date et Heure",
    formPickDateTimeButton: "Choisir date et heure",
    formClassLabel: "Classe",
    formSelectClassPlaceholder: "Sélectionner une classe",
    formNoAssignedClassesWarning: "Vous n'avez aucune classe assignée pour soumettre des informations.",
    formAnnouncementContentLabel: "Contenu de l'Annonce",
    formAnnouncementContentPlaceholder: "Informations détaillées...",
    formExamSubjectLabel: "Matière de l'Examen",
    formExamSubjectPlaceholder: "ex: Mathématiques, Physique",
    formDeadlineAssignmentNameLabel: "Nom du Devoir",
    formDeadlineAssignmentNamePlaceholder: "ex: Dissertation d'Histoire, Projet Scientifique",
    formAdditionalDescriptionLabel: "Description Supplémentaire (Optionnel)",
    formAdditionalDescriptionPlaceholder: "Tout détail ou note supplémentaire...",
    formSubmitButton: "Soumettre les Informations",
    formUpdateButton: "Mettre à Jour les Informations",

    editSchoolNameCardTitle: "Modifier le Nom de l'École",
    schoolNameInputLabel: "Nom de l'École",
    schoolNameInputPlaceholder: "Entrez le nom de votre école",
    saveSchoolNameButton: "Enregistrer le Nom",
    schoolNameUpdatedToastTitle: "Nom de l'École Mis à Jour",
    schoolNameUpdatedToastDescription: "Le nom de l'école a été mis à jour à \"{schoolName}\".",

    editAnnouncementTitle: "Modifier l'Annonce",
    postNewAnnouncementTitle: "Publier une Nouvelle Annonce Scolaire",
    editingAnnouncementDescription: "Vous modifiez : \"{title}\"",
    currentAnnouncementsTitle: "Annonces Actuelles",
    noAnnouncementsPostedHint: "Aucune annonce publiée pour l'instant.",
    schoolWideTarget: "Toute l'école",
    classesTargetLabel: "Classes",
    targetLabel: "Cible",
    editButtonLabel: "Modifier",
    deleteButtonLabel: "Supprimer",
    deleteAnnouncementConfirmation: "Cette action est irréversible. Cela supprimera définitivement l'annonce intitulée \"{title}\".",
    announcementUpdatedToastTitle: "Annonce Mise à Jour !",
    announcementPostedToastTitle: "Annonce Publiée !",
    announcementActionSuccessToastDescription: "\"{title}\" a été {action} avec succès.",
    updated: "mis à jour",
    posted: "publié",
    announcementDeletedToastTitle: "Annonce Supprimée",
    announcementDeletedToastDescription: "L'annonce a été supprimée avec succès.",
    errorDialogTitle: "Erreur",
    errorFetchingAnnouncements: "Erreur lors de la récupération des annonces: {message}",
    errorLoadingAnnouncementsTitle: "Erreur de Chargement des Annonces",
    retryButtonLabel: "Réessayer",
  },
  gl: {
    appTitle: "Portal Escolar",
    loginTitle: "Benvido de novo!",
    loginDescription: "Inicia sesión para xestionar avisos e información escolar.",
    adminDashboardTitle: "Panel de Administración",
    manageClassesTitle: "Xestionar Clases",
    manageUsersTitle: "Xestionar Usuarios",
    delegateDashboardTitle: "Panel de Delegado",
    kioskMainTitle: "Mantente Informado",
    kioskMainSubtitle: "Últimas actualizacións da escola ao teu alcance.",
    announcementsSectionTitle: "Anuncios",
    examsSectionTitle: "Exames", 
    deadlinesSectionTitle: "Tarefas", 
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
    noClassAnnouncementsHint: "Non hai anuncios actuais para esta clase.",
    noClassExamsHint: "Non hai exames programados para esta clase.",
    noClassDeadlinesHint: "Non hai prazos de entrega de tarefas próximos para esta clase.",
    classNotFoundTitle: "Clase Non Atopada",
    classNotFoundMessage: "A clase que buscas non existe ou non está dispoñible.",
    backToHomeButton: "Volver ao Inicio",
    delegateIdLabel: "Delegado/a", 
    noEventsForClassHint: "Parece que esta clase está nunha misión secreta! Non hai nada que amosar polo de agora.",
    loadingLabel: "Cargando...",

    assignedClassesLabel: "Clases asignadas",
    noAssignedClassesLabel: "Actualmente non tes clases asignadas.",
    editInformationTitle: "Editar Información",
    submitNewInformationTitle: "Enviar Nova Información",
    editingSubmissionDescription: "Editando: \"{title}\"",
    cancelEditButton: "Cancelar Edición",
    delegateFormDescription: "Introduce anuncios, horarios de exames ou datas de entrega para as túas clases asignadas.",
    yourRecentSubmissionsTitle: "Os Teus Envíos Recentes",
    noSubmissionsYetHint: "Aínda non enviaches ningunha información, ou non tes clases asignadas.",
    alertDialogTitle: "Estás absolutamente seguro/a?",
    alertDialogDescription: "Esta acción non se pode desfacer. Isto eliminará permanentemente o teu envío titulado \"{title}\".",
    cancelButton: "Cancelar",
    deleteButton: "Eliminar",
    submissionUpdatedToastTitle: "Información Actualizada",
    submissionUpdatedToastDescription: "\"{title}\" foi actualizado.",
    submissionSubmittedToastTitle: "Información Enviada",
    submissionSubmittedToastDescription: "\"{title}\" foi enviado.",
    submissionDeletedToastTitle: "Envío Eliminado",
    submissionDeletedToastDescription: "\"{title}\" foi eliminado correctamente.",
    announcementTabLabel: "Anuncio",
    examTabLabel: "Exame",
    deadlineTabLabel: "Prazo",
    formTitleLabel: "Título",
    formTitlePlaceholder: "Título para {tabName}",
    formDateTimeLabel: "Data e Hora",
    formPickDateTimeButton: "Escolle data e hora",
    formClassLabel: "Clase",
    formSelectClassPlaceholder: "Selecciona unha clase",
    formNoAssignedClassesWarning: "Non tes clases asignadas para enviar información.",
    formAnnouncementContentLabel: "Contido do Anuncio",
    formAnnouncementContentPlaceholder: "Información detallada...",
    formExamSubjectLabel: "Materia do Exame",
    formExamSubjectPlaceholder: "p.ex., Matemáticas, Física",
    formDeadlineAssignmentNameLabel: "Nome da Tarefa",
    formDeadlineAssignmentNamePlaceholder: "p.ex., Ensaio de Historia, Proxecto de Ciencias",
    formAdditionalDescriptionLabel: "Descrición Adicional (Opcional)",
    formAdditionalDescriptionPlaceholder: "Calquera detalle ou nota extra...",
    formSubmitButton: "Enviar Información",
    formUpdateButton: "Actualizar Información",

    editSchoolNameCardTitle: "Editar Nome da Escola",
    schoolNameInputLabel: "Nome da Escola",
    schoolNameInputPlaceholder: "Introduce o nome da túa escola",
    saveSchoolNameButton: "Gardar Nome",
    schoolNameUpdatedToastTitle: "Nome da Escola Actualizado",
    schoolNameUpdatedToastDescription: "O nome da escola actualizouse a \"{schoolName}\".",
    
    editAnnouncementTitle: "Editar Anuncio",
    postNewAnnouncementTitle: "Publicar Novo Anuncio Escolar",
    editingAnnouncementDescription: "Estás a editar: \"{title}\"",
    currentAnnouncementsTitle: "Anuncios Actuais",
    noAnnouncementsPostedHint: "Aínda non hai anuncios publicados.",
    schoolWideTarget: "Toda a escola",
    classesTargetLabel: "Clases",
    targetLabel: "Dirixido a",
    editButtonLabel: "Editar",
    deleteButtonLabel: "Eliminar",
    deleteAnnouncementConfirmation: "Esta acción non se pode desfacer. Eliminarase permanentemente o anuncio titulado \"{title}\".",
    announcementUpdatedToastTitle: "Anuncio Actualizado!",
    announcementPostedToastTitle: "Anuncio Publicado!",
    announcementActionSuccessToastDescription: "\"{title}\" foi {action} correctamente.",
    updated: "actualizado",
    posted: "publicado",
    announcementDeletedToastTitle: "Anuncio Eliminado",
    announcementDeletedToastDescription: "O anuncio eliminouse correctamente.",
    errorDialogTitle: "Erro",
    errorFetchingAnnouncements: "Erro ao obter os anuncios: {message}",
    errorLoadingAnnouncementsTitle: "Erro ao Cargar os Anuncios",
    retryButtonLabel: "Reintentar",
  },
};

export type TranslationKey = keyof Translations;
export type TranslationVariables = { [key: string]: string | number | undefined };

// Helper function type for the 't' function to allow for variables
export type TFunction = (key: TranslationKey, variables?: TranslationVariables) => string;
