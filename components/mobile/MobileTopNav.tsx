"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import * as React from "react";
import {
  Home,
  Grid2X2,
  Building2,
  Landmark,
  Plus,
  MessageSquareText,
  UserRound,
  Bell,
  LogOut,
  TimerReset,
} from "lucide-react";

import {
  ListDialog,
  ListDialogHeader,
  ListDialogTitle,
  ListDialogDescription,
  ListDialogContent,
} from "@/components/ui/ListDialog";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { createClient } from "@/utils/supabase/client";

import { ForSaleForm } from "@/components/forms/ForSaleForm";
import { RentForm } from "@/components/forms/RentForm";
import { TradeForm } from "@/components/forms/TradeForm";

const TYPE_LABEL = {
  sale: "For Sale",
  rent: "For Rent",
  trade: "Trade",
} as const;

const WEB_CREATE_ROUTES: Record<"emergency" | "pasabuy" | "giveaway", string> = {
  emergency: "/emergency/new",
  pasabuy: "/pasabuy/new",
  giveaway: "/giveaway/new",
};

export default function MobileTopNav({
  showOnlyBottom = false,
}: {
  showOnlyBottom?: boolean;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const [open, setOpen] = React.useState(false);
  const [choice, setChoice] =
    React.useState<
      "" | "sale" | "rent" | "trade" | "emergency" | "pasabuy" | "giveaway"
    >("");

  const prevPath = React.useRef(pathname);
  React.useEffect(() => {
    if (open && pathname !== prevPath.current) setOpen(false);
    prevPath.current = pathname;
  }, [pathname, open]);

  /* HOME ACTIVE */
  const isActive = (href: string) => {
    if (href === "/") {
      return (
        pathname === "/" ||
        pathname === "" ||
        pathname === "/home" ||
        pathname.startsWith("/?") ||
        pathname === "/index"
      );
    }
    return pathname.startsWith(href);
  };

  const handleSelectChange = (v: string) => {
    const val = v as typeof choice;
    setChoice(val);

    if (val === "emergency" || val === "pasabuy" || val === "giveaway") {
      router.push(WEB_CREATE_ROUTES[val]);
      setOpen(false);
      setTimeout(() => setChoice(""), 0);
    }
  };

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) setChoice("");
  };

  /* Search relocation logic */
  React.useEffect(() => {
    const slot = document.getElementById("mobile-search-slot");
    const search = document.getElementById("home-top-search");
    const origin = document.getElementById("home-top-search-origin");
    if (!slot || !search || !origin) return;

    const mq = window.matchMedia("(max-width: 767.98px)");
    const moveIfNeeded = () => {
      if (mq.matches) {
        if (search.parentElement !== slot) slot.appendChild(search);
      } else {
        if (search.parentElement !== origin) origin.appendChild(search);
      }
    };

    moveIfNeeded();
    mq.addEventListener?.("change", moveIfNeeded);
    return () => {
      try {
        if (origin && search && search.parentElement !== origin)
          origin.appendChild(search);
        mq.removeEventListener?.("change", moveIfNeeded);
      } catch {}
    };
  }, []);

  const isProductPage = pathname.includes("/product/");
  const isMessagesPage = pathname.startsWith("/messages");

  const hideTopChips =
    isProductPage || isMessagesPage || pathname.startsWith("/profile");

  return (
    <>
      {/* TOP NAV — Hidden when showOnlyBottom = true */}
      {!showOnlyBottom && !hideTopChips && (
        <div className="md:hidden sticky top-[56px] z-[40] bg-white shadow-sm">
          <nav className="px-3" aria-label="Secondary">
            {!isProductPage && (
              <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-2">
                <Chip href="/browse" active={isActive("/browse")}>
                  <Grid2X2 className="h-4 w-4" />
                  <span>Browse</span>
                </Chip>

                <Chip href="/businesses" active={isActive("/businesses")}>
                  <Building2 className="h-4 w-4" />
                  <span>Businesses</span>
                </Chip>

                <Chip href="/organizations" active={isActive("/organizations")}>
                  <Landmark className="h-4 w-4" />
                  <span>Organizations</span>
                </Chip>

                <Circle
                  href="/credits"
                  label="Credits"
                  active={isActive("/credits")}
                  badge="29"
                >
                  <TimerReset className="h-4 w-4" />
                </Circle>
              </div>
            )}

            <div id="mobile-search-slot" className="mt-1" />
          </nav>
        </div>
      )}

      {/* Bottom Bar */}
      <BottomBar
        homeActive={isActive("/")}
        notifActive={isActive("/notifications")}
        messagesActive={isActive("/messages")}
        profileActive={isActive("/profile")}
        onOpenList={() => setOpen(true)}
      />

      {!showOnlyBottom && <div className="md:hidden h-20" />}

      {/* Create Listing Dialog - Custom */}
      <ListDialog open={open} onOpenChange={handleOpenChange}>
        <ListDialogHeader>
          <ListDialogTitle>Create Listing</ListDialogTitle>
          <ListDialogDescription>
            What type of listing do you want to create?
          </ListDialogDescription>
        </ListDialogHeader>

        <ListDialogContent>
          <Select value={choice} onValueChange={handleSelectChange}>
            <SelectTrigger className="w-full h-12">
              <SelectValue placeholder="Select Listing Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="sale">For Sale</SelectItem>
              <SelectItem value="rent">For Rent</SelectItem>
              <SelectItem value="trade">Trade</SelectItem>
              <SelectItem value="emergency">Emergency Lending</SelectItem>
              <SelectItem value="pasabuy">PasaBuy</SelectItem>
              <SelectItem value="giveaway">Giveaway</SelectItem>
            </SelectContent>
          </Select>

          <div className="mt-6">
            {choice === "sale" && (
              <ForSaleForm selectedType={TYPE_LABEL.sale} />
            )}
            {choice === "rent" && (
              <RentForm selectedType={TYPE_LABEL.rent} />
            )}
            {choice === "trade" && (
              <TradeForm selectedType={TYPE_LABEL.trade} />
            )}
          </div>
        </ListDialogContent>
      </ListDialog>
    </>
  );
}

