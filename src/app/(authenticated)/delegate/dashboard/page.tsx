"use client";

import { DelegateInputForm } from "@/components/forms/DelegateInputForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { mockClasses, mockSchoolEvents, mockUsers } from "@/lib/placeholder-data";
import type { SchoolClass, SchoolEvent } from "@/types";
import { format } from "date-fns";
import { ListChecks, UserCheck } from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { AnnouncementCard } from "@/components/kiosk/AnnouncementCard"; // Re-use for display consistency

export default function DelegateDashboardPage() {
  // In a real app, fetch classes assigned to this delegate and their submissions
  const [mySubmissions, setMySubmissions] = useState<SchoolEvent[]>(
    mockSchoolEvents.filter(event => event.class && mockClasses.find(c => c.name === event.class)) // Simplified filter
  );
  
  const [delegateAssignedClasses, setDelegateAssignedClasses] = useState<SchoolClass[]>([]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedUserId = localStorage.getItem('userId');
      const userRole = localStorage.getItem('userRole');

      if (userRole === 'delegate' && storedUserId) {
        const assigned = mockClasses.filter(c => c.delegateId === storedUserId);
        setDelegateAssignedClasses(assigned);
      } else if (!storedUserId && userRole === 'delegate') {
        // Fallback for generic delegate_user if no specific ID (e.g. from old login)
         const genericDelegateUser = mockUsers.find(u => u.username === 'delegate_user');
         if (genericDelegateUser) {
            setDelegateAssignedClasses(mockClasses.filter(c => c.delegateId === genericDelegateUser.id));
         } else {
            setDelegateAssignedClasses(mockClasses); // Show all as a broad fallback if 'delegate_user' isn't found
         }
      }
       else {
        setDelegateAssignedClasses(mockClasses); // Show all for demo if not delegate or no ID
      }
    }
  }, []);


  const handleFormSubmit = (data: SchoolEvent) => {
    setMySubmissions(prev => [data, ...prev].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime() ));
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold text-primary">Delegate Dashboard</h1>
        <Card className="w-full md:w-auto bg-accent/20 border-accent">
          <CardHeader className="p-4">
            <CardTitle className="text-md text-accent-foreground">
              You are managing information for: {delegateAssignedClasses.length > 0 ? delegateAssignedClasses.map(c => c.name).join(', ') : 'N/A'}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>
      
      <Card className="mb-8 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <UserCheck className="h-6 w-6 text-accent" />
            Submit New Information
          </CardTitle>
          <CardDescription>
            Enter announcements, exam schedules, or assignment deadlines for your assigned classes.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DelegateInputForm onSubmitSuccess={handleFormSubmit} availableClasses={delegateAssignedClasses} />
        </CardContent>
      </Card>

      <div className="my-8 border-t border-border"></div>

      <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
        <ListChecks className="h-6 w-6 text-primary" />
        Your Recent Submissions
      </h2>
      {mySubmissions.length === 0 ? (
        <p className="text-muted-foreground">You haven't submitted any information yet.</p>
      ) : (
        <ScrollArea className="h-[500px] rounded-md border p-1 bg-background">
          <div className="space-y-4 p-3">
            {mySubmissions.map((item) => (
              <AnnouncementCard key={item.id} item={item} />
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}
