
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
// import { useToast } from "@/hooks/use-toast"; // Toast will be handled by parent
import type { SchoolEvent, Announcement, Exam, Deadline, SchoolClass } from "@/types";
import { mockClasses } from "@/lib/placeholder-data"; 
import { useState, useEffect } from "react";
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
  availableClasses?: SchoolClass[];
  initialData?: SchoolEvent | null;
}

export function DelegateInputForm({ 
  onSubmitSuccess, 
  availableClasses = mockClasses,
  initialData 
}: DelegateInputFormProps) {
  // const { toast } = useToast(); // Toast handled by parent
  const [activeTab, setActiveTab] = useState<"announcement" | "exam" | "deadline">("announcement");

  const form = useForm<DelegateInputFormValues>({
    resolver: zodResolver(delegateInputFormSchema),
    // Default values will be set by useEffect based on initialData or activeTab
  } as any); 
  
  useEffect(() => {
    if (initialData) {
      setActiveTab(initialData.type);
      const classIdForForm = availableClasses.find(c => c.name === initialData.class)?.id || "";
      
      let resetValues: Partial<DelegateInputFormValues> = {
        // Common fields
        title: initialData.title,
        date: new Date(initialData.date),
        classId: classIdForForm,
        description: initialData.description || "",
        type: initialData.type,
      };

      // Type-specific fields
      switch (initialData.type) {
        case 'announcement':
          resetValues.content = (initialData as Announcement).content;
          resetValues.subject = undefined;
          resetValues.assignmentName = undefined;
          break;
        case 'exam':
          resetValues.subject = (initialData as Exam).subject;
          resetValues.content = undefined;
          resetValues.assignmentName = undefined;
          break;
        case 'deadline':
          resetValues.assignmentName = (initialData as Deadline).assignmentName;
          resetValues.content = undefined;
          resetValues.subject = undefined;
          break;
      }
      form.reset(resetValues as DelegateInputFormValues);
    } else {
      // Reset to a new form state for the currently active tab
      form.reset({
        type: activeTab,
        title: "",
        date: new Date(),
        classId: "",
        description: "",
        content: activeTab === "announcement" ? "" : undefined,
        subject: activeTab === "exam" ? "" : undefined,
        assignmentName: activeTab === "deadline" ? "" : undefined,
      } as any);
    }
  }, [initialData, form, activeTab, availableClasses]);


  const handleTabChange = (value: string) => {
    const newType = value as "announcement" | "exam" | "deadline";
    setActiveTab(newType);
    // If not editing, reset form fields for the new type
    if (!initialData) {
        form.reset({ 
            type: newType,
            title: "", // Keep common fields or reset them based on desired UX
            date: new Date(),
            classId: "",
            description: "",
            content: newType === "announcement" ? "" : undefined,
            subject: newType === "exam" ? "" : undefined,
            assignmentName: newType === "deadline" ? "" : undefined,
        } as any);
    } else {
      // If editing, just set the type, useEffect will handle reset if initialData changes
      form.setValue("type", newType);
    }
  };


  async function onSubmit(values: DelegateInputFormValues) {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const selectedClass = availableClasses.find(c => c.id === values.classId);
    let submissionData: SchoolEvent;
    const id = initialData?.id || `del-${values.type}-${Date.now()}`;

    switch (values.type) {
      case 'announcement':
        submissionData = {
          id,
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
          id,
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
          id,
          title: values.title,
          date: values.date.toISOString(),
          type: 'deadline',
          assignmentName: values.assignmentName,
          class: selectedClass?.name,
          description: values.description,
        } as Deadline;
        break;
      default:
        // This case should ideally not be reached due to schema validation
        console.error("Invalid form type submitted");
        return;
    }
    
    if (onSubmitSuccess) {
      onSubmitSuccess(submissionData);
    }
    // Form reset is handled by parent component by clearing initialData or by useEffect if !initialData
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
                  <Select onValueChange={field.onChange} value={field.value || ""} disabled={availableClasses.length === 0}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Select a class" /></SelectTrigger></FormControl>
                    <SelectContent>
                      {availableClasses.map(cls => <SelectItem key={cls.id} value={cls.id}>{cls.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  {availableClasses.length === 0 && <p className="text-xs text-muted-foreground">No classes assigned to you to submit for.</p>}
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
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

          <Button type="submit" className="w-full sm:w-auto" disabled={availableClasses.length === 0 && !initialData}>
            <PlusCircle className="mr-2 h-4 w-4" /> {initialData ? "Update Information" : "Submit Information"}
          </Button>
        </form>
      </Form>
    </Tabs>
  );
}
