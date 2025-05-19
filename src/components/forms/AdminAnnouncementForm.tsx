
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
import { CalendarIcon, PlusCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { format, parse } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import type { Announcement } from "@/types";
import React, { useEffect, useState } from "react";

const announcementFormSchema = z.object({
  title: z.string().min(3, { message: "Title must be at least 3 characters." }),
  content: z.string().min(10, { message: "Content must be at least 10 characters." }),
  date: z.date({ required_error: "A date for the announcement is required." }),
});

type AnnouncementFormValues = z.infer<typeof announcementFormSchema>;

interface AdminAnnouncementFormProps {
  onSubmitSuccess?: (data: Announcement) => void;
  initialData?: Partial<AnnouncementFormValues & { id?: string }>;
}

export function AdminAnnouncementForm({ onSubmitSuccess, initialData }: AdminAnnouncementFormProps) {
  const { toast } = useToast();
  const form = useForm<AnnouncementFormValues>({
    resolver: zodResolver(announcementFormSchema),
    defaultValues: {
      title: initialData?.title || "",
      content: initialData?.content || "",
      date: initialData?.date ? new Date(initialData.date) : new Date(),
    },
  });

  async function onSubmit(values: AnnouncementFormValues) {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    const newAnnouncement: Announcement = {
      id: initialData?.id || `ann-${Date.now()}`,
      ...values,
      date: values.date.toISOString(),
      type: 'announcement',
    };
    
    toast({
      title: initialData?.id ? "Announcement Updated!" : "Announcement Posted!",
      description: `"${newAnnouncement.title}" has been successfully ${initialData?.id ? 'updated' : 'posted'}.`,
    });
    if (onSubmitSuccess) {
      onSubmitSuccess(newAnnouncement);
    }
    if (!initialData?.id) { // Reset form only if it's a new announcement
      form.reset({ title: "", content: "", date: new Date() });
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
            const [timeInput, setTimeInput] = useState(() =>
              field.value ? format(field.value, "HH:mm") : "00:00"
            );

            useEffect(() => {
              if (field.value) {
                setTimeInput(format(field.value, "HH:mm"));
              }
            }, [field.value]);

            const handleDateSelect = (selectedDate?: Date) => {
              if (!selectedDate) return;
              const [hours, minutes] = timeInput.split(":").map(Number);
              const newDate = new Date(selectedDate);
              newDate.setHours(hours);
              newDate.setMinutes(minutes);
              field.onChange(newDate);
            };

            const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
              const newTime = e.target.value;
              setTimeInput(newTime);
              const [hours, minutes] = newTime.split(":").map(Number);
              const currentDate = field.value ? new Date(field.value) : new Date();
              currentDate.setHours(hours);
              currentDate.setMinutes(minutes);
              field.onChange(currentDate);
            };

            return (
              <FormItem className="flex flex-col">
                <FormLabel>Announcement Date and Time</FormLabel>
                <div className="flex items-center gap-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "flex-grow pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP p")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
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
                    </PopoverContent>
                  </Popover>
                  <FormControl>
                    <Input
                      type="time"
                      value={timeInput}
                      onChange={handleTimeChange}
                      className="w-[120px]"
                    />
                  </FormControl>
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
