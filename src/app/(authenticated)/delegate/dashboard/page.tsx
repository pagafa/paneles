
"use client";

import { DelegateInputForm } from "@/components/forms/DelegateInputForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
// mockSchoolEvents, mockUsers, mockClasses no longer primary source
import type { SchoolClass, SchoolEvent, User } from "@/types";
import { format } from "date-fns";
import { ListChecks, UserCheck, Edit3, Trash2, AlertTriangle } from "lucide-react";
import { useState, useMemo, useEffect, useCallback } from "react";
import { AnnouncementCard } from "@/components/kiosk/AnnouncementCard";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useLanguage } from "@/context/LanguageContext";
import { Skeleton } from "@/components/ui/skeleton";

const sortEvents = (events: SchoolEvent[]) => {
  return [...events].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

export default function DelegateDashboardPage() {
  const { toast } = useToast();
  const { t } = useLanguage(); 

  const [mySubmissions, setMySubmissions] = useState<SchoolEvent[]>([]);
  const [delegateAssignedClasses, setDelegateAssignedClasses] = useState<SchoolClass[]>([]);
  const [editingSubmission, setEditingSubmission] = useState<SchoolEvent | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [submissionToDelete, setSubmissionToDelete] = useState<SchoolEvent | null>(null);
  
  const [isLoadingSubmissions, setIsLoadingSubmissions] = useState(true);
  const [isLoadingClasses, setIsLoadingClasses] = useState(true);
  const [errorSubmissions, setErrorSubmissions] = useState<string | null>(null);
  const [errorClasses, setErrorClasses] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null); // To store logged-in delegate's ID


  // Fetch current delegate's ID (mocked from localStorage)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedUserId = localStorage.getItem('userId');
      const userRole = localStorage.getItem('userRole');
      if (userRole === 'delegate' && storedUserId) {
        setCurrentUserId(storedUserId);
      } else if (!storedUserId && userRole === 'delegate') {
        // Fallback to a generic delegate for demo if ID not found but role is delegate
        // This part might need adjustment based on how users are fetched/managed
        // For now, assume a generic delegate 'user2' or 'user3' from mockUsers if no specific ID
        // In a real scenario, this would be handled by the auth system.
        const genericDelegateUser = mockUsers.find(u => u.username === 'john_delegate'); // From placeholder-data
        if (genericDelegateUser) setCurrentUserId(genericDelegateUser.id);
      }
    }
  }, []);

  const fetchAssignedClasses = useCallback(async () => {
    if (!currentUserId) {
      setIsLoadingClasses(false);
      setDelegateAssignedClasses([]);
      return;
    }
    setIsLoadingClasses(true);
    setErrorClasses(null);
    try {
      const response = await fetch('/api/classes');
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: `Failed to fetch classes. Status: ${response.status}` }));
        throw new Error(errorData.message || `Failed to fetch classes. Status: ${response.status}`);
      }
      const allClasses: SchoolClass[] = await response.json();
      const assigned = allClasses.filter(c => c.delegateId === currentUserId);
      setDelegateAssignedClasses(assigned);
    } catch (err) {
      console.error('Error fetching assigned classes:', err);
      setErrorClasses((err as Error).message);
      setDelegateAssignedClasses([]);
    } finally {
      setIsLoadingClasses(false);
    }
  }, [currentUserId]);

  const fetchMySubmissions = useCallback(async () => {
    if (delegateAssignedClasses.length === 0 && !isLoadingClasses) { // Don't fetch if no classes and not loading classes
        setIsLoadingSubmissions(false);
        setMySubmissions([]);
        return;
    }
    if (delegateAssignedClasses.length === 0 && isLoadingClasses) { // Still waiting for classes
        return;
    }

    setIsLoadingSubmissions(true);
    setErrorSubmissions(null);
    try {
      // Fetch all schoolevents and filter client-side by assigned classIds or submittedByDelegateId
      // Ideally, API would support filtering by multiple classIds or delegateId
      const response = await fetch('/api/schoolevents');
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: `Failed to fetch submissions. Status: ${response.status}` }));
        throw new Error(errorData.message || `Failed to fetch submissions. Status: ${response.status}`);
      }
      const allEvents: SchoolEvent[] = await response.json();
      const assignedClassIds = delegateAssignedClasses.map(c => c.id);
      
      const filteredSubmissions = allEvents.filter(event => {
        // Check if submitted by current delegate OR if targeted to one of their classes (if classId is present)
        if (event.submittedByDelegateId === currentUserId) return true;
        if (event.type === 'announcement' && (event as any).classId && assignedClassIds.includes((event as any).classId)) return true; // Delegate announcements might use classId
        if ((event.type === 'exam' || event.type === 'deadline') && (event as any).classId && assignedClassIds.includes((event as any).classId) ) return true;
        return false;
      });
      setMySubmissions(sortEvents(filteredSubmissions));
    } catch (err) {
      console.error('Error fetching submissions:', err);
      setErrorSubmissions((err as Error).message);
      setMySubmissions([]);
    } finally {
      setIsLoadingSubmissions(false);
    }
  }, [delegateAssignedClasses, currentUserId, isLoadingClasses]);


  useEffect(() => {
    fetchAssignedClasses();
  }, [fetchAssignedClasses]);

  useEffect(() => {
    // Fetch submissions only after assigned classes are determined
    if (!isLoadingClasses) {
        fetchMySubmissions();
    }
  }, [isLoadingClasses, fetchMySubmissions]);


  const handleFormSubmit = async (data: SchoolEvent) => {
    const isEditing = !!editingSubmission;
    const url = isEditing ? `/api/schoolevents/${data.id}` : '/api/schoolevents';
    const method = isEditing ? 'PUT' : 'POST';

    const payload = { ...data };
    if (!payload.submittedByDelegateId && currentUserId) {
      payload.submittedByDelegateId = currentUserId;
    }

    try {
      const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: `Failed to ${isEditing ? 'update' : 'submit'} information. Status: ${response.status}` }));
        throw new Error(errorData.message || `Failed to ${isEditing ? 'update' : 'submit'} information. Status: ${response.status}`);
      }
      
      toast({ title: isEditing ? t('submissionUpdatedToastTitle') : t('submissionSubmittedToastTitle'), description: t('submissionUpdatedToastDescription', { title: data.title }) });
      setEditingSubmission(null);
      await fetchMySubmissions(); // Refresh list
    } catch (err) {
      console.error(err);
      toast({
        title: t('errorDialogTitle'),
        description: (err as Error).message,
        variant: "destructive",
      });
    }
  };

  const handleEdit = (submission: SchoolEvent) => {
    setEditingSubmission(submission);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteRequest = (submission: SchoolEvent) => {
    setSubmissionToDelete(submission);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (submissionToDelete) {
      try {
        const response = await fetch(`/api/schoolevents/${submissionToDelete.id}`, { method: 'DELETE'});
        if(!response.ok){
            const errorData = await response.json().catch(() => ({ message: `Failed to delete submission. Status: ${response.status}` }));
            throw new Error(errorData.message || `Failed to delete submission. Status: ${response.status}`);
        }
        toast({
            title: t('submissionDeletedToastTitle'),
            description: t('submissionDeletedToastDescription', { title: submissionToDelete.title }),
            variant: "destructive"
        });
        await fetchMySubmissions(); // Refresh list
      } catch (err) {
         console.error(err);
         toast({
            title: t('errorDialogTitle'),
            description: (err as Error).message,
            variant: "destructive",
        });
      }
    }
    setShowDeleteDialog(false);
    setSubmissionToDelete(null);
  };
  
  const assignedClassNamesString = useMemo(() => {
    return delegateAssignedClasses.map(c => c.name).join(', ');
  }, [delegateAssignedClasses]);


  return (
    <div className="container mx-auto py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold text-primary">{t('delegateDashboardTitle')}</h1>
        <Card className="w-full md:w-auto bg-accent/20 border-accent">
          <CardHeader className="p-4">
            {isLoadingClasses ? <Skeleton className="h-5 w-48" /> : (
                <CardTitle className="text-md text-accent-foreground">
                {delegateAssignedClasses.length > 0
                    ? `${t('assignedClassesLabel')}: ${assignedClassNamesString}`
                    : t('noAssignedClassesLabel')}
                </CardTitle>
            )}
          </CardHeader>
        </Card>
      </div>
      
      <Card className="mb-8 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <UserCheck className="h-6 w-6 text-accent" />
            {editingSubmission ? t('editInformationTitle') : t('submitNewInformationTitle')}
          </CardTitle>
          {editingSubmission ? (
            <CardDescription>
              {t('editingSubmissionDescription', { title: editingSubmission.title })}.{' '}
              <Button variant="link" size="sm" onClick={() => setEditingSubmission(null)}>{t('cancelEditButton')}</Button>
            </CardDescription>
          ) : (
            <CardDescription>
              {t('delegateFormDescription')}
            </CardDescription>
          )}
        </CardHeader>
        <CardContent>
          {isLoadingClasses && <Skeleton className="h-40 w-full" /> }
          {!isLoadingClasses && errorClasses && <p className="text-sm text-destructive">Error loading classes for form: {errorClasses}. Some features might be unavailable.</p>}
          {!isLoadingClasses && !errorClasses && (
            <DelegateInputForm 
                onSubmitSuccess={handleFormSubmit} 
                availableClasses={delegateAssignedClasses} 
                initialData={editingSubmission}
                key={editingSubmission ? editingSubmission.id : 'new-submission'}
            />
          )}
        </CardContent>
      </Card>

      <div className="my-8 border-t border-border"></div>

      <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
        <ListChecks className="h-6 w-6 text-primary" />
        {t('yourRecentSubmissionsTitle')}
      </h2>
      {isLoadingSubmissions && (
         <div className="space-y-4">
          <Skeleton className="h-24 w-full rounded-md" />
          <Skeleton className="h-24 w-full rounded-md" />
        </div>
      )}
      {errorSubmissions && !isLoadingSubmissions && (
         <Card className="border-destructive bg-destructive/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle /> {t('errorLoadingSubmissionsTitle')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-destructive">{errorSubmissions}</p>
            <Button onClick={fetchMySubmissions} className="mt-4">{t('retryButtonLabel')}</Button>
          </CardContent>
        </Card>
      )}
      {!isLoadingSubmissions && !errorSubmissions && mySubmissions.length === 0 && (
        <p className="text-muted-foreground">
          {delegateAssignedClasses.length === 0 && !isLoadingClasses ? t('noAssignedClassesToSubmitHint') : t('noSubmissionsYetHint')}
        </p>
      )}
      {!isLoadingSubmissions && !errorSubmissions && mySubmissions.length > 0 && (
        <ScrollArea className="h-[500px] rounded-md border p-1 bg-background">
          <div className="space-y-4 p-3">
            {mySubmissions.map((item) => (
              <AnnouncementCard 
                key={item.id} 
                item={item} 
                showDelegateActions={true}
                showTypeIcon={true}
                onEdit={() => handleEdit(item)}
                onDeleteRequest={() => handleDeleteRequest(item)}
              />
            ))}
          </div>
        </ScrollArea>
      )}

      {submissionToDelete && (
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t('alertDialogTitle')}</AlertDialogTitle>
              <AlertDialogDescription>
                {t('alertDialogDescription', { title: submissionToDelete.title })}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => {setShowDeleteDialog(false); setSubmissionToDelete(null);}}>{t('cancelButton')}</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDelete}>{t('deleteButton')}</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}
