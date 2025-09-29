"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
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

/** Utility for active classes */
function cx(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

export function OrgNavMain() {
  const pathname = usePathname();

  const isActive = (href: string) => pathname === href;

  // Any route under the Product group
  const productRoutes = [
    "/organization-account/transactions",
    "/organization-account/my-products",
    "/organization-account/add-new-product",
  ];
  const isProductOpen = productRoutes.some((r) => pathname.startsWith(r));

      // Reusable styles
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
          <Link href="/organization-account/dashboard" aria-current={isActive("/organization-account/dashboard") ? "page" : undefined}>
            <SidebarMenuButton
              className={cx(
                baseItem,
                isActive("/organization-account/dashboard") ? activeItem : inactiveItem
              )}
            >
              <LayoutDashboard className="h-4 w-4" />
              <span>Dashboard</span>
            </SidebarMenuButton>
          </Link>
        </SidebarMenuItem>

        {/* Product (collapsible) */}
        <SidebarMenuItem>
          <Collapsible defaultOpen={isProductOpen}>
            <CollapsibleTrigger
              className={cx(
                "flex w-full items-center justify-between text-sm font-medium rounded-md group",
                baseItem,
                isProductOpen ? activeItem : inactiveItem
              )}
            >
              <div className="flex items-center gap-2 font-normal">
                <ShoppingBag className="h-4 w-4" />
                <span>Product</span>
              </div>
              <ChevronRight className="h-4 w-4 transition-transform duration-200 group-data-[state=open]:rotate-90" />
            </CollapsibleTrigger>

            <CollapsibleContent className="mt-1">
              <Link href="/organization-account/transactions" aria-current={isActive("/organization-account/transactions") ? "page" : undefined}>
                <SidebarMenuButton
                  className={cx(
                    baseItem,
                    "ml-6",
                    isActive("/organization-account/transactions") ? activeItem : inactiveItem
                  )}
                >
                  <span>Transactions</span>
                </SidebarMenuButton>
              </Link>

              <Link href="/organization-account/my-products" aria-current={isActive("/organization-account/my-products") ? "page" : undefined}>
                <SidebarMenuButton
                  className={cx(
                    baseItem,
                    "ml-6",
                    isActive("/organization-account/my-products") ? activeItem : inactiveItem
                  )}
                >
                  <span>My Products</span>
                </SidebarMenuButton>
              </Link>

              <Link href="/organization-account/add-new-product" aria-current={isActive("/organization-account/add-new-product") ? "page" : undefined}>
                <SidebarMenuButton
                  className={cx(
                    baseItem,
                    "ml-6",
                    isActive("/organization-account/add-new-product") ? activeItem : inactiveItem
                  )}
                >
                  <span>Add Product</span>
                </SidebarMenuButton>
              </Link>
            </CollapsibleContent>
          </Collapsible>
        </SidebarMenuItem>

        {/* Wallet */}
        <SidebarMenuItem>
          <Link href="/organization-account/wallet" aria-current={isActive("/organization-account/wallet") ? "page" : undefined}>
            <SidebarMenuButton
              className={cx(
                baseItem,
                isActive("/organization-account/wallet") ? activeItem : inactiveItem
              )}
            >
              <Wallet className="h-4 w-4" />
              <span>Wallet</span>
            </SidebarMenuButton>
          </Link>
        </SidebarMenuItem>

        {/* Reviews */}
        <SidebarMenuItem>
          <Link href="/organization-account/reviews" aria-current={isActive("/organization-account/reviews") ? "page" : undefined}>
            <SidebarMenuButton
              className={cx(
                baseItem,
                isActive("/organization-account/reviews") ? activeItem : inactiveItem
              )}
            >
              <Star className="h-4 w-4" />
              <span>Reviews</span>
            </SidebarMenuButton>
          </Link>
        </SidebarMenuItem>

        {/* Settings */}
        <SidebarMenuItem>
          <Link href="/organization-account/settings" aria-current={isActive("/organization-account/settings") ? "page" : undefined}>
            <SidebarMenuButton
              className={cx(
                baseItem,
                isActive("/organization-account/settings") ? activeItem : inactiveItem
              )}
            >
              <SettingsIcon className="h-4 w-4" />
              <span>Settings</span>
            </SidebarMenuButton>
          </Link>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroup>
  );
}