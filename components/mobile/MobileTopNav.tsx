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
  TimerReset,
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

// Use the same forms as web
import { ForSaleForm } from "@/components/forms/ForSaleForm";
import { RentForm } from "@/components/forms/RentForm";
import { TradeForm } from "@/components/forms/TradeForm";

/** Exact strings your forms expect */
const TYPE_LABEL = {
  sale: "For Sale",
  rent: "For Rent",
  trade: "Trade",
} as const;

/** Web routes for the other types (adjust if yours differ) */
const WEB_CREATE_ROUTES: Record<"emergency" | "pasabuy" | "giveaway", string> = {
  emergency: "/emergency/new",
  pasabuy: "/pasabuy/new",
  giveaway: "/giveaway/new",
};

export default function MobileTopNav() {
  const pathname = usePathname();
  const router = useRouter();

  const [open, setOpen] = React.useState(false);
  const [choice, setChoice] =
    React.useState<"" | "sale" | "rent" | "trade" | "emergency" | "pasabuy" | "giveaway">("");

  // Close dialog automatically if navigation occurs (e.g., after submit)
  const prevPath = React.useRef(pathname);
  React.useEffect(() => {
    if (open && pathname !== prevPath.current) setOpen(false);
    prevPath.current = pathname;
  }, [pathname, open]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  // When the select changes, match WEB behavior:
  // - sale/rent/trade => render corresponding form below the select
  // - emergency/pasabuy/giveaway => navigate to web create pages
  const handleSelectChange = (v: string) => {
    const val = v as typeof choice;
    setChoice(val);

    if (val === "emergency" || val === "pasabuy" || val === "giveaway") {
      router.push(WEB_CREATE_ROUTES[val]);
      // close dialog & reset for next open
      setOpen(false);
      setTimeout(() => setChoice(""), 0);
    }
  };

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) setChoice("");
  };

  return (
    <div className="md:hidden sticky top-14 z-40 bg-white border-b border-black/10">
      <div className="h-[env(safe-area-inset-top)]" />

      {/* Scrollable chip nav */}
      <nav className="px-3" aria-label="Primary">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-2">
          <Chip href="/" active={isActive("/")}>
            <Home className="h-4 w-4" />
            <span>Home</span>
          </Chip>
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

          {/* + List -> open dialog */}
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="inline-flex items-center gap-1.5 shrink-0 rounded-lg px-3 py-1.5 bg-[#FCE4A6] text-[#102E4A] font-semibold text-sm ring-1 ring-black/10"
          >
            <Plus className="h-4 w-4" />
            <span>List</span>
          </button>

          <div className="w-1 shrink-0" />

          <Circle href="/credits" active={isActive("/credits")} badge="29" label="Credits">
            <TimerReset className="h-4 w-4" />
          </Circle>
          <Circle href="/messages" active={isActive("/messages")} label="Messages">
            <MessageSquareText className="h-4 w-4" />
          </Circle>
          <Circle href="/profile" active={isActive("/profile")} label="Profile">
            <UserRound className="h-4 w-4" />
          </Circle>
        </div>
      </nav>

      {/* Create Listing dialog — same pattern as web:
          select stays visible; selecting swaps/loads form automatically */}
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-lg w-[95vw] max-h-[85vh] overflow-hidden p-0">
          <div className="p-4 sm:p-5">
            <DialogHeader className="mb-2">
              <DialogTitle className="text-center">Create Listing</DialogTitle>
            </DialogHeader>
            <p className="text-center text-sm text-gray-600 mb-4">
              What type of listing do you want to create?
            </p>

            {/* Always-visible select (like web) */}
            <div className="mb-4">
              <Select value={choice} onValueChange={handleSelectChange}>
                <SelectTrigger className="w-full h-11">
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
            </div>

            {/* Only render chosen form (sale/rent/trade); scroll inside modal */}
            <div className="max-h-[60vh] overflow-auto pr-1">
              {choice === "sale" && <ForSaleForm selectedType={TYPE_LABEL.sale} />}
              {choice === "rent" && <RentForm selectedType={TYPE_LABEL.rent} />}
              {choice === "trade" && <TradeForm selectedType={TYPE_LABEL.trade} />}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ------------------ UI helpers ------------------ */

function Chip({
  href,
  active,
  children,
}: {
  href: string;
  active?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`inline-flex items-center gap-1.5 shrink-0 rounded-full px-3 py-1.5 text-sm ring-1 ring-black/10 ${
        active ? "bg-[#102E4A] text-white" : "bg-white text-[#102E4A]"
      }`}
    >
      {children}
    </Link>
  );
}

function Circle({
  href,
  active,
  label,
  badge,
  children,
}: {
  href: string;
  active?: boolean;
  label: string;
  badge?: string | number;
  children: React.ReactNode;
}) {
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
      {badge ? (
        <span className="absolute -top-1.5 -right-1.5 inline-flex items-center justify-center rounded-full bg-[#102E4A] text-white text-[10px] font-bold leading-none h-4 min-w-4 px-1">
          {badge}
        </span>
      ) : null}
      <span className="sr-only">{label}</span>
    </Link>
  );
}
