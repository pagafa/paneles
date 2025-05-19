
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
import { mockClasses as initialClasses, mockUsers } from "@/lib/placeholder-data";
import type { SchoolClass, User } from "@/types";
import { Edit3, Library, Trash2 } from "lucide-react"; // Changed School to Library
import { useState, useMemo } from "react";
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

export default function ManageClassesPage() {
  const [classes, setClasses] = useState<SchoolClass[]>(initialClasses);
  const [editingClass, setEditingClass] = useState<SchoolClass | null>(null);
  const { toast } = useToast();

  const availableDelegates = useMemo(() => mockUsers.filter(u => u.role === 'delegate'), []);

  const handleFormSubmit = (data: SchoolClass) => {
    if (editingClass) {
      setClasses(classes.map(cls => cls.id === data.id ? data : cls));
      setEditingClass(null);
    } else {
      setClasses([data, ...classes]);
    }
  };

  const handleEdit = (cls: SchoolClass) => {
    setEditingClass(cls);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = (classId: string) => {
    setClasses(classes.filter(cls => cls.id !== classId));
     toast({
      title: "Class Deleted",
      description: "The class has been successfully deleted.",
      variant: "destructive"
    });
  };

  const getDelegateName = (delegateId?: string) => {
    if (!delegateId) return 'N/A';
    const delegate = availableDelegates.find(d => d.id === delegateId);
    return delegate ? delegate.name : 'Unknown Delegate';
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8 text-primary">Manage Classes</h1>

      <Card className="mb-8 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <Library className="h-6 w-6 text-accent" /> {/* Changed School to Library */}
            {editingClass ? "Edit Class" : "Add New Class"}
          </CardTitle>
           {editingClass && (
            <CardDescription>
              You are editing: "{editingClass.name}". <Button variant="link" size="sm" onClick={() => setEditingClass(null)}>Cancel Edit</Button>
            </CardDescription>
          )}
        </CardHeader>
        <CardContent>
          <ClassForm 
            onSubmitSuccess={handleFormSubmit} 
            initialData={editingClass || undefined} 
            availableDelegates={availableDelegates}
            key={editingClass ? editingClass.id : 'new'}
          />
        </CardContent>
      </Card>

      <Separator className="my-8" />

      <h2 className="text-2xl font-semibold mb-6">Existing Classes</h2>
      {classes.length === 0 ? (
        <p className="text-muted-foreground">No classes created yet.</p>
      ) : (
        <Card className="shadow-md">
          <ScrollArea className="max-h-[500px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Class Name</TableHead>
                  <TableHead>Delegate</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {classes.map((cls) => (
                  <TableRow key={cls.id}>
                    <TableCell className="font-medium">{cls.name}</TableCell>
                    <TableCell>{getDelegateName(cls.delegateId)}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="icon" className="mr-2" onClick={() => handleEdit(cls)} aria-label="Edit Class">
                        <Edit3 className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                           <Button variant="destructive" size="icon" aria-label="Delete Class">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will permanently delete the class "{cls.name}".
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(cls.id)}>
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
