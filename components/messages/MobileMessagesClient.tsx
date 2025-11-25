"use client";

import type { ReactNode } from "react";
import { useEffect, useRef } from "react";
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

export default function MobileMessagesClient({ conversations, children }: Props) {
  const pathname = usePathname();
  const router = useRouter();

  // Detect if user is inside a specific chat
  const isChatOpen = /^\/messages\/\d+/.test(pathname ?? "");

  // children = [messagesSection, inputSection]
  const [messagesSection, inputSection] = Array.isArray(children)
    ? children
    : [children, null];

  const messagesRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom when chat opens or message content changes
  useEffect(() => {
    if (isChatOpen && messagesRef.current) {
      const el = messagesRef.current;
      el.scrollTop = el.scrollHeight;
    }
  }, [isChatOpen, messagesSection]);

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

          {/* Messages section */}
          <div className="flex-1 overflow-y-auto" ref={messagesRef}>
            {messagesSection}
          </div>

          {/* Input area */}
          <div className="sticky bottom-0 z-50 bg-white border-t shadow-lg">
            {inputSection}
          </div>
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
