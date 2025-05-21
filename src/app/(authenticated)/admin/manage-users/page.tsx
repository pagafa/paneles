
"use client";

import { UserForm, type UserFormSubmitValues } from "@/components/forms/UserForm"; // Import UserFormSubmitValues
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
import type { User } from "@/types";
import { Edit3, Trash2, Users, AlertTriangle } from "lucide-react";
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
import { Badge as ShadBadge } from "@/components/ui/badge"; 
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { useLanguage } from "@/context/LanguageContext";

const sortUsers = (users: User[]) => {
  return [...users].sort((a, b) => a.name.localeCompare(b.name));
};

export default function ManageUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { t } = useLanguage();


  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/users');
      if (!response.ok) {
        let errorMessage = `Failed to fetch users. Status: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (e) { /* Ignore if response is not JSON */ }
        throw new Error(errorMessage);
      }
      const data: User[] = await response.json();
      setUsers(sortUsers(data));
    } catch (err) {
      console.error(err);
      setError((err as Error).message);
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  }, []); 

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleFormSubmit = async (data: UserFormSubmitValues) => { 
    const isEditing = !!editingUser;
    const url = isEditing && editingUser ? `/api/users/${editingUser.id}` : '/api/users';
    const method = isEditing ? 'PUT' : 'POST';
    
    
    const payload: UserFormSubmitValues = { ...data };

    if (isEditing) {
      payload.id = editingUser!.id; 
      if (!payload.password || payload.password.trim() === "") { 
        delete payload.password; 
      }
    }


    try {
      const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        let errorMessage = `Failed to ${isEditing ? t('updated').toLowerCase() : t('posted').toLowerCase()} user. Status: ${response.status}`;
        try {
            const errorData = await response.json();
            errorMessage = errorData.message || errorMessage;
        } catch (e) { /* Ignore if response is not JSON */ }
        throw new Error(errorMessage);
      }
      
      toast({
        title: isEditing ? t('userUpdatedToastTitle', { name: data.name }) : t('userCreatedToastTitle', { name: data.name }),
        description: t('userActionSuccessToastDescription', { name: data.name, action: isEditing ? t('updated') : t('posted') }),
      });

      setEditingUser(null);
      await fetchUsers(); 
    } catch (err) {
      console.error(err);
      toast({
        title: t('errorDialogTitle'),
        description: (err as Error).message,
        variant: "destructive",
      });
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
     window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (userId: string) => {
    const userToDelete = users.find(u => u.id === userId);
    
    if (userToDelete?.username === 'admin_mv') { 
      toast({
        title: t('actionProhibitedToastTitle'),
        description: t('cannotDeleteDefaultAdminToastDescription'),
        variant: "warning",
      });
      return;
    }
    try {
      const response = await fetch(`/api/users/${userId}`, { method: 'DELETE' });
      if (!response.ok) {
        let errorMessage = `Failed to delete user. Status: ${response.status}`;
        try {
            const errorData = await response.json();
            errorMessage = errorData.message || errorMessage;
        } catch (e) { /* Ignore if response is not JSON */ }
        throw new Error(errorMessage);
      }
      toast({
        title: t('userDeletedToastTitle', { name: userToDelete?.name || 'User' }),
        description: t('userDeletedToastDescription'),
        variant: "destructive"
      });
      await fetchUsers(); 
    } catch (err) {
       console.error(err);
       toast({
        title: t('errorDialogTitle'),
        description: (err as Error).message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8 text-primary">{t('manageUsersTitle')}</h1>

      <Card className="mb-8 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <Users className="h-6 w-6 text-accent" />
            {editingUser ? t('editUserAccountTitle') : t('createNewUserAccountTitle')}
          </CardTitle>
          {editingUser && (
            <CardDescription>
              {t('editingUserAccountDescription', {name: editingUser.name})} <Button variant="link" size="sm" onClick={() => setEditingUser(null)}>{t('cancelEditButton')}</Button>
            </CardDescription>
          )}
        </CardHeader>
        <CardContent>
          <UserForm 
            onSubmitSuccess={handleFormSubmit} 
            initialData={editingUser || undefined} 
            isEditing={!!editingUser}
            key={editingUser ? editingUser.id : 'new'}
          />
        </CardContent>
      </Card>

      <Separator className="my-8" />

      <h2 className="text-2xl font-semibold mb-6">{t('existingUsersTitle')}</h2>
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
              <AlertTriangle /> {t('errorLoadingUsersTitle')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-destructive">{error}</p>
            <Button onClick={fetchUsers} className="mt-4">{t('retryButtonLabel')}</Button>
          </CardContent>
        </Card>
      )}
      {!isLoading && !error && users.length === 0 && (
        <p className="text-muted-foreground">{t('noUsersCreatedHint')}</p>
      )}
      {!isLoading && !error && users.length > 0 && (
        <Card className="shadow-md">
          <ScrollArea className="max-h-[500px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('userNameTableHeader')}</TableHead>
                  <TableHead>{t('usernameTableHeader')}</TableHead>
                  <TableHead>{t('userRoleTableHeader')}</TableHead>
                  <TableHead className="text-right">{t('actionsTableHeader')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{user.username}</TableCell>
                    <TableCell>
                      <ShadBadge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                        {t(user.role === 'admin' ? 'adminRoleLabel' : 'delegateRoleLabel')}
                      </ShadBadge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="icon" className="mr-2" onClick={() => handleEdit(user)} aria-label={t('editUserButtonLabel')}>
                        <Edit3 className="h-4 w-4" />
                      </Button>
                       <AlertDialog>
                        <AlertDialogTrigger asChild>
                           <Button variant="destructive" size="icon" aria-label={t('deleteUserButtonLabel')} disabled={user.username === 'admin_mv'}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>{t('alertDialogTitle')}</AlertDialogTitle>
                            <AlertDialogDescription>
                              {t('deleteUserConfirmation', { name: user.name })}
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>{t('cancelButton')}</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(user.id)}>
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

    