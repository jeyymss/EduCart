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
  Home,
  Search,
  PlusSquare,
  MessageSquare,
  User,
  X,
} from "lucide-react";

export function Header() {
  const { data: user } = useUserProfile();
  const pathname = usePathname();
  const isConfirmPage = pathname?.startsWith("/confirm") ?? false;

  const isLoginPage = pathname === "/login";
  const isSignupPage =
    pathname === "/signup" || pathname === "/organization-account";

  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [selectedType, setSelectedType] = useState("");

  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    if (isConfirmPage) return; // skip on /confirm
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

  return (
    <>
      {/* ---------------- DESKTOP HEADER (unchanged) ---------------- */}
      <header
        className={`fixed top-0 z-50 w-full flex items-center justify-between md:px-10 lg:px-20 px-6 py-4 bg-white ${
          isLoggedIn ? "border-b border-[#DEDEDE]" : ""
        }`}
      >
        {/* LOGO */}
        <div>
          <Link href={"/"}>
            <Image alt="EduCart Logo" src="/logo.png" width={200} height={0} />
          </Link>
        </div>

        {/* LOGIN / SIGNUP */}
        {(isLoginPage || isSignupPage) && (
          <div className="hidden md:flex items-center">
            {isLoginPage && (
              <>
                <span className="text-sm">New here?</span>
                <Link href="/signup">
                  <Button variant="link" className="hover:cursor-pointer">
                    Create Account <ArrowRight />
                  </Button>
                </Link>
              </>
            )}

            {isSignupPage && (
              <>
                <span className="text-sm">Already have an account?</span>
                <Link href="/login">
                  <Button variant="link" className="hover:cursor-pointer">
                    Sign In <ArrowRight />
                  </Button>
                </Link>
              </>
            )}
          </div>
        )}

        {/* MAIN HEADER (desktop only) */}
        {!isLoginPage && !isSignupPage && (
          <>
            {isLoggedIn === null ? null : isLoggedIn ? (
              <div className="hidden md:flex items-center space-x-5">
                <NavigationMenu>
                  <NavigationMenuList>
                    {navItems.map((item) => (
                      <NavigationMenuItem key={item.href}>
                        <NavigationMenuLink
                          href={item.href}
                          className={`hover:cursor-pointer font-medium text-[#333333] hover:text-[#333333] ${
                            pathname === item.href
                              ? "text-[#577C8E] font-semibold"
                              : ""
                          }`}
                        >
                          {item.label}
                        </NavigationMenuLink>
                      </NavigationMenuItem>
                    ))}
                  </NavigationMenuList>
                </NavigationMenu>

                {/* Post dialog */}
                <Dialog>
                  <DialogTrigger asChild onClick={resetModal}>
                    <Button variant="outline" className="hover:cursor-pointer">
                      Post
                    </Button>
                  </DialogTrigger>
                  <DialogContent
                    onInteractOutside={(e) => e.preventDefault()}
                    onEscapeKeyDown={(e) => e.preventDefault()}
                  >
                    <DialogClose asChild>
                      <button
                        className="absolute right-2 top-2 rounded p-1 text-gray-500 hover:bg-gray-200 hover:cursor-pointer"
                        aria-label="Close"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </DialogClose>
                    <DialogHeader>
                      <div className="text-center">
                        <DialogTitle>Create Listing</DialogTitle>
                        <DialogDescription>
                          What type of listing do you want to create?
                        </DialogDescription>
                      </div>
                    </DialogHeader>
                    <Select
                      onValueChange={setSelectedType}
                      value={selectedType}
                    >
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

                {/* Credits */}
                <div className="flex items-center gap-1">
                  <Link href={"/credits/individual"}>
                    <BadgeCent className="w-4 h-4" />
                  </Link>

                  {user?.post_credits_balance}
                </div>

                {/* Messages + Profile */}
                <DropdownMenu>
                  <Link href={"/messages"}>
                    <MessageSquare className="w-6 h-6" />
                  </Link>

                  <DropdownMenuTrigger asChild>
                    <button
                      className="hover:cursor-pointer"
                      aria-label="Open user menu"
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
              </div>
            ) : (
              <div className="hidden md:flex items-center space-x-4">
                <Link href="/signup">
                  <Button className="bg-white shadow-none text-[#333333] font-semibold hover:text-[#E59D2C] hover:bg-white hover:cursor-pointer">
                    Sign Up
                  </Button>
                </Link>
                <Link href="/login">
                  <Button className="bg-[#C7D9E5] text-[#333333] font-semibold w-[175px] hover:bg-[#122C4F] hover:text-white hover:cursor-pointer">
                    Log In
                  </Button>
                </Link>
              </div>
            )}
          </>
        )}
      </header>

      {/* ---------------- BOTTOM NAV FOR MOBILE ---------------- */}
      {isLoggedIn && !isLoginPage && !isSignupPage && (
        <nav className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 flex justify-around items-center py-2 md:hidden z-50">
          {/* Home */}
          <Link
            href="/home"
            className={`flex flex-col items-center text-xs ${
              pathname === "/home" ? "text-[#577C8E]" : "text-gray-500"
            }`}
          >
            <Home className="w-6 h-6" />
            Home
          </Link>

          {/* Browse */}
          <Link
            href="/browse"
            className={`flex flex-col items-center text-xs ${
              pathname === "/browse" ? "text-[#577C8E]" : "text-gray-500"
            }`}
          >
            <Search className="w-6 h-6" />
            Browse
          </Link>

          {/* Post */}
          <Dialog>
            <DialogTrigger asChild onClick={resetModal}>
              <button className="flex flex-col items-center text-xs text-gray-500">
                <PlusSquare className="w-6 h-6" />
                Post
              </button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <div className="text-center">
                  <DialogTitle>Create Listing</DialogTitle>
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

          {/* Messages */}
          <Link
            href="/messages"
            className={`flex flex-col items-center text-xs ${
              pathname === "/messages" ? "text-[#577C8E]" : "text-gray-500"
            }`}
          >
            <MessageSquare className="w-6 h-6" />
            Messages
          </Link>

          {/* Profile */}
          <Link
            href="/profile"
            className={`flex flex-col items-center text-xs ${
              pathname === "/profile" ? "text-[#577C8E]" : "text-gray-500"
            }`}
          >
            <User className="w-6 h-6" />
            Profile
          </Link>
        </nav>
      )}

      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-md bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full text-center space-y-4">
            <h2 className="text-lg font-medium text-gray-700 animate-pulse">
              Logging out...
            </h2>
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          </div>
        </div>
      )}
    </>
  );
}
