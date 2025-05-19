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
import { UserPlus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { User, UserRole } from "@/types";

const userFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  username: z.string().min(3, { message: "Username must be at least 3 characters." }),
  role: z.enum(["admin", "delegate"], { required_error: "User role is required." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }).optional(), // Optional for edit, required for create
});

// Modify schema for editing to make password optional
const editUserFormSchema = userFormSchema.extend({
  password: userFormSchema.shape.password.optional(),
});

type UserFormValues = z.infer<typeof userFormSchema>;

interface UserFormProps {
  onSubmitSuccess?: (data: User) => void;
  initialData?: Partial<UserFormValues & { id?: string }>;
  isEditing?: boolean;
}

export function UserForm({ onSubmitSuccess, initialData, isEditing = false }: UserFormProps) {
  const { toast } = useToast();
  const currentFormSchema = isEditing ? editUserFormSchema : userFormSchema;
  
  const form = useForm<UserFormValues>({
    resolver: zodResolver(currentFormSchema),
    defaultValues: {
      name: initialData?.name || "",
      username: initialData?.username || "",
      role: initialData?.role || "delegate",
      password: "", // Password field is always empty initially for security
    },
  });

  async function onSubmit(values: UserFormValues) {
    // In a real app, don't send password if not changed during edit
    // This is simplified for mock
    if (isEditing && !values.password) {
      delete values.password;
    } else if (!isEditing && !values.password) {
        form.setError("password", {type: "manual", message: "Password is required for new users."});
        return;
    }


    await new Promise(resolve => setTimeout(resolve, 500));
    const newUser: User = {
      id: initialData?.id || `user-${Date.now()}`,
      name: values.name,
      username: values.username,
      role: values.role as UserRole,
    };
    
    toast({
      title: isEditing ? "User Updated!" : "User Created!",
      description: `User "${newUser.name}" has been successfully ${isEditing ? 'updated' : 'created'}.`,
    });

    if (onSubmitSuccess) {
      onSubmitSuccess(newUser);
    }
     if (!isEditing) {
      form.reset({ name: "", username: "", role: "delegate", password: "" });
    } else {
      form.reset({...form.getValues(), password: ""}); // Reset password field after edit
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
              <FormLabel>Full Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., John Doe" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input type="text" placeholder="e.g., john_d" {...field} disabled={isEditing} />
              </FormControl>
              {isEditing && <p className="text-xs text-muted-foreground">Username cannot be changed after creation.</p>}
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel>User Role</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="delegate">Delegate</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{isEditing ? "New Password (Optional)" : "Password"}</FormLabel>
              <FormControl>
                <Input type="password" placeholder="••••••••" {...field} />
              </FormControl>
              {isEditing && <p className="text-xs text-muted-foreground">Leave blank to keep current password.</p>}
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full sm:w-auto">
          <UserPlus className="mr-2 h-4 w-4" />
          {isEditing ? "Update User" : "Create User"}
        </Button>
      </form>
    </Form>
  );
}
