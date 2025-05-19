
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
// mockClasses removed as availableClasses is now a prop
import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLanguage } from "@/context/LanguageContext";

const commonSchema = {
  title: z.string().min(3, "Title is too short.").default(""),
  date: z.date({ required_error: "Date is required." }),
  classId: z.string().min(1, "Class selection is required.").default(""),
  description: z.string().optional().default(""),
  submittedByDelegateId: z.string().optional(), // For tracking who submitted
};

const announcementSchema = z.object({
  ...commonSchema,
  type: z.literal("announcement"),
  content: z.string().min(10, "Content is too short.").optional().default(""),
  // Fields not relevant to announcement, but part of the discriminated union base
  subject: z.string().optional().default(""), 
  assignmentName: z.string().optional().default(""),
});

const examSchema = z.object({
  ...commonSchema,
  type: z.literal("exam"),
  subject: z.string().min(2, "Subject is too short.").default(""), // Made .default("") instead of optional
  // Fields not relevant to exam
  content: z.string().optional().default(""),
  assignmentName: z.string().optional().default(""),
});

const deadlineSchema = z.object({
  ...commonSchema,
  type: z.literal("deadline"),
  assignmentName: z.string().min(3, "Assignment name is too short.").default(""), // Made .default("")
  // Fields not relevant to deadline
  content: z.string().optional().default(""),
  subject: z.string().optional().default(""),
});

const delegateInputFormSchema = z.discriminatedUnion("type", [
  announcementSchema,
  examSchema,
  deadlineSchema,
]);

type DelegateInputFormValues = z.infer<typeof delegateInputFormSchema>;

interface DelegateInputFormProps {
  onSubmitSuccess?: (data: SchoolEvent) => void;
  availableClasses?: SchoolClass[]; // Now explicitly passed
  initialData?: SchoolEvent | null;
}

