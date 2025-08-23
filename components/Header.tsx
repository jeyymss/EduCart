"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
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

import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "./ui/navigation-menu";
import { usePathname } from "next/navigation";
import GiveawayForm from "./forms/GiveawayForm";

export function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedType, setSelectedType] = useState("");
  const router = useRouter();
  const supabase = createClient();
  const pathname = usePathname();

  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setIsLoggedIn(!!session);
    };

    checkSession();
  }, [supabase]);

  const handleLogout = async () => {
    setShowLogoutModal(true);
    setTimeout(async () => {
      await supabase.auth.signOut();
      window.location.href = "/";
    }, 2000);
  };

  const ProfilePage = () => router.push("/profile");
  const resetModal = () => setSelectedType("");

  const navItems = [
    { label: "Home", href: "/home" },
    { label: "Browse", href: "/browse" },
    { label: "Businesses", href: "/businesses" },
    { label: "Organizations", href: "/organizations" },
  ];

  return (
    <header
      className={`relative w-full flex items-center justify-between md:px-10 lg:px-20 px-6 py-4 bg-white ${
        isLoggedIn ? "border-b border-[#DEDEDE]" : ""
      }`}
    >
      {/* LOGO */}
      <div>
        <Link href={"/"}>
          <Image alt="EduCart Logo" src="/logo.png" width={200} height={0} />
        </Link>
      </div>

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
            <DialogContent className="">
              <DialogHeader>
                <div className="text-center">
                  <DialogTitle>Create Listing</DialogTitle>
                  <DialogDescription>
                    What type of listing do you want to create?
                  </DialogDescription>
                </div>
              </DialogHeader>
              <Select
                onValueChange={(value) => setSelectedType(value)}
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

              {/* Render the correct form */}
              <div>
                {selectedType === "Sale" && selectedType && (
                  <ForSaleForm selectedType={selectedType} />
                )}
                {selectedType === "Rent" && selectedType && (
                  <RentForm selectedType={selectedType} />
                )}
                {selectedType === "Trade" && selectedType && (
                  <TradeForm selectedType={selectedType} />
                )}
                {selectedType === "Emergency Lending" && selectedType && (
                  <EmergencyForm selectedType={selectedType} />
                )}
                {selectedType === "PasaBuy" && selectedType && (
                  <PasaBuyForm selectedType={selectedType} />
                )}
                {selectedType === "Giveaway" && selectedType && (
                  <GiveawayForm selectedType={selectedType} />
                )}
              </div>
            </DialogContent>
          </Dialog>

          {/* USER MENU */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="hover:cursor-pointer">
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
              <DropdownMenuItem onClick={ProfilePage}>Profile</DropdownMenuItem>
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

      {/* MOBILE MENU BUTTON */}
      {isLoggedIn === false && (
        <div className="md:hidden">
          <button onClick={() => setIsOpen(!isOpen)}>
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
      )}

      {/* MOBILE DROPDOWN MENU */}
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
