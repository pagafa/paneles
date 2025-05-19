
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation"; 
import {
  // LayoutDashboard, // Not used directly, ShieldCheck used for Admin Dashboard
  // Megaphone, // Not used directly
  // ClipboardList, // Not used directly
  Users,
  Book, // Changed from Library
  UserCheck,
  ShieldCheck,
  // BookOpenCheck, // Not used directly
} from "lucide-react";
import { AppLogo } from "@/components/common/AppLogo";
import { UserNav } from "@/components/common/UserNav";
// import { Button } from "@/components/ui/button"; // Not used
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  // SidebarFooter, // Removed
  SidebarTrigger,
  SidebarInset,
  useSidebar,
} from "@/components/ui/sidebar"; 
import type { UserRole } from "@/types";
import { useEffect, useState }  from 'react';
import { useLanguage } from "@/context/LanguageContext";
import type { TranslationKey } from "@/lib/i18n";


interface NavItem {
  href: string;
  labelKey: TranslationKey; // Changed from label to labelKey
  icon: React.ElementType;
  roles: UserRole[];
}

const navItems: NavItem[] = [
  { href: "/admin/dashboard", labelKey: "adminDashboardTitle", icon: ShieldCheck, roles: ["admin"] },
  { href: "/admin/manage-classes", labelKey: "manageClassesTitle", icon: Book, roles: ["admin"] }, // Changed icon here
  { href: "/admin/manage-users", labelKey: "manageUsersTitle", icon: Users, roles: ["admin"] },
  { href: "/delegate/dashboard", labelKey: "delegateDashboardTitle", icon: UserCheck, roles: ["delegate"] },
];

function SiteSidebar() {
  const pathname = usePathname();
  const [currentUserRole, setCurrentUserRole] = useState<UserRole | 'guest'>('guest');
  const { state } = useSidebar();
  const { t } = useLanguage();


  useEffect(() => {
    if (typeof window !== 'undefined') {
      const role = localStorage.getItem("userRole") as UserRole | null;
      setCurrentUserRole(role || 'guest');
    }
  }, []);
  
  const filteredNavItems = navItems.filter(item => item.roles.includes(currentUserRole));

  if (currentUserRole === 'guest') {
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
                  tooltip={{ children: t(item.labelKey), className: "text-xs" }}
                >
                  <a>
                    <item.icon />
                    <span>{t(item.labelKey)}</span>
                  </a>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
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
        <p>Loading...</p> 
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
