import { AppSidebar } from "@/components/organization/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

export default function OrganizationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="!p-0">
        {/* Breadcrumbs row — raised slightly */}
        <div className="flex items-center gap-2 px-6 py-1 -mt-9">
          <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="mr-2 data-[orientation=vertical]:h-4"
          />
        </div>

        {/* Content — small top gap under breadcrumbs */}
        <div className="space-y-6 px-6 pt-2 pb-6">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
