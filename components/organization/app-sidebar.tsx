"use client";

import * as React from "react";

import { OrgNavMain } from "@/components/organization/nav-main";

import { OrgNavUser } from "@/components/organization/nav-user";
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
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem className="flex item-center justify-center">
            <Link href={"/organization-account/dashboard"}>
              <Image
                src={"/logo.png"}
                alt="EduCart Logo"
                width={170}
                height={0}
              />
            </Link>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <OrgNavMain />
      </SidebarContent>
      <SidebarFooter>
        <OrgNavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
