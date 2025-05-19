
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
import { LogOut } from "lucide-react"; // Removed UserIcon as it's no longer used for Profile
import { useRouter } from "next/navigation"; 
import { useEffect, useState } from "react";
import type { User, UserRole } from "@/types";
import { mockUsers } from "@/lib/placeholder-data"; // Import mockUsers for getCurrentUser

// Mock function to get current user. In a real app, this would come from an auth context.
const getCurrentUser = (): User | null => {
  if (typeof window !== 'undefined') {
    const role = localStorage.getItem("userRole") as UserRole | null;
    // Find user from mockUsers based on role or stored ID (if available)
    // This is a simplified mock, a real app would have better user retrieval
    if (role === 'admin') return mockUsers.find(u => u.role === 'admin') || null;
    if (role === 'delegate') {
      const userId = localStorage.getItem("userId");
      if (userId) return mockUsers.find(u => u.id === userId && u.role === 'delegate') || null;
      // Fallback to first delegate if no specific ID
      return mockUsers.find(u => u.role === 'delegate') || null;
    }
  }
  return null;
};


export function UserNav() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    setUser(getCurrentUser());
  }, []);

  const handleLogout = () => {
    // Simulate logout
    localStorage.removeItem("userRole"); 
    localStorage.removeItem("userId");
    router.push("/login");
  };

  if (!user) {
    return null; // Or a login button if preferred
  }

  const getInitials = (name: string) => {
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
        {/* Removed Profile DropdownMenuItem */}
        {/* 
        <DropdownMenuGroup>
          <DropdownMenuItem disabled>
            <UserIcon className="mr-2 h-4 w-4" />
            <span>Profile</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator /> 
        */}
        <DropdownMenuItem onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
