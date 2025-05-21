
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
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
import { CalendarIcon, PlusCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import type { Announcement, SchoolClass } from "@/types";
import React, { useEffect } from "react";
import { Checkbox } from "@/components/ui/checkbox";

const announcementFormSchema = z.object({
  title: z.string().min(3, { message: "Title must be at least 3 characters." }),
  content: z.string().min(10, { message: "Content must be at least 10 characters." }),
  date: z.date({ required_error: "A date for the announcement is required." }),
  targetClassIds: z.array(z.string()).optional(),
});

type AnnouncementFormValues = z.infer<typeof announcementFormSchema>;

interface AdminAnnouncementFormProps {
  onSubmitSuccess?: (data: Announcement) => void;
  initialData?: Partial<AnnouncementFormValues & { id?: string }>;
  availableClasses: SchoolClass[]; // Changed: No longer optional, must be provided
}

const CLASSES_COLUMN_THRESHOLD = 5; // Show columns if more than 5 classes

export function AdminAnnouncementForm({ 
  onSubmitSuccess, 
  initialData,
  availableClasses // Removed default value
}: AdminAnnouncementFormProps) {
  const { toast } = useToast();
  const form = useForm<AnnouncementFormValues>({
    resolver: zodResolver(announcementFormSchema),
    defaultValues: {
      title: initialData?.title || "",
      content: initialData?.content || "",
      date: initialData?.date ? new Date(initialData.date) : new Date(),
      targetClassIds: initialData?.targetClassIds || [],
    },
  });

   useEffect(() => {
    if (initialData) {
      form.reset({
        title: initialData.title || "",
        content: initialData.content || "",
        date: initialData.date ? new Date(initialData.date) : new Date(),
        targetClassIds: initialData.targetClassIds || [],
      });
    }
  }, [initialData, form]);

  async function onSubmit(values: AnnouncementFormValues) {
    const newAnnouncement: Announcement = {
      id: initialData?.id || `ann-${Date.now()}`,
      title: values.title,
      content: values.content,
      date: values.date.toISOString(),
      type: 'announcement',
      targetClassIds: values.targetClassIds && values.targetClassIds.length > 0 ? values.targetClassIds : [], 
    };
    
    toast({
      title: initialData?.id ? "Announcement Updated!" : "Announcement Posted!",
      description: `"${newAnnouncement.title}" has been successfully ${initialData?.id ? 'updated' : 'posted'}.`,
    });
    if (onSubmitSuccess) {
      onSubmitSuccess(newAnnouncement);
    }
    if (!initialData?.id) { 
      form.reset({ title: "", content: "", date: new Date(), targetClassIds: [] });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Announcement Title</FormLabel>
              <FormControl>
                <Input placeholder="e.g., School Holiday Notice" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Content</FormLabel>
              <FormControl>
                <Textarea placeholder="Detailed information about the announcement..." {...field} rows={5} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
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
                <FormLabel>Announcement Date and Time</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {field.value ? (
                          format(field.value, "PPP HH:mm")
                        ) : (
                          <span>Pick a date and time</span>
                        )}
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={handleDateSelect}
                      initialFocus
                    />
                    <div className="p-2 border-t border-border">
                      <p className="text-sm font-medium mb-2 text-center">Select time</p>
                      <div className="flex gap-2 justify-center">
                        <Select
                          value={String(currentHour).padStart(2, '0')}
                          onValueChange={handleHourChange}
                        >
                          <SelectTrigger className="w-[70px]">
                            <SelectValue placeholder="HH" />
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
                            <SelectValue placeholder="MM" />
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
          name="targetClassIds"
          render={({ field }) => {
            const allClassIds = availableClasses ? availableClasses.map(cls => cls.id) : [];
            const areAllSelected = availableClasses && field.value && field.value.length === allClassIds.length && field.value.length > 0;
            const buttonText = areAllSelected ? "Deselect All Classes" : "Select All Classes";
            
            return (
              <FormItem>
                <div className="mb-2">
                  <FormLabel className="text-base">Target Classes</FormLabel>
                  <FormDescription>
                    Select classes to target. Leave all unchecked for a school-wide announcement.
                  </FormDescription>
                </div>

                {availableClasses && availableClasses.length > 0 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mb-3 text-xs"
                    onClick={() => {
                      if (areAllSelected) {
                        field.onChange([]);
                      } else {
                        field.onChange(allClassIds);
                      }
                    }}
                  >
                    {buttonText}
                  </Button>
                )}

                <div className={cn(
                  availableClasses && availableClasses.length > CLASSES_COLUMN_THRESHOLD 
                    ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-1" 
                    : "space-y-1" 
                )}>
                  {(availableClasses || []).map((classItem) => (
                    <FormField
                      key={classItem.id}
                      control={form.control}
                      name="targetClassIds"
                      render={({ field: checkboxField }) => {
                        return (
                          <FormItem
                            className="flex flex-row items-center space-x-2 space-y-0 py-1"
                          >
                            <FormControl>
                              <Checkbox
                                checked={checkboxField.value?.includes(classItem.id)}
                                onCheckedChange={(checked) => {
                                  const currentValue = checkboxField.value || [];
                                  if (checked) {
                                    checkboxField.onChange([...currentValue, classItem.id]);
                                  } else {
                                    checkboxField.onChange(
                                      currentValue.filter((id) => id !== classItem.id)
                                    );
                                  }
                                }}
                              />
                            </FormControl>
                            <FormLabel className="font-normal text-sm leading-none cursor-pointer">
                              {classItem.name}
                            </FormLabel>
                          </FormItem>
                        );
                      }}
                    />
                  ))}
                </div>
                <FormMessage />
              </FormItem>
            );
          }}
        />

        <Button type="submit" className="w-full sm:w-auto">
          <PlusCircle className="mr-2 h-4 w-4" />
          {initialData?.id ? "Update Announcement" : "Post Announcement"}
        </Button>
      </form>
    </Form>
  );
}
