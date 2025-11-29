"use client";

import type { ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import SidebarList from "@/components/messages/SideBarList";
import dynamic from "next/dynamic";

// Bottom nav (same used on product page)
const MobileBottomNav = dynamic(
  () => import("@/components/mobile/MobileTopNav"),
  { ssr: false }
);

type Props = {
  conversations: any[];
  children: ReactNode; // ChatClient
};

export default function MobileMessagesClient({
  conversations,
  children,
}: Props) {
  const pathname = usePathname();
  const router = useRouter();

  // Detect if user is inside a specific chat
  const isChatOpen = /^\/messages\/\d+/.test(pathname ?? "");

  // children = [messagesSection, inputSection] (for future use)
  const [messagesSection, inputSection] = Array.isArray(children)
    ? children
    : [children, null];

  return (
    <div className="md:hidden fixed inset-0 bg-white z-50">
      {/* Inbox view */}
      {!isChatOpen && (
        <div className="h-full flex flex-col">
          <div className="p-4 border-b text-xl font-semibold text-slate-700 bg-gray-100">
            Messages
          </div>

          <div className="flex-1 overflow-y-auto text-[1.05rem]">
            <SidebarList conversations={conversations} />
          </div>
        </div>
      )}

      {/* Chat view */}
      {isChatOpen && (
        <div className="h-full flex flex-col relative bg-white">
          {/* Sticky top back button */}
          <div className="sticky top-0 z-50 w-full bg-white p-2 shadow-sm">
            <button
              onClick={() => router.push("/messages")}
              className="flex items-center gap-1 bg-white border border-slate-300 text-slate-700 px-3 py-1 rounded-full"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
          </div>

          {/* Chat client fills the rest of the height */}
          <div className="flex-1 min-h-0 flex flex-col">
            {messagesSection}
          </div>

          {/* If you ever split inputSection out separately, it will appear here */}
          {inputSection && (
            <div className="sticky bottom-0 z-50 bg-white border-t shadow-lg">
              {inputSection}
            </div>
          )}
        </div>
      )}

      {/* Bottom nav ONLY on inbox (NOT inside chat) */}
      {!isChatOpen && (
        <div className="md:hidden">
          <MobileBottomNav />
        </div>
      )}
    </div>
  );
}
