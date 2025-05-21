
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
  announcementsSectionTitle: string; 
  examsSectionTitle: string; 
  deadlinesSectionTitle: string; 
  checkBackLaterHint: string; 
  viewClassesButtonLabel: string;
  noClassesHint: string;
  loginButtonLabel: string;
  classPageTitle: string; 
  classNotFoundTitle: string;
  classNotFoundMessage: string;
  backToHomeButton: string;
  delegateIdLabel: string; 
  noEventsForClassHint: string; 
  loadingLabel: string;
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
  errorLoadingSubmissionsTitle: string;
  noAssignedClassesToSubmitHint: string;
  announcementTabLabel: string;
  examTabLabel: string;
  deadlineTabLabel: string;
  formTitleLabel: string;
  formTitlePlaceholder: string; 
  formDateTimeLabel: string;
  formPickDateTimeButton: string;
  formSelectTimeLabel: string;
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
  editSchoolNameCardTitle: string;
  schoolNameInputLabel: string;
  schoolNameInputPlaceholder: string;
  saveSchoolNameButton: string;
  schoolNameUpdatedToastTitle: string;
  schoolNameUpdatedToastDescription: string; 
  editAnnouncementTitle: string;
  postNewAnnouncementTitle: string;
  editingAnnouncementDescription: string; 
  currentAnnouncementsTitle: string;
  noAnnouncementsPostedHint: string;
  schoolWideTarget: string;
  classesTargetLabel: string; 
  targetLabel: string; 
  editButtonLabel: string;
  deleteButtonLabel: string;
  deleteAnnouncementConfirmation: string; 
  announcementUpdatedToastTitle: string;
  announcementPostedToastTitle: string;
  announcementActionSuccessToastDescription: string; 
  updated: string; 
  posted: string; 
  announcementDeletedToastTitle: string;
  announcementDeletedToastDescription: string;
  errorDialogTitle: string; 
  errorFetchingAnnouncements: string; 
  errorLoadingAnnouncementsTitle: string; 
  retryButtonLabel: string;
  userUpdatedToastTitle: string; 
  userCreatedToastTitle: string; 
  userActionSuccessToastDescription: string; 
  actionProhibitedToastTitle: string; 
  cannotDeleteDefaultAdminToastDescription: string; 
  userDeletedToastTitle: string; 
  userDeletedToastDescription: string; 
  editUserAccountTitle: string; 
  createNewUserAccountTitle: string; 
  editingUserAccountDescription: string; 
  existingUsersTitle: string; 
  errorLoadingUsersTitle: string; 
  noUsersCreatedHint: string; 
  userNameTableHeader: string; 
  usernameTableHeader: string; 
  userRoleTableHeader: string; 
  actionsTableHeader: string; 
  adminRoleLabel: string; 
  delegateRoleLabel: string; 
  editUserButtonLabel: string; 
  deleteUserButtonLabel: string; 
  deleteUserConfirmation: string; 
  userNamePlaceholder: string; 
  usernamePlaceholder: string; 
  usernameEditWarning: string; 
  selectRolePlaceholder: string; 
  newPasswordOptionalLabel: string; 
  passwordLabel: string; 
  passwordEditHint: string; 
  updateUserButton: string; 
  createUserButton: string; 
  passwordRequiredForNewUser: string; 
  classNameLabel: string; 
  classNamePlaceholder: string; 
  classDelegateLabel: string; 
  optionalLabel: string; 
  loadingDelegatesPlaceholder: string; 
  selectDelegatePlaceholder: string; 
  noDelegateOption: string; 
  noDelegatesAvailableHint: string; 
  updateClassButton: string; 
  createClassButton: string; 
  errorFetchingDelegates: string; 
  globalLanguageSettingsCardTitle: string;
  globalLanguageSelectLabel: string;
  selectLanguagePlaceholder: string;
  saveGlobalLanguageButton: string;
  globalLanguageUpdatedToastTitle: string;
  globalLanguageUpdatedToastDescription: string;
  activityByClassSectionTitle: string;
  messagesCountLabel: string; 
  noClassActivityHint: string; 
  noClassesAvailableForActivity: string; 
  noEventsGeneralHint: string;
  dashboardMenuItemLabel: string; // New key
  logoutButtonLabel: string; // New key for logout button
}

