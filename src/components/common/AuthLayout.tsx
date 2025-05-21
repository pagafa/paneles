
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation"; 
import {
  Book, // Changed from Library
  UserCheck,
  ShieldCheck,
  Users,
} from "lucide-react";
// AppLogo and UserNav are now in GlobalHeader
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
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
  labelKey: TranslationKey;
  icon: React.ElementType;
  roles: UserRole[];
}

const navItems: NavItem[] = [
  { href: "/admin/dashboard", labelKey: "adminDashboardTitle", icon: ShieldCheck, roles: ["admin"] },
  { href: "/admin/manage-classes", labelKey: "manageClassesTitle", icon: Book, roles: ["admin"] }, // Changed icon
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
    <Sidebar collapsible="icon" className="border-r pt-16"> {/* Added pt-16 here */}
      <SidebarHeader className="flex items-center justify-between p-2">
        <div className={`duration-200 ${state === 'collapsed' ? 'opacity-0 -ml-8' : 'opacity-100'}`}>
          {/* AppLogo is in GlobalHeader */}
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
      const userId = localStorage.getItem("userId");
      if (!role || !userId) {
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
      {/* The GlobalHeader is rendered by RootLayout and sits above this entire structure */}
      <div className="flex min-h-screen w-full"> {/* This div is inside RootLayout's <main> */}
        <SiteSidebar />
        <SidebarInset>
          {/* This header is specific to the authenticated layout for the mobile sidebar trigger */}
          {/* It sits *below* the GlobalHeader */}
          <header className="sticky top-16 z-10 flex h-16 items-center justify-between border-b bg-background/80 px-4 backdrop-blur-sm md:justify-end"> {/* Changed top-0 to top-16 */}
            <div className="md:hidden">
              <SidebarTrigger/>
            </div>
            {/* UserNav was here, now it's global */}
          </header>
          <main className="flex-1 p-4 md:p-6 lg:p-8"> {/* Added padding here */}
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
