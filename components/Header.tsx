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
import GiveawayForm from "./forms/GiveawayForm";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "./ui/navigation-menu";
import { useUserProfile } from "@/hooks/useUserProfile";
import { ArrowRight, BadgeCent } from "lucide-react";

export function Header() {
  const { data: user } = useUserProfile();
  const pathname = usePathname();
  const isConfirmPage = pathname?.startsWith("/confirm") ?? false;

  const isLoginPage = pathname === "/login";
  const isSignupPage =
    pathname === "/signup" || pathname === "/organization-account";

  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
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

  // ✅ If confirm page, no header at all
  if (isConfirmPage) return null;

  const navItems = [
    { label: "Home", href: "/home" },
    { label: "Browse", href: "/browse" },
    { label: "Businesses", href: "/businesses" },
    { label: "Organizations", href: "/organizations" },
  ];

  return (
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

      {/* ---------------- LOGIN / SIGNUP HEADER ---------------- */}
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

      {/* ---------------- MAIN HEADER ---------------- */}
      {!isLoginPage && !isSignupPage && (
        <>
          {/* AUTH STATE LOADING SPINNER */}
          {isLoggedIn === null ? null : isLoggedIn ? (
            // LOGGED IN VIEW
            <div className="flex items-center space-x-5">
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

              {/* CREATE LISTING DIALOG */}
              <Dialog>
                <DialogTrigger asChild onClick={resetModal}>
                  <Button variant="outline" className="hover:cursor-pointer">
                    Post
                  </Button>
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

                  {/* Render the correct form */}
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

              {/* DISPLAY USER CREDIT BALANCE */}
              <div className="flex">
                <BadgeCent />
                {user?.post_credits_balance}
              </div>

              {/* USER MENU */}
              <DropdownMenu>
                <Link href={"/messages"}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width={24}
                    height={24}
                    viewBox="0 0 24 24"
                  >
                    <g
                      fill="none"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                    >
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                    </g>
                  </svg>
                </Link>

                <DropdownMenuTrigger asChild>
                  <button
                    className="hover:cursor-pointer"
                    aria-label="Open user menu"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width={24}
                      height={24}
                      viewBox="0 0 24 24"
                    >
                      <g
                        fill="none"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                      >
                        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                        <circle cx={12} cy={7} r={4}></circle>
                      </g>
                    </svg>
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
            // GUEST VIEW
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

      {/* MOBILE MENU (only for guest users) */}
      {isLoggedIn === false && !isLoginPage && !isSignupPage && (
        <>
          <div className="md:hidden">
            <button onClick={() => setIsOpen(!isOpen)} aria-label="Toggle menu">
              {isOpen ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-6 h-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-6 h-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              )}
            </button>
          </div>

          {isOpen && (
            <div className="absolute top-full right-0.5 bg-white w-full p-4 flex flex-col gap-3 z-50 md:hidden">
              <Link href="/signup" onClick={() => setIsOpen(false)}>
                <Button className="w-full bg-white shadow-none text-[#333333] font-semibold hover:text-[#E59D2C] hover:bg-white">
                  Sign Up
                </Button>
              </Link>
              <Link href="/login" onClick={() => setIsOpen(false)}>
                <Button className="w-full bg-[#C7D9E5] text-[#333333] font-semibold hover:bg-[#122C4F] hover:text-white">
                  Login
                </Button>
              </Link>
            </div>
          )}
        </>
      )}

      {/* LOGOUT MODAL */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-md bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full text-center space-y-4">
            <h2 className="text-xl font-semibold text-gray-800">
              Logging out...
            </h2>
            <p className="text-sm text-gray-500">Please wait a moment.</p>
          </div>
        </div>
      )}
    </header>
  );
}
