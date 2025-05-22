
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlusCircle, XCircle } from "lucide-react"; 
import { useToast } from "@/hooks/use-toast";
import type { SchoolClass, User } from "@/types";
import { useState, useEffect, useCallback } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { Checkbox } from "@/components/ui/checkbox";


const classFormSchema = z.object({
  name: z.string().min(2, { message: "Class name must be at least 2 characters." }),
  delegateId: z.string().optional(),
  isHidden: z.boolean().optional().default(false),
});

type ClassFormValues = z.infer<typeof classFormSchema>;

interface ClassFormProps {
  onSubmitSuccess?: (data: SchoolClass) => void;
  initialData?: Partial<ClassFormValues & { id?: string, language?: string, isHidden?: boolean }>;
  isEditing?: boolean;
  onCancelEdit?: () => void;
}

const UNASSIGNED_DELEGATE_SELECT_VALUE = "__NONE_OPTION__";

export function ClassForm({ onSubmitSuccess, initialData, isEditing, onCancelEdit }: ClassFormProps) {
  const { toast } = useToast();
  const { t } = useLanguage();
  const [availableDelegates, setAvailableDelegates] = useState<User[]>([]);
  const [isLoadingDelegates, setIsLoadingDelegates] = useState(true);

  const form = useForm<ClassFormValues>({
    resolver: zodResolver(classFormSchema),
    defaultValues: {
      name: initialData?.name || "",
      delegateId: initialData?.delegateId || "",
      isHidden: initialData?.isHidden || false,
    },
  });

  const fetchDelegates = useCallback(async () => {
    setIsLoadingDelegates(true);
    try {
      const response = await fetch('/api/users');
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: `Failed to fetch users. Status: ${response.status}` }));
        throw new Error(errorData.message);
      }
      const allUsers: User[] = await response.json();
      setAvailableDelegates(allUsers.filter(u => u.role === 'delegate'));
    } catch (error) {
      console.error("Error fetching delegates for ClassForm:", error);
      setAvailableDelegates([]);
      toast({ title: t('errorDialogTitle'), description: t('errorFetchingDelegates', { message: (error as Error).message }), variant: 'destructive' });
    } finally {
      setIsLoadingDelegates(false);
    }
  }, [t, toast]);

  useEffect(() => {
    fetchDelegates();
  }, [fetchDelegates]);

  useEffect(() => {
    if (initialData) {
      form.reset({
        name: initialData.name || "",
        delegateId: initialData.delegateId || "",
        isHidden: initialData.isHidden || false,
      });
    } else {
        form.reset({ name: "", delegateId: "", isHidden: false });
    }
  }, [initialData, form]);


  async function onSubmit(values: ClassFormValues) {
    const classToSubmit: SchoolClass = {
      id: initialData?.id || `class-${Date.now()}-${Math.random().toString(36).substring(2,7)}`,
      name: values.name,
      delegateId: values.delegateId === UNASSIGNED_DELEGATE_SELECT_VALUE ? undefined : values.delegateId,
      language: initialData?.language, 
      isHidden: values.isHidden,
    };

    if (onSubmitSuccess) {
      onSubmitSuccess(classToSubmit);
    }
     if (!initialData?.id) { 
      form.reset({ name: "", delegateId: "", isHidden: false });
    } else {
      form.reset({...form.getValues()});
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
              <FormLabel>{t('classNameLabel')}</FormLabel>
              <FormControl>
                <Input placeholder={t('classNamePlaceholder')} {...field} />
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
              <FormLabel>{t('classDelegateLabel')} ({t('optionalLabel')})</FormLabel>
              <Select
                onValueChange={(valueFromSelect) => {
                    field.onChange(valueFromSelect === UNASSIGNED_DELEGATE_SELECT_VALUE ? "" : valueFromSelect);
                }}
                value={field.value || UNASSIGNED_DELEGATE_SELECT_VALUE}
                disabled={isLoadingDelegates}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={isLoadingDelegates ? t('loadingDelegatesPlaceholder') : t('selectDelegatePlaceholder')} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value={UNASSIGNED_DELEGATE_SELECT_VALUE}>{t('noDelegateOption')}</SelectItem>
                  {availableDelegates.map(delegate => (
                    <SelectItem key={delegate.id} value={delegate.id}>
                      {delegate.name} ({delegate.username})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              { !isLoadingDelegates && availableDelegates.length === 0 && <p className="text-xs text-muted-foreground">{t('noDelegatesAvailableHint')}</p>}
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="isHidden"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm bg-card-foreground/5">
              <div className="space-y-0.5">
                <FormLabel className="text-base">{t('classIsHiddenLabel')}</FormLabel>
                <FormDescription>
                  {t('classIsHiddenDescription')}
                </FormDescription>
              </div>
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  aria-label={t('classIsHiddenLabel')}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex flex-col sm:flex-row gap-2">
          <Button type="submit" className="w-full sm:w-auto">
            <PlusCircle className="mr-2 h-4 w-4" />
            {isEditing ? t('updateClassButton') : t('createClassButton')}
          </Button>
          {isEditing && onCancelEdit && (
            <Button type="button" variant="outline" onClick={onCancelEdit} className="w-full sm:w-auto">
              <XCircle className="mr-2 h-4 w-4" />
              {t('cancelEditButton')}
            </Button>
          )}
        </div>
      </form>
    </Form>
  );
}

