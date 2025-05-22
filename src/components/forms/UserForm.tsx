
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

const baseUserSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  username: z.string().min(3, { message: "Username must be at least 3 characters." }),
  role: z.enum(["admin", "delegate"], { required_error: "User role is required." }),
});

const userFormSchema = baseUserSchema.extend({
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
  confirmPassword: z.string().min(6, { message: "Please confirm your password." }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match.",
  path: ["confirmPassword"],
});

const editUserFormSchema = baseUserSchema.extend({
  password: z.string().optional().or(z.literal('')),
  confirmPassword: z.string().optional().or(z.literal('')),
}).superRefine((data, ctx) => {
  if (data.password && data.password.trim() !== "") { // If user is trying to set/change a password
    if (data.password.length < 6) {
      ctx.addIssue({
        code: z.ZodIssueCode.too_small,
        minimum: 6,
        type: "string",
        inclusive: true,
        message: "New password must be at least 6 characters.", // Updated message key
        path: ["password"],
      });
    }
    if (!data.confirmPassword || data.confirmPassword.trim() === "") {
       ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Please confirm your new password.", // Updated message key
          path: ["confirmPassword"],
      });
    } else if (data.password !== data.confirmPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Passwords do not match.", // Updated message key
        path: ["confirmPassword"],
      });
    }
  } else {
    // If password field is empty, but confirmPassword is not, it's an error
    if (data.confirmPassword && data.confirmPassword.trim() !== "") {
      ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Enter the new password first before confirming.", // Updated message key
          path: ["password"], // Error on the password field, as it should be filled first
      });
    }
  }
});

type UserFormValues = z.infer<typeof userFormSchema>; // Base type for form values
type EditUserFormValues = z.infer<typeof editUserFormSchema>;


interface UserFormProps {
  onSubmitSuccess?: (data: UserFormSubmitValues) => void;
  initialData?: Partial<UserFormValues & { id?: string }>;
  isEditing?: boolean;
}

export function UserForm({ onSubmitSuccess, initialData, isEditing = false }: UserFormProps) {
  const { t } = useLanguage();
  const currentFormSchema = isEditing ? editUserFormSchema : userFormSchema;
  
  const form = useForm<UserFormValues | EditUserFormValues>({ // Allow either type
    resolver: zodResolver(currentFormSchema),
    defaultValues: {
      name: initialData?.name || "",
      username: initialData?.username || "",
      role: initialData?.role || "delegate",
      password: "", 
      confirmPassword: "",
    },
  });

  useEffect(() => {
    if (initialData) {
      form.reset({
        name: initialData.name || "",
        username: initialData.username || "",
        role: initialData.role || "delegate",
        password: "", 
        confirmPassword: "",
      });
    } else {
      form.reset({
        name: "",
        username: "",
        role: "delegate",
        password: "",
        confirmPassword: "",
      });
    }
  }, [initialData, form, isEditing]);


  async function onSubmit(values: UserFormValues | EditUserFormValues) { // Allow either type
    const payload: UserFormSubmitValues = {
      id: initialData?.id || `user-${Date.now()}-${Math.random().toString(36).substring(2,7)}`,
      name: values.name,
      username: values.username,
      role: values.role as UserRole,
    };

    if (values.password && values.password.trim() !== "") {
      // For new users, schema ensures password is valid and confirmed.
      // For edits, schema ensures if password is set, it's valid and confirmed.
      payload.password = values.password;
    } else if (!isEditing && (!values.password || values.password.trim() === "")) {
      // This case should be caught by Zod schema for new users
      form.setError("password", {type: "manual", message: t('passwordRequiredForNewUser')});
      return;
    }
    
    if (onSubmitSuccess) {
      onSubmitSuccess(payload); 
    }

     if (!isEditing) {
      form.reset({ name: "", username: "", role: "delegate", password: "", confirmPassword: "" });
    } else {
      // For editing, reset password fields but keep other data for potential further edits
      form.reset({...values, password: "", confirmPassword: ""}); 
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
        {/* Confirm Password Field */}
        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{isEditing ? t('confirmNewPasswordLabel') : t('confirmPasswordLabel')}</FormLabel>
              <FormControl>
                <Input type="password" placeholder="••••••••" {...field} />
              </FormControl>
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

    