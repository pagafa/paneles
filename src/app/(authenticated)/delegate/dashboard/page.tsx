"use client";

import { DelegateInputForm } from "@/components/forms/DelegateInputForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { mockClasses, mockSchoolEvents } from "@/lib/placeholder-data";
import type { SchoolClass, SchoolEvent } from "@/types";
import { format } from "date-fns";
import { ListChecks, UserCheck } from "lucide-react";
import { useState, useMemo } from "react";
import { AnnouncementCard } from "@/components/kiosk/AnnouncementCard"; // Re-use for display consistency

export default function DelegateDashboardPage() {
  // In a real app, fetch classes assigned to this delegate and their submissions
  const [mySubmissions, setMySubmissions] = useState<SchoolEvent[]>(
    mockSchoolEvents.filter(event => event.class && mockClasses.find(c => c.name === event.class)) // Simplified filter
  );
  
  // Simulate delegate's assigned classes. In a real app, this comes from auth/user data.
  // Assuming delegate with id 'user2' (John Delegate) is logged in, and assigned to 'Grade 10A'
  const delegateAssignedClasses = useMemo(() => {
    const delegateId = typeof window !== 'undefined' && localStorage.getItem('userRole') === 'delegate' ? 'user2' : null; // MOCK
    return mockClasses.filter(c => c.delegateId === delegateId || !delegateId); // If no delegateId, show all for demo
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
              You are managing information for: {delegateAssignedClasses.map(c => c.name).join(', ') || 'N/A'}
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