export function DelegateInputForm({
  onSubmitSuccess,
  availableClasses = [], // Default to empty array if not provided
  initialData
}: DelegateInputFormProps) {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<"announcement" | "exam" | "deadline">(
    initialData?.type || "announcement"
  );

  const form = useForm<DelegateInputFormValues>({
    resolver: zodResolver(delegateInputFormSchema),
    defaultValues: { 
      type: initialData?.type || activeTab || "announcement",
      title: initialData?.title || "",
      date: initialData?.date ? new Date(initialData.date) : new Date(),
      classId: initialData?.type === 'announcement' ? (initialData as Announcement & {classId?:string}).classId || "" 
               : initialData?.type === 'exam' ? (initialData as Exam).classId || "" 
               : initialData?.type === 'deadline' ? (initialData as Deadline).classId || ""
               : (availableClasses && availableClasses.length === 1 && !initialData) ? availableClasses[0].id : "",
      description: initialData?.description || "",
      content: initialData?.type === 'announcement' ? (initialData as Announcement).content || "" : "",
      subject: initialData?.type === 'exam' ? (initialData as Exam).subject || "" : "",
      assignmentName: initialData?.type === 'deadline' ? (initialData as Deadline).assignmentName || "" : "",
      submittedByDelegateId: initialData?.submittedByDelegateId || undefined,
    },
  });

  useEffect(() => {
    let classIdToSet = "";
    if (initialData) {
      if (initialData.type !== activeTab) {
        setActiveTab(initialData.type);
      }
      // Determine classId from initialData based on its type, as 'class' (name) might be on old data.
      // Prioritize classId if present.
      if (initialData.type === 'announcement') {
        classIdToSet = (initialData as Announcement & { classId?: string }).classId || availableClasses.find(c => (initialData as Announcement).targetClassIds?.includes(c.id))?.id || "";
      } else if (initialData.type === 'exam') {
        classIdToSet = (initialData as Exam).classId || "";
      } else if (initialData.type === 'deadline') {
        classIdToSet = (initialData as Deadline).classId || "";
      }

      form.reset({
        type: initialData.type,
        title: initialData.title || "",
        date: initialData.date ? new Date(initialData.date) : new Date(),
        classId: classIdToSet,
        description: initialData.description || "",
        content: initialData.type === 'announcement' ? (initialData as Announcement).content || "" : "",
        subject: initialData.type === 'exam' ? (initialData as Exam).subject || "" : "",
        assignmentName: initialData.type === 'deadline' ? (initialData as Deadline).assignmentName || "" : "",
        submittedByDelegateId: initialData.submittedByDelegateId || undefined,
      });
    } else {
      // New submission
      if (availableClasses && availableClasses.length === 1) {
        classIdToSet = availableClasses[0].id;
      }
      form.reset({
        type: activeTab,
        title: "",
        date: new Date(),
        classId: classIdToSet,
        description: "",
        content: "",
        subject: "",
        assignmentName: "",
        submittedByDelegateId: undefined, // Reset for new submissions
      });
    }
  }, [initialData, activeTab, availableClasses, form]);


  const handleTabChange = (value: string) => {
    const newType = value as "announcement" | "exam" | "deadline";
    setActiveTab(newType);
    // useEffect above will handle form reset based on newType and !initialData
  };


  async function onSubmit(values: DelegateInputFormValues) {
    // await new Promise(resolve => setTimeout(resolve, 500)); // Artificial delay removed

    // const selectedClass = availableClasses.find(c => c.id === values.classId); // Not strictly needed if submitting classId
    let submissionData: SchoolEvent;
    const id = initialData?.id || `evt-${values.type}-${Date.now()}`;

    switch (values.type) {
      case 'announcement':
        submissionData = {
          id,
          title: values.title,
          date: values.date.toISOString(),
          type: 'announcement',
          content: values.content || "",
          classId: values.classId, // Delegate announcements target a single class via classId
          description: values.description,
          submittedByDelegateId: values.submittedByDelegateId,
        } as Announcement & {classId?: string}; // Ensure type compatibility
        break;
      case 'exam':
        submissionData = {
          id,
          title: values.title,
          date: values.date.toISOString(),
          type: 'exam',
          subject: values.subject || "",
          classId: values.classId,
          description: values.description,
          submittedByDelegateId: values.submittedByDelegateId,
        } as Exam;
        break;
      case 'deadline':
        submissionData = {
          id,
          title: values.title,
          date: values.date.toISOString(),
          type: 'deadline',
          assignmentName: values.assignmentName || "",
          classId: values.classId,
          description: values.description,
          submittedByDelegateId: values.submittedByDelegateId,
        } as Deadline;
        break;
      default:
        const _exhaustiveCheck: never = values;
        console.error("Invalid form type submitted", _exhaustiveCheck);
        return;
    }

    if (onSubmitSuccess) {
      onSubmitSuccess(submissionData);
    }

    if (!initialData) {
      // Reset form for new submission, keeping activeTab and classId if only one available
      let classIdToSet = values.classId; // Keep user's selection or auto-selection
      if (availableClasses && availableClasses.length === 1 && !values.classId) {
         classIdToSet = availableClasses[0].id; // Re-apply auto-selection if user cleared it
      }

      form.reset({
        type: activeTab, 
        title: "",
        date: new Date(),
        classId: classIdToSet,
        description: "",
        content: "",
        subject: "",
        assignmentName: "",
        submittedByDelegateId: undefined, // Important to reset this
      });
    }
  }

  const getTabName = (tabValue: "announcement" | "exam" | "deadline"): string => {
    if (tabValue === "announcement") return t("announcementTabLabel");
    if (tabValue === "exam") return t("examTabLabel");
    if (tabValue === "deadline") return t("deadlineTabLabel");
    return "";
  }

  return (
    <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
      <TabsList className="grid w-full grid-cols-3 mb-6">
        <TabsTrigger value="announcement"><Megaphone className="mr-2 h-4 w-4 inline-block" />{t('announcementTabLabel')}</TabsTrigger>
        <TabsTrigger value="exam"><BookOpenCheck className="mr-2 h-4 w-4 inline-block" />{t('examTabLabel')}</TabsTrigger>
        <TabsTrigger value="deadline"><FileText className="mr-2 h-4 w-4 inline-block" />{t('deadlineTabLabel')}</TabsTrigger>
      </TabsList>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField control={form.control} name="type" render={({ field }) => <Input type="hidden" {...field} />} />

          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('formTitleLabel')}</FormLabel>
                <FormControl><Input placeholder={t('formTitlePlaceholder', { tabName: getTabName(activeTab) })} {...field} value={field.value || ""} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => {
                const currentHour = field.value ? field.value.getHours() : new Date().getHours();
                const currentMinute = field.value ? field.value.getMinutes() : new Date().getMinutes();

                const handleDateSelect = (selectedDate?: Date) => {
                  if (!selectedDate) return;
                  const newDate = new Date(selectedDate);
                  newDate.setHours(currentHour);
                  newDate.setMinutes(currentMinute);
                  newDate.setSeconds(0);
                  newDate.setMilliseconds(0);
                  field.onChange(newDate);
                };

                const handleHourChange = (hourString: string) => {
                  const hour = parseInt(hourString, 10);
                  const newDate = new Date(field.value || new Date());
                  newDate.setHours(hour);
                  field.onChange(newDate);
                };

                const handleMinuteChange = (minuteString: string) => {
                  const minute = parseInt(minuteString, 10);
                  const newDate = new Date(field.value || new Date());
                  newDate.setMinutes(minute);
                  field.onChange(newDate);
                };

                return (
                  <FormItem className="flex flex-col">
                    <FormLabel>{t('formDateTimeLabel')}</FormLabel>
                     <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                                variant={"outline"}
                                className={cn("w-full justify-start text-left font-normal", !field.value && "text-muted-foreground")}>
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {field.value ? format(field.value, "PPP HH:mm") : <span>{t('formPickDateTimeButton')}</span>}
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar mode="single" selected={field.value} onSelect={handleDateSelect} initialFocus />
                           <div className="p-2 border-t border-border">
                            <p className="text-sm font-medium mb-2 text-center">{t('formSelectTimeLabel')}</p>
                            <div className="flex gap-2 justify-center">
                                <Select
                                    value={String(currentHour).padStart(2, '0')}
                                    onValueChange={handleHourChange}
                                >
                                    <SelectTrigger className="w-[70px]">
                                        <SelectValue placeholder="HH"/>
                                    </SelectTrigger>
                                    <SelectContent>
                                    {Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0')).map(hour => (
                                        <SelectItem key={hour} value={hour}>{hour}</SelectItem>
                                    ))}
                                    </SelectContent>
                                </Select>
                                <span className="text-xl font-bold">:</span>
                                <Select
                                    value={String(currentMinute).padStart(2, '0')}
                                    onValueChange={handleMinuteChange}
                                >
                                    <SelectTrigger className="w-[70px]">
                                        <SelectValue placeholder="MM"/>
                                    </SelectTrigger>
                                    <SelectContent>
                                    {Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0')).map(minute => (
                                        <SelectItem key={minute} value={minute}>{minute}</SelectItem>
                                    ))}
                                    </SelectContent>
                                </Select>
                            </div>
                           </div>
                        </PopoverContent>
                      </Popover>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />
            <FormField
              control={form.control}
              name="classId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('formClassLabel')}</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value || ""} disabled={availableClasses.length === 0}>
                    <FormControl><SelectTrigger><SelectValue placeholder={t('formSelectClassPlaceholder')} /></SelectTrigger></FormControl>
                    <SelectContent>
                      {availableClasses.map(cls => <SelectItem key={cls.id} value={cls.id}>{cls.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  {availableClasses.length === 0 && <p className="text-xs text-muted-foreground">{t('formNoAssignedClassesWarning')}</p>}
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <TabsContent value="announcement" className="space-y-6 mt-0 border-none p-0">
             <FormField
              control={form.control}
              name="content" // This should be "content" for announcement type
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('formAnnouncementContentLabel')}</FormLabel>
                  <FormControl><Textarea placeholder={t('formAnnouncementContentPlaceholder')} {...field} value={field.value || ""} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </TabsContent>
          <TabsContent value="exam" className="space-y-6 mt-0 border-none p-0">
            <FormField
              control={form.control}
              name="subject" // This should be "subject" for exam type
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('formExamSubjectLabel')}</FormLabel>
                  <FormControl><Input placeholder={t('formExamSubjectPlaceholder')} {...field} value={field.value || ""} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </TabsContent>
          <TabsContent value="deadline" className="space-y-6 mt-0 border-none p-0">
            <FormField
              control={form.control}
              name="assignmentName" // This should be "assignmentName" for deadline type
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('formDeadlineAssignmentNameLabel')}</FormLabel>
                  <FormControl><Input placeholder={t('formDeadlineAssignmentNamePlaceholder')} {...field} value={field.value || ""} /></FormControl>
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
                <FormLabel>{t('formAdditionalDescriptionLabel')}</FormLabel>
                <FormControl><Textarea placeholder={t('formAdditionalDescriptionPlaceholder')} rows={3} {...field} value={field.value || ""} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full sm:w-auto" disabled={availableClasses.length === 0 && !initialData}>
            <PlusCircle className="mr-2 h-4 w-4" /> {initialData ? t('formUpdateButton') : t('formSubmitButton')}
          </Button>
        </form>
      </Form>
    </Tabs>
  );
}
