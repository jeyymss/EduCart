"use client";

import { Flag, LayoutDashboard, UserPen, Wallet } from "lucide-react";

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import Link from "next/link";

export function OrgNavMain() {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>General</SidebarGroupLabel>
      <SidebarMenu>
        <SidebarMenuItem>
          <Link href={"/organization/dashboard"}>
            <SidebarMenuButton className="hover: cursor-pointer">
              <LayoutDashboard />
              <span>Dashboard</span>
            </SidebarMenuButton>
          </Link>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <Link href={"/organization/accounts"}>
            <SidebarMenuButton className="hover: cursor-pointer">
              <UserPen />
              <span>Manage Accounts</span>
            </SidebarMenuButton>
          </Link>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <Link href={"/organization/wallet"}>
            <SidebarMenuButton className="hover: cursor-pointer">
              <Wallet />
              <span>Wallet</span>
            </SidebarMenuButton>
          </Link>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <Link href={"/organization/reports"}>
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
