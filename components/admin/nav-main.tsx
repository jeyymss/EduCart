"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, UserPen, Wallet, Folder, GraduationCap, FileText, ClipboardCheck } from "lucide-react";
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

function cx(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

export function AdminNavMain() {
  const pathname = usePathname();
  const isActive = (href: string) => pathname === href;

  const baseItem =
    "hover:cursor-pointer rounded-md px-2 py-2 transition-colors";
  const activeItem =
    "bg-[#C7D9E5] text-black ring-1 ring-[#C7D9E5]";
  const inactiveItem =
    "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground";

  return (
    <SidebarGroup>
      <SidebarMenu>
        {/* Dashboard */}
        <SidebarMenuItem>
          <Link
            href="/admin/dashboard"
            aria-current={isActive("/admin/dashboard") ? "page" : undefined}
          >
            <SidebarMenuButton
              className={cx(
                baseItem,
                isActive("/admin/dashboard") ? activeItem : inactiveItem
              )}
            >
              <LayoutDashboard className="h-4 w-4" />
              <span>Dashboard</span>
            </SidebarMenuButton>
          </Link>
        </SidebarMenuItem>

        {/* Users */}
        <SidebarMenuItem>
          <Link
            href="/admin/accounts"
            aria-current={isActive("/admin/accounts") ? "page" : undefined}
          >
            <SidebarMenuButton
              className={cx(
                baseItem,
                isActive("/admin/accounts") ? activeItem : inactiveItem
              )}
            >
              <UserPen className="h-4 w-4" />
              <span>Users</span>
            </SidebarMenuButton>
          </Link>
        </SidebarMenuItem>

        {/* Categories */}
        <SidebarMenuItem>
          <Link
            href="/admin/categories"
            aria-current={isActive("/admin/categories") ? "page" : undefined}
          >
            <SidebarMenuButton
              className={cx(
                baseItem,
                isActive("/admin/categories") ? activeItem : inactiveItem
              )}
            >
              <Folder className="h-4 w-4" />
              <span>Categories</span>
            </SidebarMenuButton>
          </Link>
        </SidebarMenuItem>

        {/* Schools */}
        <SidebarMenuItem>
          <Link
            href="/admin/schools"
            aria-current={isActive("/admin/schools") ? "page" : undefined}
          >
            <SidebarMenuButton
              className={cx(
                baseItem,
                isActive("/admin/schools") ? activeItem : inactiveItem
              )}
              title="School Management"
            >
              <GraduationCap className="h-4 w-4" />
              <span>Schools</span>
            </SidebarMenuButton>
          </Link>
        </SidebarMenuItem>

        {/* Wallet */}
        <SidebarMenuItem>
          <Link
            href="/admin/wallet"
            aria-current={isActive("/admin/wallet") ? "page" : undefined}
          >
            <SidebarMenuButton
              className={cx(
                baseItem,
                isActive("/admin/wallet") ? activeItem : inactiveItem
              )}
            >
              <Wallet className="h-4 w-4" />
              <span>Wallet</span>
            </SidebarMenuButton>
          </Link>
        </SidebarMenuItem>

        {/* Reports */}
        <SidebarMenuItem>
          <Link
            href="/admin/reports"
            aria-current={isActive("/admin/reports") ? "page" : undefined}
          >
            <SidebarMenuButton
              className={cx(
                baseItem,
                isActive("/admin/reports") ? activeItem : inactiveItem
              )}
            >
              <FileText className="h-4 w-4" />
              <span>Reports</span>
            </SidebarMenuButton>
          </Link>
        </SidebarMenuItem>

        {/* Requests */}
        <SidebarMenuItem>
          <Link
            href="/admin/requests"
            aria-current={isActive("/admin/requests") ? "page" : undefined}
          >
            <SidebarMenuButton
              className={cx(
                baseItem,
                isActive("/admin/requests") ? activeItem : inactiveItem
              )}
              title="Review and manage school and courier applications"
            >
              <ClipboardCheck className="h-4 w-4" />
              <span>Requests</span>
            </SidebarMenuButton>
          </Link>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroup>
  );
}