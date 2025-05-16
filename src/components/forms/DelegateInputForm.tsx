"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarIcon, PlusCircle, Megaphone, BookOpenCheck, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import type { SchoolEvent, Announcement, Exam, Deadline, SchoolClass } from "@/types";
import { mockClasses } from "@/lib/placeholder-data"; // For class selection
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const commonSchema = {
  title: z.string().min(3, "Title is too short."),
  date: z.date({ required_error: "Date is required." }),
  classId: z.string().min(1, "Class selection is required."),
  description: z.string().optional(),
};

const announcementSchema = z.object({
  ...commonSchema,
  type: z.literal("announcement"),
  content: z.string().min(10, "Content is too short."),
});

const examSchema = z.object({
  ...commonSchema,
  type: z.literal("exam"),
  subject: z.string().min(2, "Subject is too short."),
});

const deadlineSchema = z.object({
  ...commonSchema,
  type: z.literal("deadline"),
  assignmentName: z.string().min(3, "Assignment name is too short."),
});

const delegateInputFormSchema = z.discriminatedUnion("type", [
  announcementSchema,
  examSchema,
  deadlineSchema,
]);

type DelegateInputFormValues = z.infer<typeof delegateInputFormSchema>;

interface DelegateInputFormProps {
  onSubmitSuccess?: (data: SchoolEvent) => void;
  availableClasses?: SchoolClass[]; // Pass available classes for the delegate
}

export function DelegateInputForm({ 
  onSubmitSuccess, 
  availableClasses = mockClasses /* In real app, filter by delegate's classes */ 
}: DelegateInputFormProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<"announcement" | "exam" | "deadline">("announcement");

  const form = useForm<DelegateInputFormValues>({
    resolver: zodResolver(delegateInputFormSchema),
    defaultValues: {
      type: activeTab,
      title: "",
      date: new Date(),
      classId: "",
      // Specific fields will be conditionally rendered or handled
    } as any, // Cast to any due to discriminated union complexity with defaultValues
  });
  
  // Update form's 'type' field when tab changes
  const handleTabChange = (value: string) => {
    const newType = value as "announcement" | "exam" | "deadline";
    setActiveTab(newType);
    form.setValue("type", newType);
    form.reset({ // Reset specific fields to avoid validation errors from previous tab
        type: newType,
        title: form.getValues("title"),
        date: form.getValues("date"),
        classId: form.getValues("classId"),
        description: form.getValues("description"),
        // Clear other fields not relevant to the new type
        content: newType === "announcement" ? form.getValues("content") : undefined,
        subject: newType === "exam" ? form.getValues("subject") : undefined,
        assignmentName: newType === "deadline" ? form.getValues("assignmentName") : undefined,
    });
  };


  async function onSubmit(values: DelegateInputFormValues) {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const selectedClass = availableClasses.find(c => c.id === values.classId);
    let submissionData: SchoolEvent;

    switch (values.type) {
      case 'announcement':
        submissionData = {
          id: `del-ann-${Date.now()}`,
          title: values.title,
          date: values.date.toISOString(),
          type: 'announcement',
          content: values.content,
          class: selectedClass?.name,
          description: values.description,
        } as Announcement;
        break;
      case 'exam':
        submissionData = {
          id: `del-exam-${Date.now()}`,
          title: values.title,
          date: values.date.toISOString(),
          type: 'exam',
          subject: values.subject,
          class: selectedClass?.name,
          description: values.description,
        } as Exam;
        break;
      case 'deadline':
        submissionData = {
          id: `del-dead-${Date.now()}`,
          title: values.title,
          date: values.date.toISOString(),
          type: 'deadline',
          assignmentName: values.assignmentName,
          class: selectedClass?.name,
          description: values.description,
        } as Deadline;
        break;
      default:
        toast({ title: "Error", description: "Invalid form type.", variant: "destructive" });
        return;
    }
    
    toast({
      title: "Information Submitted!",
      description: `Your ${values.type} "${values.title}" for class ${selectedClass?.name || 'N/A'} has been submitted.`,
    });
    if (onSubmitSuccess) {
      onSubmitSuccess(submissionData);
    }
    form.reset({
      type: activeTab, // Keep current tab
      title: "", 
      date: new Date(), 
      classId: "", 
      content: "", 
      subject: "", 
      assignmentName: "",
      description: ""
    } as any); // Reset form
  }

  return (
    <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
      <TabsList className="grid w-full grid-cols-3 mb-6">
        <TabsTrigger value="announcement"><Megaphone className="mr-2 h-4 w-4 inline-block" />Announcement</TabsTrigger>
        <TabsTrigger value="exam"><BookOpenCheck className="mr-2 h-4 w-4 inline-block" />Exam</TabsTrigger>
        <TabsTrigger value="deadline"><FileText className="mr-2 h-4 w-4 inline-block" />Deadline</TabsTrigger>
      </TabsList>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Common Fields */}
          <FormField control={form.control} name="type" render={({ field }) => <Input type="hidden" {...field} />} />
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl><Input placeholder={`Title for the ${activeTab}`} {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Date & Time</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button variant={"outline"} className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                          {field.value ? format(field.value, "PPP p") : <span>Pick a date and time</span>}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                      {/* Add time picker here if needed, e.g. react-datetime-picker or custom inputs */}
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="classId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Class</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Select a class" /></SelectTrigger></FormControl>
                    <SelectContent>
                      {availableClasses.map(cls => <SelectItem key={cls.id} value={cls.id}>{cls.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          {/* Specific Fields based on Tab */}
          <TabsContent value="announcement" className="space-y-6 mt-0 border-none p-0">
             <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Announcement Content</FormLabel>
                  <FormControl><Textarea placeholder="Detailed information..." {...field} rows={4} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </TabsContent>
          <TabsContent value="exam" className="space-y-6 mt-0 border-none p-0">
            <FormField
              control={form.control}
              name="subject"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Exam Subject</FormLabel>
                  <FormControl><Input placeholder="e.g., Mathematics, Physics" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </TabsContent>
          <TabsContent value="deadline" className="space-y-6 mt-0 border-none p-0">
            <FormField
              control={form.control}
              name="assignmentName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Assignment Name</FormLabel>
                  <FormControl><Input placeholder="e.g., History Essay, Science Project" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </TabsContent>
          
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Additional Description (Optional)</FormLabel>
                <FormControl><Textarea placeholder="Any extra details or notes..." {...field} rows={3} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full sm:w-auto">
            <PlusCircle className="mr-2 h-4 w-4" /> Submit Information
          </Button>
        </form>
      </Form>
    </Tabs>
  );
}

