
"use client";

import { DelegateInputForm } from "@/components/forms/DelegateInputForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { mockClasses, mockSchoolEvents, mockUsers } from "@/lib/placeholder-data";
import type { SchoolClass, SchoolEvent } from "@/types";
import { format } from "date-fns";
import { ListChecks, UserCheck, Edit3, Trash2 } from "lucide-react";
import { useState, useMemo, useEffect } from "react";
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

export default function DelegateDashboardPage() {
  const { toast } = useToast();
  // In a real app, fetch classes assigned to this delegate and their submissions
  const [mySubmissions, setMySubmissions] = useState<SchoolEvent[]>(
    mockSchoolEvents.filter(event => {
        // For demo, filter some events to a delegate or show all if no specific delegate user found
        const delegateUser = mockUsers.find(u => u.username === 'john_delegate');
        if (delegateUser) {
            const assignedClassesForDemoDelegate = mockClasses.filter(c => c.delegateId === delegateUser.id).map(c => c.name);
            return event.class && assignedClassesForDemoDelegate.includes(event.class);
        }
        return event.class && mockClasses.find(c => c.name === event.class); // Simplified broader filter
    }).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  );
  
  const [delegateAssignedClasses, setDelegateAssignedClasses] = useState<SchoolClass[]>([]);
  const [editingSubmission, setEditingSubmission] = useState<SchoolEvent | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [submissionToDelete, setSubmissionToDelete] = useState<SchoolEvent | null>(null);


  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedUserId = localStorage.getItem('userId');
      const userRole = localStorage.getItem('userRole');
      let assigned: SchoolClass[] = [];

      if (userRole === 'delegate' && storedUserId) {
        assigned = mockClasses.filter(c => c.delegateId === storedUserId);
      } else if (!storedUserId && userRole === 'delegate') {
         const genericDelegateUser = mockUsers.find(u => u.username === 'delegate_user' || u.username === 'john_delegate'); // Example delegate
         if (genericDelegateUser) {
            assigned = mockClasses.filter(c => c.delegateId === genericDelegateUser.id);
         }
      }
      setDelegateAssignedClasses(assigned);

      // Filter submissions based on assigned classes
      if(assigned.length > 0){
        const assignedClassNames = assigned.map(c => c.name);
        setMySubmissions(
            mockSchoolEvents.filter(event => event.class && assignedClassNames.includes(event.class))
            .sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        );
      } else if (userRole === 'delegate') {
         setMySubmissions([]); // If delegate has no assigned classes, show no submissions by default
      }

    }
  }, []);

  const handleFormSubmit = (data: SchoolEvent) => {
    if (editingSubmission) {
      setMySubmissions(prev => prev.map(s => s.id === editingSubmission.id ? data : s).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
      toast({ title: "Information Updated", description: `"${data.title}" has been updated.` });
      setEditingSubmission(null);
    } else {
      setMySubmissions(prev => [data, ...prev].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime() ));
      toast({ title: "Information Submitted", description: `"${data.title}" has been submitted.` });
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

  const confirmDelete = () => {
    if (submissionToDelete) {
      setMySubmissions(prev => prev.filter(s => s.id !== submissionToDelete.id));
      toast({
        title: "Submission Deleted",
        description: `"${submissionToDelete.title}" has been successfully deleted.`,
        variant: "destructive"
      });
    }
    setShowDeleteDialog(false);
    setSubmissionToDelete(null);
  };

  const assignedClassNames = useMemo(() => {
    if (delegateAssignedClasses.length === 0 && mySubmissions.length > 0 && typeof window !== 'undefined' && localStorage.getItem('userRole') === 'delegate') {
        // Fallback for john_delegate if no specific classes are loaded but submissions exist (old logic path)
        const johnDelegate = mockUsers.find(u => u.username === 'john_delegate');
        if (johnDelegate) {
            return mockClasses.filter(c => c.delegateId === johnDelegate.id).map(c => c.name).join(', ');
        }
        return 'N/A (check assignments)';
    }
    return delegateAssignedClasses.length > 0 ? delegateAssignedClasses.map(c => c.name).join(', ') : 'No classes assigned';
  }, [delegateAssignedClasses, mySubmissions]);


  return (
    <div className="container mx-auto py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold text-primary">Delegate Dashboard</h1>
        <Card className="w-full md:w-auto bg-accent/20 border-accent">
          <CardHeader className="p-4">
            <CardTitle className="text-md text-accent-foreground">
              You are managing information for: {assignedClassNames}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>
      
      <Card className="mb-8 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <UserCheck className="h-6 w-6 text-accent" />
            {editingSubmission ? "Edit Information" : "Submit New Information"}
          </CardTitle>
          {editingSubmission ? (
            <CardDescription>
              Editing: "{editingSubmission.title}".{' '}
              <Button variant="link" size="sm" onClick={() => setEditingSubmission(null)}>Cancel Edit</Button>
            </CardDescription>
          ) : (
            <CardDescription>
              Enter announcements, exam schedules, or assignment deadlines for your assigned classes.
            </CardDescription>
          )}
        </CardHeader>
        <CardContent>
          <DelegateInputForm 
            onSubmitSuccess={handleFormSubmit} 
            availableClasses={delegateAssignedClasses} 
            initialData={editingSubmission}
            key={editingSubmission ? editingSubmission.id : 'new-submission'}
          />
        </CardContent>
      </Card>

      <div className="my-8 border-t border-border"></div>

      <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
        <ListChecks className="h-6 w-6 text-primary" />
        Your Recent Submissions
      </h2>
      {mySubmissions.length === 0 ? (
        <p className="text-muted-foreground">You haven't submitted any information yet, or you have no classes assigned.</p>
      ) : (
        <ScrollArea className="h-[500px] rounded-md border p-1 bg-background">
          <div className="space-y-4 p-3">
            {mySubmissions.map((item) => (
              <AnnouncementCard 
                key={item.id} 
                item={item} 
                showDelegateActions={true}
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
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete your submission titled "{submissionToDelete.title}".
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => {setShowDeleteDialog(false); setSubmissionToDelete(null);}}>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDelete}>Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}
