"use client";

import { UserForm } from "@/components/forms/UserForm";
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
import { mockUsers as initialUsers } from "@/lib/placeholder-data";
import type { User } from "@/types";
import { Edit3, Trash2, Users } from "lucide-react"; // Removed Badge icon as it's not used for a direct title icon
import { useState } from "react";
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


export default function ManageUsersPage() {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const { toast } = useToast();

  const handleFormSubmit = (data: User) => {
    if (editingUser) {
      setUsers(users.map(usr => usr.id === data.id ? data : usr));
      setEditingUser(null);
    } else {
      setUsers([data, ...users]);
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
     window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = (userId: string) => {
    const userToDelete = users.find(u => u.id === userId);
    if (userToDelete?.username === 'admin_user') { // Check against username
      toast({
        title: "Action Prohibited",
        description: "This demo admin user cannot be deleted.",
        variant: "destructive",
      });
      return;
    }
    setUsers(users.filter(usr => usr.id !== userId));
    toast({
      title: "User Deleted",
      description: "The user account has been successfully deleted.",
      variant: "destructive"
    });
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8 text-primary">Manage Users</h1>

      <Card className="mb-8 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <Users className="h-6 w-6 text-accent" />
            {editingUser ? "Edit User Account" : "Create New User Account"}
          </CardTitle>
          {editingUser && (
            <CardDescription>
              You are editing account for: "{editingUser.name}". <Button variant="link" size="sm" onClick={() => setEditingUser(null)}>Cancel Edit</Button>
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

      <h2 className="text-2xl font-semibold mb-6">Existing Users</h2>
      {users.length === 0 ? (
        <p className="text-muted-foreground">No users created yet.</p>
      ) : (
        <Card className="shadow-md">
          <ScrollArea className="max-h-[500px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Username</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{user.username}</TableCell>
                    <TableCell>
                      <ShadBadge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                        {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                      </ShadBadge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="icon" className="mr-2" onClick={() => handleEdit(user)} aria-label="Edit User">
                        <Edit3 className="h-4 w-4" />
                      </Button>
                       <AlertDialog>
                        <AlertDialogTrigger asChild>
                           <Button variant="destructive" size="icon" aria-label="Delete User" disabled={user.username === 'admin_user'}> {/* Prevent deleting main admin by username */}
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will permanently delete the user account for "{user.name}".
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(user.id)}>
                              Delete
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
