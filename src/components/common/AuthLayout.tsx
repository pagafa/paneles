"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation"; // Corrected import
import {
  LayoutDashboard,
  Megaphone,
  ClipboardList,
  Users,
  School as SchoolIcon,
  UserCheck,
  ShieldCheck,
  BookOpenCheck,
  Settings,
} from "lucide-react";
import { AppLogo } from "@/components/common/AppLogo";
import { UserNav } from "@/components/common/UserNav";
import { Button } from "@/components/ui/button";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarTrigger,
  SidebarInset,
  useSidebar,
} from "@/components/ui/sidebar"; // Assuming this path is correct based on project structure
import type { UserRole } from "@/types";
import { useEffect, useState }  from 'react';


interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  roles: UserRole[];
}

const navItems: NavItem[] = [
  { href: "/admin/dashboard", label: "Admin Dashboard", icon: ShieldCheck, roles: ["admin"] },
  { href: "/admin/manage-classes", label: "Manage Classes", icon: SchoolIcon, roles: ["admin"] },
  { href: "/admin/manage-users", label: "Manage Users", icon: Users, roles: ["admin"] },
  { href: "/delegate/dashboard", label: "Delegate Dashboard", icon: UserCheck, roles: ["delegate"] },
];

function SiteSidebar() {
  const pathname = usePathname();
  const [currentUserRole, setCurrentUserRole] = useState<UserRole | 'guest'>('guest');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const role = localStorage.getItem("userRole") as UserRole | null;
      setCurrentUserRole(role || 'guest');
    }
  }, []);
  
  const { state } = useSidebar();


  const filteredNavItems = navItems.filter(item => item.roles.includes(currentUserRole));

  if (currentUserRole === 'guest') {
    // Or handle redirect, this is just for UI consistency if somehow landed here
    return null; 
  }
  
  return (
    <Sidebar collapsible="icon" className="border-r">
      <SidebarHeader className="flex items-center justify-between p-2">
        <div className={`duration-200 ${state === 'collapsed' ? 'opacity-0 -ml-8' : 'opacity-100'}`}>
          <AppLogo />
        </div>
        <SidebarTrigger className="md:hidden" />
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {filteredNavItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <Link href={item.href} legacyBehavior passHref>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === item.href || (pathname.startsWith(item.href) && item.href !== "/admin/dashboard" && item.href !== "/delegate/dashboard")}
                  tooltip={{ children: item.label, className: "text-xs" }}
                >
                  <a>
                    <item.icon />
                    <span>{item.label}</span>
                  </a>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="p-2">
        <Link href="/settings" legacyBehavior passHref>
          <SidebarMenuButton asChild tooltip={{children: "Settings", className:"text-xs"}}>
            <a><Settings /><span>Settings</span></a>
          </SidebarMenuButton>
        </Link>
      </SidebarFooter>
    </Sidebar>
  );
}


export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isAuthCheckComplete, setIsAuthCheckComplete] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const role = localStorage.getItem("userRole");
      if (!role) {
        router.replace("/login");
      } else {
        setIsAuthCheckComplete(true);
      }
    }
  }, [router]);

  if (!isAuthCheckComplete) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>Loading...</p> {/* Or a spinner component */}
      </div>
    );
  }
  
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <SiteSidebar />
        <SidebarInset>
          <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-background/80 px-4 backdrop-blur-sm md:justify-end">
            <div className="md:hidden">
              <SidebarTrigger/>
            </div>
            <UserNav />
          </header>
          <main className="flex-1 p-4 md:p-6 lg:p-8">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
