"use client";

import {
  ChevronRight,
  LayoutDashboard,
  ShoppingBag,
  Wallet,
  Star,
  Settings as SettingsIcon,
} from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../ui/collapsible";
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import Link from "next/link";

export function OrgNavMain() {
  return (
    <SidebarGroup>
      <SidebarMenu>
        {/* Dashboard */}
        <SidebarMenuItem>
          <Link href="/organization-account/dashboard">
            <SidebarMenuButton className="hover:cursor-pointer">
              <LayoutDashboard className="h-4 w-4" />
              <span>Dashboard</span>
            </SidebarMenuButton>
          </Link>
        </SidebarMenuItem>

        {/* Product (collapsible) */}
        <SidebarMenuItem>
          <Collapsible>
            <CollapsibleTrigger className="flex w-full items-center justify-between text-sm font-medium px-2 py-2 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground rounded-md group">
              <div className="flex items-center gap-2 font-normal">
                <ShoppingBag className="h-4 w-4" />
                <span>Product</span>
              </div>
              <ChevronRight className="h-4 w-4 transition-transform duration-200 group-data-[state=open]:rotate-90" />
            </CollapsibleTrigger>

            <CollapsibleContent className="mt-1">
              <Link href="/organization-account/transactions">
                <SidebarMenuButton className="hover:cursor-pointer ml-6">
                  <span>Transactions</span>
                </SidebarMenuButton>
              </Link>

              <Link href="/organization-account/my-products">
                <SidebarMenuButton className="hover:cursor-pointer ml-6">
                  <span>My Products</span>
                </SidebarMenuButton>
              </Link>

              <Link href="/organization-account/add-new-product">
                <SidebarMenuButton className="hover:cursor-pointer ml-6">
                  <span>Add Product</span>
                </SidebarMenuButton>
              </Link>
            </CollapsibleContent>
          </Collapsible>
        </SidebarMenuItem>

        {/* Wallet */}
        <SidebarMenuItem>
          <Link href="/organization-account/wallet">
            <SidebarMenuButton className="hover:cursor-pointer">
              <Wallet className="h-4 w-4" />
              <span>Wallet</span>
            </SidebarMenuButton>
          </Link>
        </SidebarMenuItem>

        {/* Reviews */}
        <SidebarMenuItem>
          <Link href="/organization-account/reviews">
            <SidebarMenuButton className="hover:cursor-pointer">
              <Star className="h-4 w-4" />
              <span>Reviews</span>
            </SidebarMenuButton>
          </Link>
        </SidebarMenuItem>

        {/* Settings */}
        <SidebarMenuItem>
          <Link href="/organization-account/settings">
            <SidebarMenuButton className="hover:cursor-pointer">
              <SettingsIcon className="h-4 w-4" />
              <span>Settings</span>
            </SidebarMenuButton>
          </Link>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroup>
  );
}