
"use client";

import { AdminAnnouncementForm } from "@/components/forms/AdminAnnouncementForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { mockAnnouncements as initialAnnouncements, mockClasses } from "@/lib/placeholder-data";
import type { Announcement, SchoolClass } from "@/types";
import { format } from "date-fns";
import { Megaphone, Edit3, Trash2, Settings, Save } from "lucide-react";
import { useState, useEffect } from "react";
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
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/context/LanguageContext";
import { useSchoolName } from "@/context/SchoolNameContext";

const sortAnnouncements = (announcements: Announcement[]) => {
  return announcements.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

export default function AdminDashboardPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>(() => sortAnnouncements(initialAnnouncements));
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  const [allClasses] = useState<SchoolClass[]>(mockClasses); // For resolving class names
  const { toast } = useToast();
  const { t } = useLanguage();
  const { schoolName, setSchoolName } = useSchoolName();
  const [editableSchoolName, setEditableSchoolName] = useState(schoolName);

  useEffect(() => {
    setEditableSchoolName(schoolName);
  }, [schoolName]);

  const handleFormSubmit = (data: Announcement) => {
    let updatedAnnouncementsList;
    if (editingAnnouncement) {
      updatedAnnouncementsList = announcements.map(ann => ann.id === data.id ? data : ann);
      setEditingAnnouncement(null);
    } else {
      updatedAnnouncementsList = [data, ...announcements];
    }
    setAnnouncements(sortAnnouncements(updatedAnnouncementsList));
  };

  const handleEdit = (announcement: Announcement) => {
    setEditingAnnouncement(announcement);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = (announcementId: string) => {
    setAnnouncements(announcements.filter(ann => ann.id !== announcementId));
    toast({
      title: "Announcement Deleted",
      description: "The announcement has been successfully deleted.",
      variant: "destructive"
    });
  };

  const handleSchoolNameSave = () => {
    setSchoolName(editableSchoolName.trim());
    toast({
      title: t('schoolNameUpdatedToastTitle'),
      description: t('schoolNameUpdatedToastDescription', { schoolName: editableSchoolName.trim() || "My School" }),
    });
  };

  const getTargetDisplay = (targetClassIds?: string[]): string => {
    if (!targetClassIds || targetClassIds.length === 0) {
      return "School-wide";
    }
    const targetedClassNames = targetClassIds.map(id => {
      const cls = allClasses.find(c => c.id === id);
      return cls ? cls.name : id;
    }).join(', ');
    return `Classes: ${targetedClassNames}`;
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
            <Megaphone className="h-6 w-6 text-accent" />
            {editingAnnouncement ? "Edit Announcement" : "Post New School-Wide Announcement"}
          </CardTitle>
          {editingAnnouncement && (
            <CardDescription>
              You are editing: "{editingAnnouncement.title}". <Button variant="link" size="sm" onClick={() => setEditingAnnouncement(null)}>Cancel Edit</Button>
            </CardDescription>
          )}
        </CardHeader>
        <CardContent>
          <AdminAnnouncementForm 
            onSubmitSuccess={handleFormSubmit} 
            initialData={editingAnnouncement || undefined}
            availableClasses={allClasses}
            key={editingAnnouncement ? editingAnnouncement.id : 'new'}
          />
        </CardContent>
      </Card>

      <Separator className="my-8" />

      <h2 className="text-2xl font-semibold mb-6">Current Announcements</h2>
      {announcements.length === 0 ? (
        <p className="text-muted-foreground">No announcements posted yet.</p>
      ) : (
        <ScrollArea className="h-[400px] rounded-md border p-4 bg-card">
          <div className="space-y-4">
            {announcements.map((ann) => (
              <Card key={ann.id} className="shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{ann.title}</CardTitle>
                      <CardDescription>{format(new Date(ann.date), "PPP HH:mm")}</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="icon" onClick={() => handleEdit(ann)} aria-label="Edit">
                        <Edit3 className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="icon" aria-label="Delete">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will permanently delete the announcement titled "{ann.title}".
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(ann.id)}>
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-foreground/90">{ann.content}</p>
                  <p className="text-xs text-muted-foreground mt-2">Target: {getTargetDisplay(ann.targetClassIds)}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}
