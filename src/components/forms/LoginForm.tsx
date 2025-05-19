
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LogIn } from "lucide-react";
import { useState, useEffect } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import type { User } from "@/types";

const loginFormSchema = z.object({
  username: z.string().min(3, { message: "Username must be at least 3 characters." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
});

type LoginFormValues = z.infer<typeof loginFormSchema>;

export function LoginForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { t } = useLanguage();
  const [usersFromApi, setUsersFromApi] = useState<User[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoadingUsers(true);
      try {
        const response = await fetch('/api/users');
        if (!response.ok) {
          throw new Error('Failed to fetch users for login');
        }
        const data: User[] = await response.json();
        setUsersFromApi(data);
      } catch (err) {
        console.error(err);
        // setError('Could not load user data. Please try again later.'); // Optional: inform user
        setUsersFromApi([]);
      } finally {
        setIsLoadingUsers(false);
      }
    };
    fetchUsers();
  }, []);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  async function onSubmit(values: LoginFormValues) {
    setIsLoading(true);
    setError(null);
    
    if (isLoadingUsers) {
      setError("User data is still loading. Please wait a moment and try again.");
      setIsLoading(false);
      return;
    }

    const user = usersFromApi.find(u => u.username === values.username);

    if (user && values.password === "password") { // Still using "password" for demo
      localStorage.setItem("userRole", user.role);
      localStorage.setItem("userId", user.id);
      if (user.role === "admin") {
        router.push("/admin/dashboard");
      } else if (user.role === "delegate") {
        router.push("/delegate/dashboard");
      } else {
        setError("Unknown user role."); // Should not happen with current roles
      }
    } else {
      setError("Invalid username or password.");
    }
    setIsLoading(false);
  }

  return (
    <Card className="w-full max-w-md shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center text-primary">{t('loginTitle')}</CardTitle>
        <CardDescription className="text-center">
          {t('loginDescription')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertTitle>Login Failed</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input type="text" placeholder={t('usernamePlaceholder')} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isLoading || isLoadingUsers}>
              {isLoading || isLoadingUsers ? "Logging in..." : <> <LogIn className="mr-2 h-4 w-4" /> {t('loginButtonLabel')} </>}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
