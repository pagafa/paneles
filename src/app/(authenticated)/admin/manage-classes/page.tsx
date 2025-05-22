
"use client";

import { ClassForm } from "@/components/forms/ClassForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { SchoolClass, User } from "@/types";
import { Edit3, Book, Trash2, AlertTriangle, Eye, EyeOff } from "lucide-react"; // Engadido Eye, EyeOff
import { useState, useEffect, useCallback } from "react";
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
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton"; 
import { useLanguage } from "@/context/LanguageContext";
import { Badge } from "@/components/ui/badge"; // Engadido Badge

const sortClasses = (classes: SchoolClass[]) => {
  return [...classes].sort((a, b) => a.name.localeCompare(b.name));
};

export default function ManageClassesPage() {
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [allUsersFromApi, setAllUsersFromApi] = useState<User[]>([]);
  const [editingClass, setEditingClass] = useState<SchoolClass | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { t } = useLanguage(); 

  const fetchAllUsers = useCallback(async () => {
    try {
      const response = await fetch('/api/users');
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: `Failed to fetch users for delegate names. Status: ${response.status}` }));
        throw new Error(errorData.message);
      }
      const data: User[] = await response.json();
      setAllUsersFromApi(data);
    } catch (err) {
      console.error('Error fetching users for ManageClassesPage:', err);
      setAllUsersFromApi([]); 
    }
  }, []);


  const fetchClasses = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/classes');
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: `Failed to fetch classes. Status: ${response.status}` }));
        throw new Error(errorData.message || `Failed to fetch classes. Status: ${response.status}`);
      }
      const data: SchoolClass[] = await response.json();
      setClasses(sortClasses(data));
    } catch (err) {
      console.error(err);
      setError((err as Error).message);
      setClasses([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClasses();
    fetchAllUsers();
  }, [fetchClasses, fetchAllUsers]);

  const handleFormSubmit = async (data: SchoolClass) => {
    const isEditing = !!editingClass;
    const url = isEditing ? `/api/classes/${data.id}` : '/api/classes';
    const method = isEditing ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: `Failed to ${isEditing ? 'update' : 'create'} class. Status: ${response.status}` }));
        throw new Error(errorData.message || `Failed to ${isEditing ? 'update' : 'create'} class. Status: ${response.status}`);
      }
      
      toast({
        title: isEditing ? t("classUpdatedToastTitle") : t("classCreatedToastTitle"),
        description: t('classActionSuccessToastDescription', { name: data.name, action: isEditing ? t('updated') : t('created') }),
      });

      setEditingClass(null);
      await fetchClasses(); 
    } catch (err) {
      console.error(err);
      toast({
        title: t("errorDialogTitle"),
        description: (err as Error).message,
        variant: "destructive",
      });
    }
  };

  const handleEdit = (cls: SchoolClass) => {
    setEditingClass(cls);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (classId: string) => {
    try {
      const response = await fetch(`/api/classes/${classId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: `Failed to delete class. Status: ${response.status}` }));
        throw new Error(errorData.message || `Failed to delete class. Status: ${response.status}`);
      }
      toast({
        title: t("classDeletedToastTitle"),
        description: t("classDeletedToastDescription"),
        variant: "destructive"
      });
      await fetchClasses(); 
    } catch (err) {
       console.error(err);
       toast({
        title: t("errorDialogTitle"),
        description: (err as Error).message,
        variant: "destructive",
      });
    }
  };

  const getDelegateName = (delegateId?: string) => {
    if (!delegateId) return t('noDelegateOption');
    const delegate = allUsersFromApi.find(d => d.id === delegateId && d.role === 'delegate');
    return delegate ? delegate.name : 'Unknown Delegate';
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8 text-primary">{t('manageClassesTitle')}</h1>

      <Card className="mb-8 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <Book className="h-6 w-6 text-accent" />
            {editingClass ? t('editClassTitle') : t('addNewClassTitle')}
          </CardTitle>
           {editingClass && (
            <CardDescription>
              {t('editingClassDescription', { name: editingClass.name})} <Button variant="link" size="sm" onClick={() => setEditingClass(null)}>{t('cancelEditButton')}</Button>
            </CardDescription>
          )}
        </CardHeader>
        <CardContent>
          <ClassForm 
            onSubmitSuccess={handleFormSubmit} 
            initialData={editingClass || undefined} 
            key={editingClass ? editingClass.id : 'new'}
          />
        </CardContent>
      </Card>

      <Separator className="my-8" />

      <h2 className="text-2xl font-semibold mb-6">{t('existingClassesTitle')}</h2>
      {isLoading && (
        <div className="space-y-4">
          <Skeleton className="h-12 w-full rounded-md" />
          <Skeleton className="h-12 w-full rounded-md" />
          <Skeleton className="h-12 w-full rounded-md" />
        </div>
      )}
      {error && !isLoading && (
        <Card className="border-destructive bg-destructive/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle /> {t('errorLoadingClassesTitle')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-destructive">{error}</p>
            <Button onClick={fetchClasses} className="mt-4">{t('retryButtonLabel')}</Button>
          </CardContent>
        </Card>
      )}
      {!isLoading && !error && classes.length === 0 && (
        <p className="text-muted-foreground">{t('noClassesCreatedHint')}</p>
      )}
      {!isLoading && !error && classes.length > 0 && (
        <Card className="shadow-md">
          <ScrollArea className="max-h-[500px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('classNameTableHeader')}</TableHead>
                  <TableHead>{t('classDelegateTableHeader')}</TableHead>
                  <TableHead>{t('statusTableHeader')}</TableHead> 
                  <TableHead className="text-right">{t('actionsTableHeader')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {classes.map((cls) => (
                  <TableRow key={cls.id}>
                    <TableCell className="font-medium">
                        <span>{cls.name}</span>
                    </TableCell>
                    <TableCell>{getDelegateName(cls.delegateId)}</TableCell>
                    <TableCell>
                      {cls.isHidden ? (
                        <Badge variant="secondary" className="flex items-center gap-1">
                          <EyeOff className="h-3.5 w-3.5" />
                          {t('hiddenStatusBadge')}
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="flex items-center gap-1">
                           <Eye className="h-3.5 w-3.5" />
                          {t('visibleStatusBadge')}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="icon" className="mr-2" onClick={() => handleEdit(cls)} aria-label={t('editClassButtonAriaLabel')}>
                        <Edit3 className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                           <Button variant="destructive" size="icon" aria-label={t('deleteClassButtonAriaLabel')}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>{t('alertDialogTitle')}</AlertDialogTitle>
                            <AlertDialogDescription>
                              {t('deleteClassConfirmation', { name: cls.name })}
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>{t('cancelButton')}</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(cls.id)}>
                              {t('deleteButton')}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </Card>
      )}
    </div>
  );
}
