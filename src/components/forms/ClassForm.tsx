
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlusCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { SchoolClass, User } from "@/types";
import { mockUsers } from "@/lib/placeholder-data"; // For delegate selection

const classFormSchema = z.object({
  name: z.string().min(2, { message: "Class name must be at least 2 characters." }),
  delegateId: z.string().optional(),
});

type ClassFormValues = z.infer<typeof classFormSchema>;

interface ClassFormProps {
  onSubmitSuccess?: (data: SchoolClass) => void;
  initialData?: Partial<ClassFormValues & { id?: string }>;
  availableDelegates?: User[]; // Pass available delegates
}

const UNASSIGNED_DELEGATE_SELECT_VALUE = "__NONE_OPTION__";

export function ClassForm({ onSubmitSuccess, initialData, availableDelegates = mockUsers.filter(u => u.role === 'delegate') }: ClassFormProps) {
  const { toast } = useToast();
  const form = useForm<ClassFormValues>({
    resolver: zodResolver(classFormSchema),
    defaultValues: {
      name: initialData?.name || "",
      delegateId: initialData?.delegateId || "", // "" represents no delegate in form state
    },
  });

  async function onSubmit(values: ClassFormValues) {
    await new Promise(resolve => setTimeout(resolve, 500));
    const newClass: SchoolClass = {
      id: initialData?.id || `class-${Date.now()}`,
      ...values,
    };
    
    toast({
      title: initialData?.id ? "Class Updated!" : "Class Created!",
      description: `Class "${newClass.name}" has been successfully ${initialData?.id ? 'updated' : 'created'}.`,
    });
    if (onSubmitSuccess) {
      onSubmitSuccess(newClass);
    }
     if (!initialData?.id) {
      form.reset({ name: "", delegateId: "" });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Class Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Grade 10A, Computer Science Club" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="delegateId"
          render={({ field }) => ( 
            <FormItem>
              <FormLabel>Delegate (Optional)</FormLabel>
              <Select
                onValueChange={(valueFromSelect) => {
                  if (valueFromSelect === UNASSIGNED_DELEGATE_SELECT_VALUE) {
                    field.onChange(""); 
                  } else {
                    field.onChange(valueFromSelect); 
                  }
                }}
                value={field.value === "" ? UNASSIGNED_DELEGATE_SELECT_VALUE : field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a delegate" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value={UNASSIGNED_DELEGATE_SELECT_VALUE}>None</SelectItem>
                  {availableDelegates.map(delegate => (
                    <SelectItem key={delegate.id} value={delegate.id}>
                      {delegate.name} ({delegate.username})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full sm:w-auto">
          <PlusCircle className="mr-2 h-4 w-4" />
          {initialData?.id ? "Update Class" : "Create Class"}
        </Button>
      </form>
    </Form>
  );
}
