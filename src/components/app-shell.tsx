"use client";

import * as React from "react";
import { useEffect } from "react";
import Link from "next/link";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar";
import {
  Settings,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { MainNav } from "@/components/main-nav";
import { Logo } from "@/components/logo";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAppStore } from '@/lib/store'; // Import useAppStore

export function AppShell({ children }: { children: React.ReactNode }) {
  const { clientsInitialized, loadClients, positionsInitialized, loadPositions, candidatesInitialized, loadCandidates } = useAppStore();

  useEffect(() => {
    if (!clientsInitialized) {
      loadClients();
    }

    const prefetchOtherData = () => {
      if (!positionsInitialized) {
        loadPositions();
      }
      if (!candidatesInitialized) {
        loadCandidates();
      }
    };

    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      (window as any).requestIdleCallback(prefetchOtherData, { timeout: 2000 });
    } else {
      setTimeout(prefetchOtherData, 500);
    }
  }, [clientsInitialized, loadClients, positionsInitialized, loadPositions, candidatesInitialized, loadCandidates]);

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2 p-2">
            <Logo />
            <span className="font-headline text-lg font-semibold text-sidebar-foreground">
              TalentFlow
            </span>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <MainNav />
        </SidebarContent>
        <SidebarFooter>
          <div className="flex items-center gap-3 p-2 transition-all duration-200 group-data-[collapsible=icon]:-ml-1">
             <Avatar className="h-9 w-9">
              <AvatarImage src="https://picsum.photos/seed/user/100/100" alt="Admin" />
              <AvatarFallback>A</AvatarFallback>
            </Avatar>
            <div className="flex flex-col overflow-hidden transition-all duration-200 group-data-[collapsible=icon]:opacity-0">
               <span className="text-sm font-medium text-sidebar-foreground truncate">Admin User</span>
               <span className="text-xs text-sidebar-foreground/70 truncate">admin@talentflow.com</span>
            </div>
          </div>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="flex h-14 items-center justify-between gap-4 border-b bg-background/80 backdrop-blur-sm px-6">
          <SidebarTrigger className="md:hidden" />
          <div className="flex-1">
            {/* Can add search bar or other header elements here */}
          </div>
          <UserNav />
        </header>
        <main className="flex-1 p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}

function UserNav() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-10 w-10">
            <AvatarImage src="https://picsum.photos/seed/user/100/100" alt="Admin" />
            <AvatarFallback>A</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">Admin User</p>
            <p className="text-xs leading-none text-muted-foreground">
              admin@talentflow.com
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <User className="mr-2 h-4 w-4" />
          <span>Profile</span>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Settings className="mr-2 h-4 w-4" />
          <span>Settings</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
