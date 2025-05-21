
"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { User } from "@/types";
// mockUsers is no longer needed here as we fetch from API

export function UserNav() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      setIsLoading(true);
      if (typeof window !== 'undefined') {
        const userId = localStorage.getItem("userId");
        if (userId) {
          try {
            const response = await fetch(`/api/users/${userId}`);
            if (response.ok) {
              const userData: User = await response.json();
              setUser(userData);
            } else {
              console.error("Failed to fetch user data:", response.status);
              // Potentially logout if user data can't be fetched (e.g., token expired in real auth)
              // For this app, we'll just set user to null
              setUser(null);
              // Optional: Clear localStorage if user is not found or unauthorized
              // localStorage.removeItem("userRole");
              // localStorage.removeItem("userId");
              // router.push("/login");
            }
          } catch (error) {
            console.error("Error fetching user data:", error);
            setUser(null);
          }
        } else {
          setUser(null); // No userId in localStorage
        }
      }
      setIsLoading(false);
    };

    fetchCurrentUser();
  }, [router]); // Added router to dependency array if it's used for redirection on error

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem("userRole");
      localStorage.removeItem("userId");
    }
    router.push("/login");
  };

  if (isLoading) {
    // Optional: Render a skeleton or loading indicator
    return (
      <Button variant="ghost" className="relative h-10 w-10 rounded-full">
        <Avatar className="h-10 w-10">
          <AvatarFallback>...</AvatarFallback>
        </Avatar>
      </Button>
    );
  }

  if (!user) {
    // This case should ideally not happen if AuthLayout correctly redirects unauthenticated users.
    // However, if it does, we can offer a login button or null.
    return (
        <Button onClick={() => router.push('/login')} variant="outline" size="sm">
            Login
        </Button>
    );
  }

  const getInitials = (name: string) => {
    if (!name) return "";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-10 w-10">
            <AvatarImage src={`https://placehold.co/100x100.png?text=${getInitials(user.name)}`} alt={user.name} data-ai-hint="user avatar"/>
            <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.name}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.username}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
