"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "./ui/dialog";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "./ui/select";
import { ForSaleForm } from "./forms/ForSaleForm";
import { RentForm } from "./forms/RentForm";
import { TradeForm } from "./forms/TradeForm";
import { EmergencyForm } from "./forms/EmergencyForm";
import { PasaBuyForm } from "./forms/PasaBuyForm";
import { GiveawayForm } from "./forms/GiveawayForm";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "./ui/navigation-menu";
import { useUserProfile } from "@/hooks/useUserProfile";
import {
  ArrowRight,
  BadgeCent,
  MessageSquare,
  Plus,
  User,
  Wallet,
  X,
} from "lucide-react";

export function Header() {
  const { data: user } = useUserProfile();
  const pathname = usePathname();
  const isConfirmPage = pathname?.startsWith("/confirm") ?? false;

  const isLoginPage = pathname === "/login";
  const isSignupPage =
    pathname === "/signup" || pathname === "/organization-account";
  const isLandingPage = pathname === "/";

  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [selectedType, setSelectedType] = useState("");

  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    if (isConfirmPage) return;
    (async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setIsLoggedIn(!!session);
    })();
  }, [supabase, isConfirmPage]);

  const handleLogout = async () => {
    setShowLogoutModal(true);
    setTimeout(async () => {
      await supabase.auth.signOut();
      window.location.href = "/";
    }, 2000);
  };

  const ProfilePage = () => router.push("/profile");
  const resetModal = () => setSelectedType("");

  if (isConfirmPage) return null;

  const navItems = [
    { label: "Home", href: "/home" },
    { label: "Browse", href: "/browse" },
    { label: "Businesses", href: "/businesses" },
    { label: "Organizations", href: "/organizations" },
  ];

  // 🔹 NEW: helper so Browse is active on /browse and /browse/*
  const isBrowseActive =
    pathname === "/browse" || pathname?.startsWith("/browse/");

  // Palette
  const primary = "#2F4157";
  const accent = "#E59E2C";
  const softAccent = "#F3D58D";

  return (
    <>
      <header
        className={`fixed top-0 z-50 w-full bg-white ${
          isLoggedIn ? "border-b" : ""
        }`}
        style={{ borderColor: `${primary}1A` }}
      >
        <div className="md:px-10 lg:px-20 px-6 py-3">
          <div className="grid grid-cols-3 items-center">
            {/* LOGO (left) */}
            <div className="flex items-center">
              <Link href={"/"}>
                <Image
                  alt="EduCart Logo"
                  src="/logo.png"
                  width={160}
                  height={0}
                  className="h-auto"
                />
              </Link>
            </div>

            {/* NAVIGATION CENTER */}
            {!isLandingPage && !isLoginPage && !isSignupPage ? (
              <nav className="hidden md:flex justify-center">
                <NavigationMenu>
                  <NavigationMenuList className="gap-6">
                    {navItems.map((item) => {
                      const isActive =
                        item.href === "/browse"
                          ? isBrowseActive
                          : pathname === item.href;

                      return (
                        <NavigationMenuItem key={item.href}>
                          <NavigationMenuLink
                            href={item.href}
                            className={`text-sm font-medium transition-all duration-200 hover:cursor-pointer ${
                              isActive ? "font-semibold" : ""
                            }`}
                            style={{
                              color: isActive ? accent : primary,
                              borderBottom: isActive
                                ? `2px solid ${accent}`
                                : "2px solid transparent",
                              paddingBottom: "4px",
                            }}
                          >
                            {item.label}
                          </NavigationMenuLink>
                        </NavigationMenuItem>
                      );
                    })}
                  </NavigationMenuList>
                </NavigationMenu>
              </nav>
            ) : (
              <div />
            )}

            {/* ACTIONS (right) */}
            <div className="hidden md:flex items-center justify-end space-x-5">
              {/* Logged-in actions (Cart, Credits, Messages, Profile) */}
              {isLoggedIn === true && (
                <>
                  {/* LIST dialog */}
                  <Dialog>
                    <DialogTrigger asChild onClick={resetModal}>
                      <Button
                        className="hover:cursor-pointer flex items-center gap-2 border-0"
                        style={{
                          backgroundColor: softAccent,
                          color: primary,
                          fontWeight: 600,
                        }}
                        onMouseEnter={(e) => {
                          (e.currentTarget as HTMLButtonElement).style.backgroundColor =
                            accent;
                          (e.currentTarget as HTMLButtonElement).style.color =
                            "#FFFFFF";
                        }}
                        onMouseLeave={(e) => {
                          (e.currentTarget as HTMLButtonElement).style.backgroundColor =
                            softAccent;
                          (e.currentTarget as HTMLButtonElement).style.color =
                            primary;
                        }}
                      >
                        <Plus className="w-4 h-4" />
                        List
                      </Button>
                    </DialogTrigger>

                    <DialogContent
                      onInteractOutside={(e) => e.preventDefault()}
                      onEscapeKeyDown={(e) => e.preventDefault()}
                    >
                      <DialogClose asChild>
                        <button
                          className="absolute right-2 top-2 rounded p-1 hover:cursor-pointer"
                          aria-label="Close"
                          style={{ color: primary }}
                        >
                          <X className="h-5 w-5" />
                        </button>
                      </DialogClose>
                      <DialogHeader>
                        <div className="text-center">
                          <DialogTitle style={{ color: primary }}>
                            Create Listing
                          </DialogTitle>
                          <DialogDescription>
                            What type of listing do you want to create?
                          </DialogDescription>
                        </div>
                      </DialogHeader>
                      <Select onValueChange={setSelectedType} value={selectedType}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select Listing Type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Sale">For Sale</SelectItem>
                          <SelectItem value="Rent">Rent</SelectItem>
                          <SelectItem value="Trade">Trade</SelectItem>
                          <SelectItem value="Emergency Lending">
                            Emergency Lending
                          </SelectItem>
                          <SelectItem value="PasaBuy">PasaBuy</SelectItem>
                          <SelectItem value="Giveaway">Giveaway</SelectItem>
                        </SelectContent>
                      </Select>
                      <div>
                        {selectedType === "Sale" && (
                          <ForSaleForm selectedType={selectedType} />
                        )}
                        {selectedType === "Rent" && (
                          <RentForm selectedType={selectedType} />
                        )}
                        {selectedType === "Trade" && (
                          <TradeForm selectedType={selectedType} />
                        )}
                        {selectedType === "Emergency Lending" && (
                          <EmergencyForm selectedType={selectedType} />
                        )}
                        {selectedType === "PasaBuy" && (
                          <PasaBuyForm selectedType={selectedType} />
                        )}
                        {selectedType === "Giveaway" && (
                          <GiveawayForm selectedType={selectedType} />
                        )}
                      </div>
                    </DialogContent>
                  </Dialog>

                  {/* Credits (kept) */}
                  <div className="flex items-center gap-1" style={{ color: primary }}>
                    <Link href={"/credits/individual"} className="hover:opacity-80">
                      <BadgeCent className="w-4 h-4" />
                    </Link>
                    {user?.post_credits_balance}
                  </div>

                  {/* Messages + Profile */}
                  <DropdownMenu>
                    {/* MESSAGE BUTTON */}
                    <Link
                      href={"/messages"}
                      className="hover:opacity-80"
                      style={{ color: primary }}
                    >
                      <MessageSquare className="w-6 h-6" />
                    </Link>
                    {/* WALLET BUTTON */}
                    <Link
                      href={"/wallet"}
                      className="hover:opacity-80"
                      style={{ color: primary }}
                    >
                      <Wallet className="w-6 h-6" />
                    </Link>
                    <DropdownMenuTrigger asChild>
                      <button
                        className="hover:opacity-80 hover:cursor-pointer"
                        aria-label="Open user menu"
                        style={{ color: primary }}
                      >
                        <User className="w-6 h-6" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={ProfilePage}>
                        Profile
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={handleLogout}>
                        Log Out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              )}

              {/* Logged-out actions (Sign Up / Log In) */}
              {!isLandingPage &&
                !isLoginPage &&
                !isSignupPage &&
                isLoggedIn === false && (
                  <>
                    <Link href="/signup">
                      <Button
                        className="shadow-none border-0 hover:cursor-pointer"
                        style={{
                          backgroundColor: "transparent",
                          color: primary,
                          fontWeight: 600,
                        }}
                        onMouseEnter={(e) => {
                          (e.currentTarget as HTMLButtonElement).style.color = accent;
                        }}
                        onMouseLeave={(e) => {
                          (e.currentTarget as HTMLButtonElement).style.color = primary;
                        }}
                      >
                        Sign Up
                      </Button>
                    </Link>
                    <Link href="/login">
                      <Button
                        className="w-[175px] hover:cursor-pointer border-0"
                        style={{
                          backgroundColor: "#C7D9E5",
                          color: primary,
                          fontWeight: 600,
                        }}
                        onMouseEnter={(e) => {
                          (e.currentTarget as HTMLButtonElement).style.backgroundColor =
                            "#122C4F";
                          (e.currentTarget as HTMLButtonElement).style.color = "#FFFFFF";
                        }}
                        onMouseLeave={(e) => {
                          (e.currentTarget as HTMLButtonElement).style.backgroundColor =
                            "#C7D9E5";
                          (e.currentTarget as HTMLButtonElement).style.color = primary;
                        }}
                      >
                        Log In
                      </Button>
                    </Link>
                  </>
                )}
            </div>
          </div>
        </div>
      </header>

      {/* LOGOUT OVERLAY */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-md bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full text-center space-y-4">
            <h2 className="text-lg font-medium animate-pulse" style={{ color: primary }}>
              Logging out...
            </h2>
            <div
              className="w-10 h-10 border-4 rounded-full animate-spin mx-auto"
              style={{ borderColor: `${accent}`, borderTopColor: "transparent" }}
            />
          </div>
        </div>
      )}
    </>
  );
}
