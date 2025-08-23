"use client";

import { ChevronsUpDown, LogOut } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { createClient } from "@/utils/supabase/client";
import { useState, useMemo } from "react";
import { useCurrentOrganization } from "@/hooks/queries/useCurrentOrg";

function initialsFrom(name?: string | null) {
  if (!name) return "ED";
  return name
    .split(" ")
    .filter(Boolean)
    .map((w) => w[0]!.toUpperCase())
    .slice(0, 2)
    .join("");
}

function MiniSkeleton() {
  return (
    <div className="grid flex-1 text-left text-sm leading-tight">
      <div className="h-3 w-24 rounded bg-muted animate-pulse mb-1" />
      <div className="h-2.5 w-40 rounded bg-muted animate-pulse" />
    </div>
  );
}

export function OrgNavUser() {
  const supabase = createClient();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const { isMobile } = useSidebar();
  const { data: org, isLoading } = useCurrentOrganization();

  const name = org?.organization_name ?? null;
  const email = org?.email ?? null;
  const avatar = org?.avatar_url ?? null;
  const fallback = useMemo(() => initialsFrom(name), [name]);

  const handleLogout = async () => {
    setShowLogoutModal(true);
    setTimeout(async () => {
      await supabase.auth.signOut();
      window.location.href = "/";
    }, 2000);
  };

  return (
    <>
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              >
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage
                    src={avatar ?? undefined}
                    alt={name ?? "Organization"}
                  />
                  <AvatarFallback className="rounded-lg">
                    {fallback}
                  </AvatarFallback>
                </Avatar>

                {isLoading ? (
                  <MiniSkeleton />
                ) : (
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">{name ?? "—"}</span>
                    <span className="truncate text-xs">{email ?? "—"}</span>
                  </div>
                )}

                <ChevronsUpDown className="ml-auto size-4" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
              side={isMobile ? "bottom" : "right"}
              align="end"
              sideOffset={4}
            >
              <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarImage
                      src={avatar ?? undefined}
                      alt={name ?? "Organization"}
                    />
                    <AvatarFallback className="rounded-lg">
                      {fallback}
                    </AvatarFallback>
                  </Avatar>
                  {isLoading ? (
                    <MiniSkeleton />
                  ) : (
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-medium">
                        {name ?? "—"}
                      </span>
                      <span className="truncate text-xs">{email ?? "—"}</span>
                    </div>
                  )}
                </div>
              </DropdownMenuLabel>

              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>

      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full text-center space-y-4">
            <h2 className="text-xl font-semibold">Logging out...</h2>
            <p className="text-sm text-muted-foreground">
              Please wait a moment.
            </p>
          </div>
        </div>
      )}
    </>
  );
}
