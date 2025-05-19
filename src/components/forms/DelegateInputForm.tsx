
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
  content: z.string().min(10, "Content is too short.").optional().default(""),
  subject: z.string().optional(),
  assignmentName: z.string().optional(),
});

const examSchema = z.object({
  ...commonSchema,
  type: z.literal("exam"),
  subject: z.string().min(2, "Subject is too short.").optional().default(""),
  content: z.string().optional(),
  assignmentName: z.string().optional(),
});

const deadlineSchema = z.object({
  ...commonSchema,
  type: z.literal("deadline"),
  assignmentName: z.string().min(3, "Assignment name is too short.").optional().default(""),
  content: z.string().optional(),
  subject: z.string().optional(),
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
  const [activeTab, setActiveTab] = useState<"announcement" | "exam" | "deadline">(initialData?.type || "announcement");

  const form = useForm<DelegateInputFormValues>({
    resolver: zodResolver(delegateInputFormSchema),
    defaultValues: {
      type: initialData?.type || "announcement",
      title: initialData?.title || "",
      date: initialData?.date ? new Date(initialData.date) : new Date(),
      classId: initialData?.class ? availableClasses.find(c => c.name === initialData.class)?.id || "" : "",
      description: initialData?.description || "",
      content: (initialData?.type === 'announcement' ? (initialData as Announcement).content : "") || "",
      subject: (initialData?.type === 'exam' ? (initialData as Exam).subject : "") || "",
      assignmentName: (initialData?.type === 'deadline' ? (initialData as Deadline).assignmentName : "") || "",
    },
  }); 
  
  useEffect(() => {
    if (initialData) {
      setActiveTab(initialData.type);
      const classIdForForm = availableClasses.find(c => c.name === initialData.class)?.id || "";
      
      form.reset({
        title: initialData.title,
        date: new Date(initialData.date),
        classId: classIdForForm,
        description: initialData.description || "",
        type: initialData.type,
        content: initialData.type === 'announcement' ? (initialData as Announcement).content || "" : "",
        subject: initialData.type === 'exam' ? (initialData as Exam).subject || "" : "",
        assignmentName: initialData.type === 'deadline' ? (initialData as Deadline).assignmentName || "" : "",
      });
    } else {
      // Reset for new entry or when activeTab changes for a new entry
      const preservedClassId = form.getValues('classId');
      form.reset({
        type: activeTab,
        title: "",
        date: new Date(),
        classId: preservedClassId,
        description: "",
        content: "", 
        subject: "",
        assignmentName: "",
      });
    }
  }, [initialData, form, activeTab, availableClasses]);


  const handleTabChange = (value: string) => {
    const newType = value as "announcement" | "exam" | "deadline";
    setActiveTab(newType); 

    if (!initialData) {
      form.setValue("type", newType, { shouldValidate: true });
      // The useEffect will handle resetting fields based on activeTab for new entries
    } else {
       form.setValue("type", newType, { shouldValidate: true });
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
          content: values.content || "", 
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
          subject: values.subject || "", 
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
          assignmentName: values.assignmentName || "", 
          class: selectedClass?.name,
          description: values.description,
        } as Deadline;
        break;
      default:
        // This should not happen due to Zod validation
        const _exhaustiveCheck: never = values;
        console.error("Invalid form type submitted", _exhaustiveCheck);
        return;
    }
    
    if (onSubmitSuccess) {
      onSubmitSuccess(submissionData);
    }

    if (!initialData) { // If it was a new submission
      form.reset({
        type: activeTab, // Keep current tab
        title: "",
        date: new Date(), // Reset date to now
        classId: form.getValues('classId'), // Preserve selected class
        description: "",
        content: "",
        subject: "",
        assignmentName: "",
      });
    }
  }

  return (
    <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
      <TabsList className="grid w-full grid-cols-3 mb-6">
        <TabsTrigger value="announcement"><Megaphone className="mr-2 h-4 w-4 inline-block" />Anuncio</TabsTrigger>
        <TabsTrigger value="exam"><BookOpenCheck className="mr-2 h-4 w-4 inline-block" />Exame</TabsTrigger>
        <TabsTrigger value="deadline"><FileText className="mr-2 h-4 w-4 inline-block" />Prazo</TabsTrigger>
      </TabsList>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField control={form.control} name="type" render={({ field }) => <Input type="hidden" {...field} />} />
          
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Título</FormLabel>
                <FormControl><Input placeholder={`Título para ${activeTab}`} {...field} /></FormControl>
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
                  <FormLabel>Data e Hora</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button variant={"outline"} className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                          {field.value ? format(field.value, "PPP p") : <span>Escolle data e hora</span>}
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
                  <FormLabel>Clase</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value || ""} disabled={availableClasses.length === 0}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Selecciona unha clase" /></SelectTrigger></FormControl>
                    <SelectContent>
                      {availableClasses.map(cls => <SelectItem key={cls.id} value={cls.id}>{cls.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  {availableClasses.length === 0 && <p className="text-xs text-muted-foreground">Non tes clases asignadas para enviar información.</p>}
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
                  <FormLabel>Contido do Anuncio</FormLabel>
                  <FormControl><Textarea placeholder="Información detallada..." {...field} value={field.value || ""} /></FormControl>
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
                  <FormLabel>Materia do Exame</FormLabel>
                  <FormControl><Input placeholder="p.ex., Matemáticas, Física" {...field} value={field.value || ""} /></FormControl>
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
                  <FormLabel>Nome da Tarefa</FormLabel>
                  <FormControl><Input placeholder="p.ex., Ensaio de Historia, Proxecto de Ciencias" {...field} value={field.value || ""} /></FormControl>
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
                <FormLabel>Descrición Adicional (Opcional)</FormLabel>
                <FormControl><Textarea placeholder="Calquera detalle ou nota extra..." {...field} rows={3} value={field.value || ""} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full sm:w-auto" disabled={availableClasses.length === 0 && !initialData}>
            <PlusCircle className="mr-2 h-4 w-4" /> {initialData ? "Actualizar Información" : "Enviar Información"}
          </Button>
        </form>
      </Form>
    </Tabs>
  );
}

