
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
import type { User, UserRole } from "@/types";
import { useLanguage } from "@/context/LanguageContext";
import { useEffect } from "react";

// Define a type for form submission that includes the optional password
export type UserFormSubmitValues = Omit<User, 'id'> & { id?: string; password?: string };

const userFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  username: z.string().min(3, { message: "Username must be at least 3 characters." }),
  role: z.enum(["admin", "delegate"], { required_error: "User role is required." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }).optional().or(z.literal('')), // Allow empty string for optional password
});

// Modify schema for editing to make password explicitly optional and allow empty string
const editUserFormSchema = userFormSchema.extend({
  password: z.string().min(6, { message: "Password must be at least 6 characters." }).optional().or(z.literal('')),
});

type UserFormValues = z.infer<typeof userFormSchema>;

interface UserFormProps {
  onSubmitSuccess?: (data: UserFormSubmitValues) => void; // Changed type here
  initialData?: Partial<UserFormValues & { id?: string }>;
  isEditing?: boolean;
}

export function UserForm({ onSubmitSuccess, initialData, isEditing = false }: UserFormProps) {
  const { t } = useLanguage();
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

  useEffect(() => {
    if (initialData) {
      form.reset({
        name: initialData.name || "",
        username: initialData.username || "",
        role: initialData.role || "delegate",
        password: "", 
      });
    } else {
      form.reset({
        name: "",
        username: "",
        role: "delegate",
        password: "",
      });
    }
  }, [initialData, form, isEditing]);


  async function onSubmit(values: UserFormValues) {
    const payload: UserFormSubmitValues = {
      id: initialData?.id || `user-${Date.now()}-${Math.random().toString(36).substring(2,7)}`,
      name: values.name,
      username: values.username,
      role: values.role as UserRole,
    };

    if (values.password && values.password.trim() !== "") {
      payload.password = values.password;
    } else if (!isEditing && (!values.password || values.password.trim() === "")) {
      form.setError("password", {type: "manual", message: t('passwordRequiredForNewUser')});
      return;
    }
    
    if (onSubmitSuccess) {
      onSubmitSuccess(payload); // Pass the payload with optional password
    }

     if (!isEditing) {
      form.reset({ name: "", username: "", role: "delegate", password: "" });
    } else {
      form.reset({...values, password: ""}); 
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
              <FormLabel>{t('userNameTableHeader')}</FormLabel>
              <FormControl>
                <Input placeholder={t('userNamePlaceholder')} {...field} />
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
              <FormLabel>{t('usernameTableHeader')}</FormLabel>
              <FormControl>
                <Input type="text" placeholder={t('usernamePlaceholder')} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('userRoleTableHeader')}</FormLabel>
              <Select onValueChange={field.onChange} value={field.value || "delegate"}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={t('selectRolePlaceholder')} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="delegate">{t('delegateRoleLabel')}</SelectItem>
                  <SelectItem value="admin">{t('adminRoleLabel')}</SelectItem>
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
              <FormLabel>{isEditing ? t('newPasswordOptionalLabel') : t('passwordLabel')}</FormLabel>
              <FormControl>
                <Input type="password" placeholder="••••••••" {...field} />
              </FormControl>
              {isEditing && <p className="text-xs text-muted-foreground">{t('passwordEditHint')}</p>}
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full sm:w-auto">
          <UserPlus className="mr-2 h-4 w-4" />
          {isEditing ? t('updateUserButton') : t('createUserButton')}
        </Button>
      </form>
    </Form>
  );
}
