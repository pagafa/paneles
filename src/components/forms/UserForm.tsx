
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
import { useLanguage } from "@/context/LanguageContext";
import { useEffect } from "react";

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
        password: "", // Keep password field empty on edit form load
      });
    } else {
      form.reset({
        name: "",
        username: "",
        role: "delegate",
        password: "",
      });
    }
  }, [initialData, form]);


  async function onSubmit(values: UserFormValues) {
    const payload: any = { ...values }; // Use 'any' temporarily for password deletion

    if (isEditing && !values.password) {
      delete payload.password;
    } else if (!isEditing && !values.password) {
        form.setError("password", {type: "manual", message: t('passwordRequiredForNewUser')}); // Assuming this key exists
        return;
    }

    // No artificial delay: await new Promise(resolve => setTimeout(resolve, 500));
    const userToSubmit: User & { password?: string } = {
      id: initialData?.id || `user-${Date.now()}-${Math.random().toString(36).substring(2,7)}`,
      name: payload.name,
      username: payload.username,
      role: payload.role as UserRole,
      ...(payload.password && { password: payload.password }), // Include password only if it's present
    };
    
    // Toast messages are handled by the parent page
    if (onSubmitSuccess) {
      onSubmitSuccess(userToSubmit as User); // Pass without password for client-side user object
    }

     if (!isEditing) {
      form.reset({ name: "", username: "", role: "delegate", password: "" });
    } else {
      // After editing, reset password field but keep other values if needed, or refetch
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
              {isEditing && <p className="text-xs text-muted-foreground">{t('usernameEditWarning')}</p>}
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
