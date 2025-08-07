"use client";

import {
  Flag,
  LayoutDashboard,
  UserPen,
  Wallet,
  type LucideIcon,
} from "lucide-react";

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import Link from "next/link";

export function NavMain() {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>General</SidebarGroupLabel>
      <SidebarMenu>
        <SidebarMenuItem>
          <Link href={"/admin/dashboard"}>
            <SidebarMenuButton className="hover: cursor-pointer">
              <LayoutDashboard />
              <span>Dashboard</span>
            </SidebarMenuButton>
          </Link>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <Link href={"/admin/accounts"}>
            <SidebarMenuButton className="hover: cursor-pointer">
              <UserPen />
              <span>Manage Accounts</span>
            </SidebarMenuButton>
          </Link>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <Link href={"/admin/wallet"}>
            <SidebarMenuButton className="hover: cursor-pointer">
              <Wallet />
              <span>Wallet</span>
            </SidebarMenuButton>
          </Link>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <Link href={"/admin/reports"}>
            <SidebarMenuButton className="hover: cursor-pointer">
              <Flag />
              <span>Reports</span>
            </SidebarMenuButton>
          </Link>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroup>
  );
}