/* UI COMPONENTS */

function Chip({ href, active, children }: any) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`inline-flex h-8 items-center gap-1.5 shrink-0 rounded-full px-3 text-sm ring-1 ring-black/10 ${
        active ? "bg-[#102E4A] text-white" : "bg-white text-[#102E4A]"
      }`}
    >
      {children}
    </Link>
  );
}

function Circle({ href, active, label, badge, children }: any) {
  return (
    <Link
      href={href}
      aria-label={label}
      aria-current={active ? "page" : undefined}
      className={`relative inline-flex items-center justify-center h-9 w-9 shrink-0 rounded-full ring-1 ring-black/10 ${
        active ? "bg-[#102E4A]/10 text-[#102E4A]" : "bg-white text-[#102E4A]"
      }`}
    >
      {children}

      {badge && (
        <span className="absolute -top-1.5 -right-1.5 inline-flex items-center justify-center rounded-full bg-[#102E4A] text-white text-[10px] font-bold leading-none h-4 min-w-4 px-1">
          {badge}
        </span>
      )}

      <span className="sr-only">{label}</span>
    </Link>
  );
}

function BottomBar({
  homeActive,
  notifActive,
  messagesActive,
  profileActive,
  onOpenList,
}: any) {
  return (
    <div className="md:hidden fixed inset-x-0 bottom-0 z-30 bg-white border-t border-black/10 h-16 pb-[env(safe-area-inset-bottom)]">
      <div className="relative mx-auto max-w-screen-sm px-6 h-full flex items-center justify-between">
        <NavIcon href="/" label="Home" active={homeActive}>
          <Home className="h-5 w-5" />
        </NavIcon>

        <NavIcon href="/notifications" label="Notifications" active={notifActive}>
          <Bell className="h-5 w-5" />
        </NavIcon>

        <button
          aria-label="Create listing"
          onClick={onOpenList}
          className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 inline-flex items-center justify-center h-12 w-12 rounded-full bg-[#F3D58D] text-[#102E4A] shadow-md ring-1 ring-black/10"
        >
          <Plus className="h-6 w-6" />
        </button>

        <NavIcon href="/messages" label="Messages" active={messagesActive}>
          <MessageSquareText className="h-5 w-5" />
        </NavIcon>

        <ProfileBottomItem active={profileActive} />
      </div>
    </div>
  );
}

function NavIcon({ href, label, active, children }: any) {
  return (
    <Link
      href={href}
      aria-label={label}
      aria-current={active ? "page" : undefined}
      className={`inline-flex flex-col items-center justify-center gap-1 px-2 py-1.5 text-xs ${
        active ? "text-[#E59E2C]" : "text-gray-600"
      }`}
    >
      {children}
      <span className="text-[11px]">{label}</span>
    </Link>
  );
}

function ProfileBottomItem({ active }: any) {
  const router = useRouter();
  const supabase = React.useMemo(() => createClient(), []);

  const handleProfile = () => router.push("/profile");

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch {}
    finally {
      router.push("/");
      router.refresh();
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          aria-label="Profile menu"
          className={`inline-flex flex-col items-center justify-center gap-1 px-2 py-1.5 text-xs ${
            active ? "text-[#E59E2C]" : "text-gray-600"
          }`}
        >
          <UserRound className="h-5 w-5" />
          <span className="text-[11px]">Profile</span>
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" sideOffset={6} className="w-44">
        <DropdownMenuItem onClick={handleProfile}>
          <UserRound className="mr-2 h-4 w-4" />
          Profile
        </DropdownMenuItem>

        <DropdownMenuItem onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