export const translations: Record<SupportedLanguage, Translations> = {
  en: {
    appTitle: "IES Monte da Vila", 
    loginTitle: "Welcome Back!",
    loginDescription: "Log in to manage announcements and school information.",
    adminDashboardTitle: "Admin Dashboard",
    manageClassesTitle: "Manage Classes",
    manageUsersTitle: "Manage Users",
    delegateDashboardTitle: "Delegate Dashboard",
    announcementsSectionTitle: "Announcements", 
    examsSectionTitle: "Exams", 
    deadlinesSectionTitle: "Assignments", 
    checkBackLaterHint: "Please check back later for updates.", 
    viewClassesButtonLabel: "View Classes",
    noClassesHint: "No classes available",
    loginButtonLabel: "Login",
    classPageTitle: "Events for {className}", 
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
    noSubmissionsYetHint: "You haven't submitted any information yet.",
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
    errorLoadingSubmissionsTitle: "Error Loading Submissions",
    noAssignedClassesToSubmitHint: "You have no classes assigned to submit information for.",
    announcementTabLabel: "Announcement",
    examTabLabel: "Exam",
    deadlineTabLabel: "Deadline",
    formTitleLabel: "Title",
    formTitlePlaceholder: "Title for {tabName}",
    formDateTimeLabel: "Date and Time",
    formPickDateTimeButton: "Pick date and time",
    formSelectTimeLabel: "Select time",
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
    userUpdatedToastTitle: "User \"{name}\" Updated!",
    userCreatedToastTitle: "User \"{name}\" Created!",
    userActionSuccessToastDescription: "Account for \"{name}\" has been successfully {action}.",
    actionProhibitedToastTitle: "Action Prohibited",
    cannotDeleteDefaultAdminToastDescription: "This demo admin user cannot be deleted.",
    userDeletedToastTitle: "User \"{name}\" Deleted",
    userDeletedToastDescription: "The user account has been successfully deleted.",
    editUserAccountTitle: "Edit User Account",
    createNewUserAccountTitle: "Create New User Account",
    editingUserAccountDescription: "You are editing account for: \"{name}\".",
    existingUsersTitle: "Existing Users",
    errorLoadingUsersTitle: "Error Loading Users",
    noUsersCreatedHint: "No users created yet.",
    userNameTableHeader: "Name",
    usernameTableHeader: "Username",
    userRoleTableHeader: "Role",
    actionsTableHeader: "Actions",
    adminRoleLabel: "Admin",
    delegateRoleLabel: "Delegate",
    editUserButtonLabel: "Edit User",
    deleteUserButtonLabel: "Delete User",
    deleteUserConfirmation: "This action cannot be undone. This will permanently delete the user account for \"{name}\".",
    userNamePlaceholder: "e.g., John Doe",
    usernamePlaceholder: "e.g., johndoe",
    usernameEditWarning: "Username can be changed, but ensure it remains unique.",
    selectRolePlaceholder: "Select a role",
    newPasswordOptionalLabel: "New Password (Optional)",
    passwordLabel: "Password",
    passwordEditHint: "Leave blank to keep current password.",
    updateUserButton: "Update User",
    createUserButton: "Create User",
    passwordRequiredForNewUser: "Password is required for new users.",
    classNameLabel: "Class Name",
    classNamePlaceholder: "e.g., Grade 10A, Computer Science Club",
    classDelegateLabel: "Delegate",
    optionalLabel: "Optional",
    loadingDelegatesPlaceholder: "Loading delegates...",
    selectDelegatePlaceholder: "Select a delegate",
    noDelegateOption: "None",
    noDelegatesAvailableHint: "No delegates available to assign. Create delegate users first.",
    updateClassButton: "Update Class",
    createClassButton: "Create Class",
    errorFetchingDelegates: "Error fetching delegates: {message}",
    globalLanguageSettingsCardTitle: "Global Language Settings",
    globalLanguageSelectLabel: "Set Global Application Language",
    selectLanguagePlaceholder: "Select a language",
    saveGlobalLanguageButton: "Save Global Language",
    globalLanguageUpdatedToastTitle: "Global Language Updated",
    globalLanguageUpdatedToastDescription: "The global application language has been set to {languageName}.",
    activityByClassSectionTitle: "Activity by Class",
    messagesCountLabel: "{count} messages",
    noClassActivityHint: "No recent activity in any class.",
    noClassesAvailableForActivity: "No classes configured to show activity.",
    noEventsGeneralHint: "No announcements, exams, or deadlines to display at the moment.",
    dashboardMenuItemLabel: "Dashboard",
    logoutButtonLabel: "Log out",
  },
  es: {
    appTitle: "IES Monte da Vila",
    loginTitle: "¡Bienvenido de nuevo!",
    loginDescription: "Inicia sesión para gestionar avisos e información escolar.",
    adminDashboardTitle: "Panel de Administración",
    manageClassesTitle: "Gestionar Clases",
    manageUsersTitle: "Gestionar Usuarios",
    delegateDashboardTitle: "Panel de Delegado",
    announcementsSectionTitle: "Anuncios", 
    examsSectionTitle: "Exámenes", 
    deadlinesSectionTitle: "Tareas", 
    checkBackLaterHint: "Por favor, vuelve a consultarlo más tarde para actualizaciones.", 
    viewClassesButtonLabel: "Ver Clases",
    noClassesHint: "No hay clases disponibles",
    loginButtonLabel: "Iniciar Sesión",
    classPageTitle: "Eventos para {className}",
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
    noSubmissionsYetHint: "Aún no has enviado ninguna información.",
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
    errorLoadingSubmissionsTitle: "Error al Cargar Envíos",
    noAssignedClassesToSubmitHint: "No tienes clases asignadas para enviar información.",
    announcementTabLabel: "Anuncio",
    examTabLabel: "Examen",
    deadlineTabLabel: "Plazo",
    formTitleLabel: "Título",
    formTitlePlaceholder: "Título para {tabName}",
    formDateTimeLabel: "Fecha y Hora",
    formPickDateTimeButton: "Elige fecha y hora",
    formSelectTimeLabel: "Seleccionar hora",
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
    userUpdatedToastTitle: "¡Usuario \"{name}\" Actualizado!",
    userCreatedToastTitle: "¡Usuario \"{name}\" Creado!",
    userActionSuccessToastDescription: "La cuenta de \"{name}\" ha sido {action} correctamente.",
    actionProhibitedToastTitle: "Acción Prohibida",
    cannotDeleteDefaultAdminToastDescription: "Este usuario administrador de demostración no se puede eliminar.",
    userDeletedToastTitle: "Usuario \"{name}\" Eliminado",
    userDeletedToastDescription: "La cuenta de usuario ha sido eliminada correctamente.",
    editUserAccountTitle: "Editar Cuenta de Usuario",
    createNewUserAccountTitle: "Crear Nueva Cuenta de Usuario",
    editingUserAccountDescription: "Estás editando la cuenta de: \"{name}\".",
    existingUsersTitle: "Usuarios Existentes",
    errorLoadingUsersTitle: "Error al Cargar Usuarios",
    noUsersCreatedHint: "No hay usuarios creados todavía.",
    userNameTableHeader: "Nombre",
    usernameTableHeader: "Usuario",
    userRoleTableHeader: "Rol",
    actionsTableHeader: "Acciones",
    adminRoleLabel: "Admin",
    delegateRoleLabel: "Delegado",
    editUserButtonLabel: "Editar Usuario",
    deleteUserButtonLabel: "Eliminar Usuario",
    deleteUserConfirmation: "Esta acción no se puede deshacer. Esto eliminará permanentemente la cuenta de usuario de \"{name}\".",
    userNamePlaceholder: "p.ej., Juan Pérez",
    usernamePlaceholder: "p.ej., juan.perez",
    usernameEditWarning: "El nombre de usuario se puede cambiar, pero asegúrate de que siga siendo único.",
    selectRolePlaceholder: "Selecciona un rol",
    newPasswordOptionalLabel: "Nueva Contraseña (Opcional)",
    passwordLabel: "Contraseña",
    passwordEditHint: "Deja en blanco para mantener la contraseña actual.",
    updateUserButton: "Actualizar Usuario",
    createUserButton: "Crear Usuario",
    passwordRequiredForNewUser: "La contraseña es obligatoria para nuevos usuarios.",
    classNameLabel: "Nombre de la Clase",
    classNamePlaceholder: "p.ej., 1º ESO A, Club de Informática",
    classDelegateLabel: "Delegado",
    optionalLabel: "Opcional",
    loadingDelegatesPlaceholder: "Cargando delegados...",
    selectDelegatePlaceholder: "Selecciona un delegado",
    noDelegateOption: "Ninguno",
    noDelegatesAvailableHint: "No hay delegados disponibles para asignar. Crea usuarios delegados primero.",
    updateClassButton: "Actualizar Clase",
    createClassButton: "Crear Clase",
    errorFetchingDelegates: "Error al obtener delegados: {message}",
    globalLanguageSettingsCardTitle: "Configuración Global de Idioma",
    globalLanguageSelectLabel: "Establecer Idioma Global de la Aplicación",
    selectLanguagePlaceholder: "Seleccionar un idioma",
    saveGlobalLanguageButton: "Guardar Idioma Global",
    globalLanguageUpdatedToastTitle: "Idioma Global Actualizado",
    globalLanguageUpdatedToastDescription: "El idioma global de la aplicación se ha establecido a {languageName}.",
    activityByClassSectionTitle: "Actividad por Clase",
    messagesCountLabel: "{count} mensajes",
    noClassActivityHint: "No hay actividad reciente en ninguna clase.",
    noClassesAvailableForActivity: "No hay clases configuradas para mostrar actividad.",
    noEventsGeneralHint: "No hay anuncios, exámenes o plazos para mostrar en este momento.",
    dashboardMenuItemLabel: "Panel",
    logoutButtonLabel: "Cerrar Sesión",
  },
  fr: {
    appTitle: "IES Monte da Vila",
    loginTitle: "Content de vous revoir!",
    loginDescription: "Connectez-vous pour gérer les annonces et les informations scolaires.",
    adminDashboardTitle: "Tableau de bord Admin",
    manageClassesTitle: "Gérer les Classes",
    manageUsersTitle: "Gérer les Utilisateurs",
    delegateDashboardTitle: "Tableau de bord Délégué",
    announcementsSectionTitle: "Annonces", 
    examsSectionTitle: "Examens", 
    deadlinesSectionTitle: "Devoirs",  
    checkBackLaterHint: "Veuillez revenir plus tard pour les mises à jour.", 
    viewClassesButtonLabel: "Voir les Classes",
    noClassesHint: "Aucune classe disponible",
    loginButtonLabel: "Connexion",
    classPageTitle: "Événements pour {className}",
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
    noSubmissionsYetHint: "Vous n'avez encore soumis aucune information.",
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
    errorLoadingSubmissionsTitle: "Erreur de Chargement des Soumissions",
    noAssignedClassesToSubmitHint: "Vous n'avez aucune classe assignée pour laquelle soumettre des informations.",
    announcementTabLabel: "Annonce",
    examTabLabel: "Examen",
    deadlineTabLabel: "Date Limite",
    formTitleLabel: "Titre",
    formTitlePlaceholder: "Titre pour {tabName}",
    formDateTimeLabel: "Date et Heure",
    formPickDateTimeButton: "Choisir date et heure",
    formSelectTimeLabel: "Sélectionner l'heure",
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
    userUpdatedToastTitle: "Utilisateur \"{name}\" Mis à Jour !",
    userCreatedToastTitle: "Utilisateur \"{name}\" Créé !",
    userActionSuccessToastDescription: "Le compte de \"{name}\" a été {action} avec succès.",
    actionProhibitedToastTitle: "Action Interdite",
    cannotDeleteDefaultAdminToastDescription: "Cet utilisateur admin de démonstration ne peut pas être supprimé.",
    userDeletedToastTitle: "Utilisateur \"{name}\" Supprimé",
    userDeletedToastDescription: "Le compte utilisateur a été supprimé avec succès.",
    editUserAccountTitle: "Modifier le Compte Utilisateur",
    createNewUserAccountTitle: "Créer un Nouveau Compte Utilisateur",
    editingUserAccountDescription: "Vous modifiez le compte de : \"{name}\".",
    existingUsersTitle: "Utilisateurs Existants",
    errorLoadingUsersTitle: "Erreur de Chargement des Utilisateurs",
    noUsersCreatedHint: "Aucun utilisateur créé pour l'instant.",
    userNameTableHeader: "Nom",
    usernameTableHeader: "Nom d'utilisateur",
    userRoleTableHeader: "Rôle",
    actionsTableHeader: "Actions",
    adminRoleLabel: "Admin",
    delegateRoleLabel: "Délégué",
    editUserButtonLabel: "Modifier Utilisateur",
    deleteUserButtonLabel: "Supprimer Utilisateur",
    deleteUserConfirmation: "Cette action est irréversible. Cela supprimera définitiveiment le compte utilisateur de \"{name}\".",
    userNamePlaceholder: "ex: Jean Dupont",
    usernamePlaceholder: "ex: jeandupont",
    usernameEditWarning: "Le nom d'utilisateur peut être modifié, mais assurez-vous qu'il reste unique.",
    selectRolePlaceholder: "Sélectionner un rôle",
    newPasswordOptionalLabel: "Nouveau Mot de Passe (Optionnel)",
    passwordLabel: "Mot de Passe",
    passwordEditHint: "Laissez vide pour conserver le mot de passe actuel.",
    updateUserButton: "Mettre à Jour Utilisateur",
    createUserButton: "Créer Utilisateur",
    passwordRequiredForNewUser: "Le mot de passe est requis pour les nouveaux utilisateurs.",
    classNameLabel: "Nom de la Classe",
    classNamePlaceholder: "ex: Seconde A, Club d'Informatique",
    classDelegateLabel: "Délégué",
    optionalLabel: "Optionnel",
    loadingDelegatesPlaceholder: "Chargement des délégués...",
    selectDelegatePlaceholder: "Sélectionner un délégué",
    noDelegateOption: "Aucun",
    noDelegatesAvailableHint: "Aucun délégué disponible à assigner. Créez d'abord des utilisateurs délégués.",
    updateClassButton: "Mettre à Jour Classe",
    createClassButton: "Créer Classe",
    errorFetchingDelegates: "Erreur lors de la récupération des délégués: {message}",
    globalLanguageSettingsCardTitle: "Paramètres Globaux de Langue",
    globalLanguageSelectLabel: "Définir la Langue Globale de l'Application",
    selectLanguagePlaceholder: "Sélectionner une langue",
    saveGlobalLanguageButton: "Enregistrer la Langue Globale",
    globalLanguageUpdatedToastTitle: "Langue Globale Mise à Jour",
    globalLanguageUpdatedToastDescription: "La langue globale de l'application a été définie sur {languageName}.",
    activityByClassSectionTitle: "Activité par Classe",
    messagesCountLabel: "{count} messages",
    noClassActivityHint: "Aucune activité récente dans aucune classe.",
    noClassesAvailableForActivity: "Aucune classe configurée pour afficher l'activité.",
    noEventsGeneralHint: "Aucune annonce, aucun examen ou aucun délai à afficher pour le moment.",
    dashboardMenuItemLabel: "Tableau de bord",
    logoutButtonLabel: "Déconnexion",
  },
  gl: {
    appTitle: "IES Monte da Vila",
    loginTitle: "Benvido de novo!",
    loginDescription: "Inicia sesión para xestionar avisos e información escolar.",
    adminDashboardTitle: "Panel de Administración",
    manageClassesTitle: "Xestionar Clases",
    manageUsersTitle: "Xestionar Usuarios",
    delegateDashboardTitle: "Panel de Delegado",
    announcementsSectionTitle: "Anuncios", 
    examsSectionTitle: "Exames",  
    deadlinesSectionTitle: "Tarefas",  
    checkBackLaterHint: "Por favor, volve máis tarde para ver actualizacións.", 
    viewClassesButtonLabel: "Ver Clases",
    noClassesHint: "Non hai clases dispoñibles",
    loginButtonLabel: "Iniciar Sesión",
    classPageTitle: "Eventos para {className}",
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
    noSubmissionsYetHint: "Aínda non enviaches ningunha información.",
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
    errorLoadingSubmissionsTitle: "Erro ao Cargar Envíos",
    noAssignedClassesToSubmitHint: "Non tes clases asignadas para enviar información.",
    announcementTabLabel: "Anuncio",
    examTabLabel: "Exame",
    deadlineTabLabel: "Prazo",
    formTitleLabel: "Título",
    formTitlePlaceholder: "Título para {tabName}",
    formDateTimeLabel: "Data e Hora",
    formPickDateTimeButton: "Escolle data e hora",
    formSelectTimeLabel: "Seleccionar hora",
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
    userUpdatedToastTitle: "Usuario \"{name}\" Actualizado!",
    userCreatedToastTitle: "Usuario \"{name}\" Creado!",
    userActionSuccessToastDescription: "A conta de \"{name}\" foi {action} correctamente.",
    actionProhibitedToastTitle: "Acción Prohibida",
    cannotDeleteDefaultAdminToastDescription: "Este usuario administrador de demostración non se pode eliminar.",
    userDeletedToastTitle: "Usuario \"{name}\" Eliminado",
    userDeletedToastDescription: "A conta de usuario eliminouse correctamente.",
    editUserAccountTitle: "Editar Conta de Usuario",
    createNewUserAccountTitle: "Crear Nova Conta de Usuario",
    editingUserAccountDescription: "Estás a editar a conta de: \"{name}\".",
    existingUsersTitle: "Usuarios Existentes",
    errorLoadingUsersTitle: "Erro ao Cargar Usuarios",
    noUsersCreatedHint: "Aínda non hai usuarios creados.",
    userNameTableHeader: "Nome",
    usernameTableHeader: "Usuario",
    userRoleTableHeader: "Rol",
    actionsTableHeader: "Accións",
    adminRoleLabel: "Admin",
    delegateRoleLabel: "Delegado",
    editUserButtonLabel: "Editar Usuario",
    deleteUserButtonLabel: "Eliminar Usuario",
    deleteUserConfirmation: "Esta acción non se pode desfacer. Eliminarase permanentemente a conta de usuario de \"{name}\".",
    userNamePlaceholder: "p.ex., Xoán Ninguén",
    usernamePlaceholder: "p.ex., xoan.ninguen",
    usernameEditWarning: "O nome de usuario pode cambiarse, pero asegúrate de que siga sendo único.",
    selectRolePlaceholder: "Selecciona un rol",
    newPasswordOptionalLabel: "Novo Contrasinal (Opcional)",
    passwordLabel: "Contrasinal",
    passwordEditHint: "Deixa en branco para manter o contrasinal actual.",
    updateUserButton: "Actualizar Usuario",
    createUserButton: "Crear Usuario",
    passwordRequiredForNewUser: "O contrasinal é obrigatorio para novos usuarios.",
    classNameLabel: "Nome da Clase",
    classNamePlaceholder: "p.ex., 1º ESO A, Club de Informática",
    classDelegateLabel: "Delegado",
    optionalLabel: "Opcional",
    loadingDelegatesPlaceholder: "Cargando delegados...",
    selectDelegatePlaceholder: "Selecciona un delegado",
    noDelegateOption: "Ningún",
    noDelegatesAvailableHint: "Non hai delegados dispoñibles para asignar. Crea usuarios delegados primeiro.",
    updateClassButton: "Actualizar Clase",
    createClassButton: "Crear Clase",
    errorFetchingDelegates: "Erro ao obter delegados: {message}",
    globalLanguageSettingsCardTitle: "Configuración Global de Idioma",
    globalLanguageSelectLabel: "Establecer Idioma Global da Aplicación",
    selectLanguagePlaceholder: "Seleccionar un idioma",
    saveGlobalLanguageButton: "Gardar Idioma Global",
    globalLanguageUpdatedToastTitle: "Idioma Global Actualizado",
    globalLanguageUpdatedToastDescription: "O idioma global da aplicación estableceuse a {languageName}.",
    activityByClassSectionTitle: "Actividade por Aula",
    messagesCountLabel: "{count} mensaxes",
    noClassActivityHint: "Non hai actividade recente en ningunha aula.",
    noClassesAvailableForActivity: "Non hai aulas configuradas para mostrar actividade.",
    noEventsGeneralHint: "Non hai anuncios, exames ou prazos para amosar neste momento.",
    dashboardMenuItemLabel: "Panel",
    logoutButtonLabel: "Pechar Sesión",
  },
};

export type TranslationKey = keyof Translations[SupportedLanguage];
export type TranslationVariables = { [key: string]: string | number | undefined };

// Helper function type for the 't' function to allow for variables
export type TFunction = (key: TranslationKey, variables?: TranslationVariables) => string;
