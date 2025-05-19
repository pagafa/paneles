
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
import { CalendarIcon, PlusCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import type { Announcement } from "@/types";
import React, { useEffect } from "react";

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
    if (!initialData?.id) { 
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
        <Button type="submit" className="w-full sm:w-auto">
          <PlusCircle className="mr-2 h-4 w-4" />
          {initialData?.id ? "Update Announcement" : "Post Announcement"}
        </Button>
      </form>
    </Form>
  );
}
