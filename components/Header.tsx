"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "./ui/button";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
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

export default function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedType, setSelectedType] = useState("");
  const router = useRouter();
  const supabase = createClient();

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

  const ProfilePage = () => {
    router.push("/profile");
  };

  const resetModal = () => {
    setSelectedType("");
  };

  return (
    <header className="relative w-full flex items-center justify-between md:px-10 lg:px-20 px-6 py-4 bg-white z-50 ">
      {/* LOGO */}
      <div>
        <Image alt="EduCart Logo" src="/logo.png" width={200} height={0} />
      </div>

      {/* DESKTOP BUTTONS */}
      {isLoggedIn ? (
        <div className="flex items-center space-x-5">
          <Dialog>
            <DialogTrigger asChild onClick={() => resetModal()}>
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
              <Select onValueChange={(value) => setSelectedType(value)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Listing Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="For Sale">For Sale</SelectItem>
                  <SelectItem value="Rent">Rent</SelectItem>
                  <SelectItem value="Trade">Trade</SelectItem>
                  <SelectItem value="Emergency Lending">
                    Emergency Lending
                  </SelectItem>
                  <SelectItem value="PasaBuy">PasaBuy</SelectItem>
                  <SelectItem value="Giveaway">Giveaway</SelectItem>
                </SelectContent>
              </Select>

              {/* This content is rendered below without navigation */}
              <div>
                {selectedType === "For Sale" && <ForSaleForm />}
                {selectedType === "Rent" && <RentForm />}
              </div>
            </DialogContent>
          </Dialog>
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
              <DropdownMenuItem
                onClick={ProfilePage}
                className="hover:cursor-pointer"
              >
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleLogout}
                className="hover:cursor-pointer"
              >
                Log Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ) : (
        <div className="hidden md:flex items-center space-x-4">
          <Link href="/signup">
            <Button className="bg-white shadow-none text-[#333333] font-semibold hover:text-[#E59D2C] hover:bg-white  hover:cursor-pointer">
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
      {!isLoggedIn && (
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
        <div className="absolute top-full right-0.5 bg-white  w-full p-4 flex flex-col gap-3 z-50 md:hidden">
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

      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
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
