"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import type { NavItem } from "@/lib/types";
import { LayoutGrid, Briefcase, Users, Building2 } from "lucide-react";

const navItems: NavItem[] = [
  {
    title: "Prospects",
    href: "/",
    icon: LayoutGrid,
  },
  {
    title: "Positions",
    href: "/positions",
    icon: Briefcase,
  },
  {
    title: "Candidates",
    href: "/candidates",
    icon: Users,
  },
  {
    title: "Clients",
    href: "/clients",
    icon: Building2,
  },
];

export function MainNav() {
  const pathname = usePathname();

  return (
    <SidebarMenu>
      {navItems.map((item) => (
        <SidebarMenuItem key={item.href}>
          <Link href={item.href}>
            {/* @next-codemod-error This Link previously used the now removed `legacyBehavior` prop, and has a child that might not be an anchor. The codemod bailed out of lifting the child props to the Link. Check that the child component does not render an anchor, and potentially move the props manually to Link. */
            }
            <SidebarMenuButton
              isActive={pathname === item.href}
              tooltip={item.title}
            >
              <item.icon />
              <span>{item.title}</span>
            </SidebarMenuButton>
          </Link>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}
