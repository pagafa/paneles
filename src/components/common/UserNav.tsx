
"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, LayoutDashboard } from "lucide-react"; 
import { useRouter, usePathname } from "next/navigation"; // Added usePathname
import { useEffect, useState } from "react";
import type { User } from "@/types";
import Link from "next/link"; 
import { useLanguage } from "@/context/LanguageContext"; 

export function UserNav() {
  const router = useRouter();
  const pathname = usePathname(); // Get current pathname
  const { t } = useLanguage(); 
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
              let errorMessage = `Failed to fetch user data. Status: ${response.status}`;
              try {
                const errorData = await response.json();
                errorMessage = errorData.message || errorMessage;
              } catch (e) { /* Ignore if response is not JSON */ }
              console.error("Failed to fetch user data:", errorMessage);
              setUser(null); 
            }
          } catch (error) {
            console.error("Error fetching user data:", error);
            setUser(null); 
          }
        } else {
          setUser(null); 
        }
      }
      setIsLoading(false);
    };

    fetchCurrentUser();
  }, [pathname]); // Re-run effect when pathname changes

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem("userRole");
      localStorage.removeItem("userId");
      // Also clear admin global language and school name if desired upon any logout
      // localStorage.removeItem('adminGlobalAppLanguage');
      // localStorage.removeItem('appSchoolName'); 
    }
    setUser(null); 
    router.push("/login");
  };

  if (isLoading) {
    return (
      <Button variant="ghost" className="relative h-10 w-10 rounded-full">
        <Avatar className="h-10 w-10">
          <AvatarFallback>...</AvatarFallback>
        </Avatar>
      </Button>
    );
  }

  if (!user) {
    return (
        <Button onClick={() => router.push('/login')} variant="outline" size="sm">
            {t('loginButtonLabel')}
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

  const dashboardHref = user.role === 'admin' ? '/admin/dashboard' : '/delegate/dashboard';

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
        <DropdownMenuItem asChild>
          <Link href={dashboardHref}>
            <LayoutDashboard className="mr-2 h-4 w-4" />
            <span>{t('dashboardMenuItemLabel')}</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>{t('logoutButtonLabel')}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
