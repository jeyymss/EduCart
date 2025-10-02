"use client";

import * as React from "react";
import { AdminNavMain } from "@/components/admin/nav-main";
import { AdminNavUser } from "@/components/admin/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import Link from "next/link";
import Image from "next/image";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    // Removed variant="inset" to eliminate top padding / white gap
    <Sidebar {...props}>
      {/* Logo/Header */}
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem className="flex items-center justify-center py-4">
            <Link href="/admin/dashboard" className="flex items-center">
              <Image
                src="/logo.png"
                alt="EduCart Logo"
                width={170}
                height={40}
                priority
              />
            </Link>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      {/* Navigation */}
      <SidebarContent>
        <AdminNavMain />
      </SidebarContent>

      {/* User section */}
      <SidebarFooter>
        <AdminNavUser />
      </SidebarFooter>
    </Sidebar>
  );
}