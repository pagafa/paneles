
"use client";

import { AdminAnnouncementForm } from "@/components/forms/AdminAnnouncementForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import type { Announcement, SchoolClass, SupportedLanguage } from "@/types";
import { format } from "date-fns";
import { Megaphone, Edit3, Trash2, Settings, Save, AlertTriangle, Globe } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/context/LanguageContext";
import { useSchoolName } from "@/context/SchoolNameContext";
import { Skeleton } from "@/components/ui/skeleton";
import { supportedLanguages, defaultLanguage } from "@/lib/i18n";

const sortAnnouncements = (announcements: Announcement[]) => {
  return [...announcements].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

const ADMIN_GLOBAL_LANGUAGE_KEY = 'adminGlobalAppLanguage';

export default function AdminDashboardPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  const [allClasses, setAllClasses] = useState<SchoolClass[]>([]); 
  const [isLoadingAnnouncements, setIsLoadingAnnouncements] = useState(true);
  const [isLoadingClasses, setIsLoadingClasses] = useState(true);
  const [errorAnnouncements, setErrorAnnouncements] = useState<string | null>(null);
  const [errorClasses, setErrorClasses] = useState<string | null>(null);
  
  const { toast } = useToast();
  const { language: currentSessionLanguage, setLanguage: setSessionLanguage, t } = useLanguage();
  const { schoolName, setSchoolName: setGlobalSchoolName } = useSchoolName(); // Renamed to avoid conflict
  const [editableSchoolName, setEditableSchoolName] = useState(schoolName);
  const [selectedGlobalLanguage, setSelectedGlobalLanguage] = useState<SupportedLanguage>(defaultLanguage);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedAdminLang = localStorage.getItem(ADMIN_GLOBAL_LANGUAGE_KEY) as SupportedLanguage;
      if (storedAdminLang && supportedLanguages.includes(storedAdminLang)) {
        setSelectedGlobalLanguage(storedAdminLang);
      } else {
        setSelectedGlobalLanguage(currentSessionLanguage); // Default to current session if no admin global is set
      }
    }
  }, [currentSessionLanguage]);


  const fetchAnnouncements = useCallback(async () => {
    setIsLoadingAnnouncements(true);
    setErrorAnnouncements(null);
    try {
      const response = await fetch('/api/announcements');
      if (!response.ok) {
        let errorMessage = `Failed to fetch announcements. Status: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (e) { /* Ignore if response is not JSON */ }
        throw new Error(errorMessage);
      }
      const data: Announcement[] = await response.json();
      setAnnouncements(sortAnnouncements(data));
    } catch (err) {
      console.error(err);
      setErrorAnnouncements(t('errorFetchingAnnouncements', { message: (err as Error).message }) || 'Failed to load announcements. Please try again.');
      setAnnouncements([]);
    } finally {
      setIsLoadingAnnouncements(false);
    }
  }, [t]);

  const fetchAllClasses = useCallback(async () => {
    setIsLoadingClasses(true);
    setErrorClasses(null);
    try {
      const response = await fetch('/api/classes');
      if (!response.ok) {
         const errorData = await response.json().catch(() => ({ message: `Failed to fetch classes. Status: ${response.status}` }));
        throw new Error(errorData.message || `Failed to fetch classes. Status: ${response.status}`);
      }
      const data: SchoolClass[] = await response.json();
      setAllClasses(data);
    } catch (err) {
      console.error('Error fetching classes for admin form:', err);
      setErrorClasses((err as Error).message);
      setAllClasses([]);
    } finally {
      setIsLoadingClasses(false);
    }
  }, []);


  useEffect(() => {
    fetchAnnouncements();
    fetchAllClasses();
  }, [fetchAnnouncements, fetchAllClasses]);

  useEffect(() => {
    setEditableSchoolName(schoolName);
  }, [schoolName]);

  const handleFormSubmit = async (data: Announcement) => {
    const isEditing = !!editingAnnouncement;
    const url = isEditing ? `/api/announcements/${data.id}` : '/api/announcements';
    const method = isEditing ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        let errorMessage = `Failed to ${isEditing ? 'update' : 'post'} announcement. Status: ${response.status}`;
        try {
            const errorData = await response.json();
            errorMessage = errorData.message || errorMessage;
        } catch (e) { /* Ignore */ }
        throw new Error(errorMessage);
      }
      
      setEditingAnnouncement(null);
      await fetchAnnouncements(); 
    } catch (err) {
      console.error(err);
      toast({
        title: t('errorDialogTitle'),
        description: (err as Error).message,
        variant: "destructive",
      });
    }
  };

  const handleEdit = (announcement: Announcement) => {
    setEditingAnnouncement(announcement);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (announcementId: string) => {
    try {
      const response = await fetch(`/api/announcements/${announcementId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        let errorMessage = `Failed to delete announcement. Status: ${response.status}`;
        try {
            const errorData = await response.json();
            errorMessage = errorData.message || errorMessage;
        } catch (e) { /* Ignore */ }
        throw new Error(errorMessage);
      }
      toast({
        title: t('announcementDeletedToastTitle'),
        description: t('announcementDeletedToastDescription'),
        variant: "destructive"
      });
      await fetchAnnouncements(); 
    } catch (err) {
       console.error(err);
       toast({
        title: t('errorDialogTitle'),
        description: (err as Error).message,
        variant: "destructive",
      });
    }
  };

  const handleSchoolNameSave = () => {
    setGlobalSchoolName(editableSchoolName.trim()); // Use the renamed context function
    toast({
      title: t('schoolNameUpdatedToastTitle'),
      description: t('schoolNameUpdatedToastDescription', { schoolName: editableSchoolName.trim() || "My School" }),
    });
  };
  
  const handleGlobalLanguageSave = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(ADMIN_GLOBAL_LANGUAGE_KEY, selectedGlobalLanguage);
    }
    // Also update the current admin's session language for immediate feedback
    setSessionLanguage(selectedGlobalLanguage); 
    toast({
      title: t('globalLanguageUpdatedToastTitle'),
      description: t('globalLanguageUpdatedToastDescription', { languageName: selectedGlobalLanguage.toUpperCase() }),
    });
  };


  const getTargetDisplay = (targetClassIds?: string[]): string => {
    if (!targetClassIds || targetClassIds.length === 0) {
      return t('schoolWideTarget');
    }
    const targetedClassNames = targetClassIds.map(id => {
      const cls = allClasses.find(c => c.id === id); 
      return cls ? cls.name : id;
    }).join(', ');
    return `${t('classesTargetLabel')}: ${targetedClassNames}`;
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8 text-primary">{t('adminDashboardTitle')}</h1>
      
      <Card className="mb-8 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <Settings className="h-6 w-6 text-accent" />
            {t('editSchoolNameCardTitle')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="schoolNameInput">{t('schoolNameInputLabel')}</Label>
              <Input
                id="schoolNameInput"
                value={editableSchoolName}
                onChange={(e) => setEditableSchoolName(e.target.value)}
                placeholder={t('schoolNameInputPlaceholder')}
                className="mt-1"
              />
            </div>
            <Button onClick={handleSchoolNameSave}>
              <Save className="mr-2 h-4 w-4" />
              {t('saveSchoolNameButton')}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-8 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <Globe className="h-6 w-6 text-accent" />
            {t('globalLanguageSettingsCardTitle')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="globalLanguageSelect">{t('globalLanguageSelectLabel')}</Label>
              <Select 
                value={selectedGlobalLanguage} 
                onValueChange={(value) => setSelectedGlobalLanguage(value as SupportedLanguage)}
              >
                <SelectTrigger id="globalLanguageSelect" className="mt-1">
                  <SelectValue placeholder={t('selectLanguagePlaceholder')} />
                </SelectTrigger>
                <SelectContent>
                  {supportedLanguages.map(lang => (
                    <SelectItem key={lang} value={lang}>
                      {lang.toUpperCase()} {/* Consider adding full language names in i18n later */}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleGlobalLanguageSave}>
              <Save className="mr-2 h-4 w-4" />
              {t('saveGlobalLanguageButton')}
            </Button>
          </div>
        </CardContent>
      </Card>


      <Card className="mb-8 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <Megaphone className="h-6 w-6 text-accent" />
            {editingAnnouncement ? t('editAnnouncementTitle') : t('postNewAnnouncementTitle')}
          </CardTitle>
          {editingAnnouncement && (
            <CardDescription>
              {t('editingAnnouncementDescription', { title: editingAnnouncement.title })} <Button variant="link" size="sm" onClick={() => setEditingAnnouncement(null)}>{t('cancelEditButton')}</Button>
            </CardDescription>
          )}
        </CardHeader>
        <CardContent>
          {isLoadingClasses && <Skeleton className="h-40 w-full" />}
          {errorClasses && !isLoadingClasses && (
             <p className="text-sm text-destructive">Error loading classes for form: {errorClasses}. Some features might be unavailable.</p>
          )}
          {!isLoadingClasses && !errorClasses && (
            <AdminAnnouncementForm 
              onSubmitSuccess={handleFormSubmit} 
              initialData={editingAnnouncement || undefined}
              availableClasses={allClasses} 
              key={editingAnnouncement ? editingAnnouncement.id : 'new'}
            />
          )}
        </CardContent>
      </Card>

      <Separator className="my-8" />

      <h2 className="text-2xl font-semibold mb-6">{t('currentAnnouncementsTitle')}</h2>
      {isLoadingAnnouncements && (
        <div className="space-y-4">
          <Skeleton className="h-24 w-full rounded-md" />
          <Skeleton className="h-24 w-full rounded-md" />
          <Skeleton className="h-24 w-full rounded-md" />
        </div>
      )}
      {errorAnnouncements && !isLoadingAnnouncements && (
        <Card className="border-destructive bg-destructive/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle /> {t('errorLoadingAnnouncementsTitle')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-destructive">{errorAnnouncements}</p>
            <Button onClick={fetchAnnouncements} className="mt-4">{t('retryButtonLabel')}</Button>
          </CardContent>
        </Card>
      )}
      {!isLoadingAnnouncements && !errorAnnouncements && announcements.length === 0 && (
        <p className="text-muted-foreground">{t('noAnnouncementsPostedHint')}</p>
      )}
      {!isLoadingAnnouncements && !errorAnnouncements && announcements.length > 0 && (
        <ScrollArea className="h-[400px] rounded-md border p-4 bg-card">
          <div className="space-y-4">
            {announcements.map((ann) => (
              <Card key={ann.id} className="shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="pb-3 pt-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl font-semibold">{ann.title}</CardTitle>
                      <CardDescription>{format(new Date(ann.date), "PPP HH:mm")}</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="icon" onClick={() => handleEdit(ann)} aria-label={t('editButtonLabel')}>
                        <Edit3 className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="icon" aria-label={t('deleteButtonLabel')}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>{t('alertDialogTitle')}</AlertDialogTitle>
                            <AlertDialogDescription>
                              {t('deleteAnnouncementConfirmation', { title: ann.title})}
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>{t('cancelButton')}</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(ann.id)}>
                              {t('deleteButton')}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-lg text-foreground/90 mb-2">{ann.content}</p>
                  <p className="text-sm text-muted-foreground mt-2">{t('targetLabel')}: {getTargetDisplay(ann.targetClassIds)}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}
