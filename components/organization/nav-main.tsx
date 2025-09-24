"use client";

import {
  ChevronRight,
  Flag,
  LayoutDashboard,
  ShoppingBag,
  Wallet,
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
        {/* Normal Dashboard link */}
        <SidebarMenuItem>
          <Link href={"/organization-account/dashboard"}>
            <SidebarMenuButton className="hover:cursor-pointer">
              <LayoutDashboard />
              <span>Dashboard</span>
            </SidebarMenuButton>
          </Link>
        </SidebarMenuItem>

        {/* Collapsible Product section */}
        <SidebarMenuItem>
          <Collapsible>
            <CollapsibleTrigger className="flex w-full items-center justify-between text-sm font-medium px-2 py-2 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground rounded-md group">
              <div className="flex items-center gap-2 font-normal">
                <ShoppingBag className="h-4 w-4" />
                <span>Product</span>
              </div>
              <ChevronRight className="h-4 w-4 font-normal transition-transform duration-200 group-data-[state=open]:rotate-90" />
            </CollapsibleTrigger>

            <CollapsibleContent>
              <Link href={"/organization-account/my-products"}>
                <SidebarMenuButton className="hover:cursor-pointer ml-6">
                  <span>My Products</span>
                </SidebarMenuButton>
              </Link>

              <Link href={"/organization-account/add-new-product"}>
                <SidebarMenuButton className="hover:cursor-pointer ml-6">
                  <span>Add New Product</span>
                </SidebarMenuButton>
              </Link>
            </CollapsibleContent>
          </Collapsible>
        </SidebarMenuItem>

        {/* Other menu items */}
        <SidebarMenuItem>
          <Link href={"/organization-account/wallet"}>
            <SidebarMenuButton className="hover:cursor-pointer">
              <Wallet />
              <span>Wallet</span>
            </SidebarMenuButton>
          </Link>
        </SidebarMenuItem>

        <SidebarMenuItem>
          <Link href={"/organization-account/reports"}>
            <SidebarMenuButton className="hover:cursor-pointer">
              <Flag />
              <span>Reports</span>
            </SidebarMenuButton>
          </Link>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroup>
  );
}
