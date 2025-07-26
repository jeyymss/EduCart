"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "./ui/button";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";

export default function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
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

  const link = [
    { href: "/", label: "Home" },
    { href: "/browse", label: "Browse" },
    { href: "/business", label: "Businesses" },
    { href: "/organization", label: "Organizations" },
  ];

  return (
    <header className="relative w-full flex items-center justify-between md:px-10 lg:px-20 px-6 py-4 bg-white z-50 ">
      {/* LOGO */}
      <div>
        <Image alt="EduCart Logo" src="/logo.png" width={200} height={0} />
      </div>

      {/* DESKTOP BUTTONS */}
      <div className="hidden md:flex items-center space-x-4">
        <Link href="/signup">
          <Button className="bg-white shadow-none text-[#333333] font-semibold hover:text-[#E59D2C] hover:bg-white">
            Sign Up
          </Button>
        </Link>
        <Link href="/login">
          <Button className="bg-[#C7D9E5] text-[#333333] font-semibold w-[175px] hover:bg-[#122C4F] hover:text-white">
            Log In
          </Button>
        </Link>
      </div>

      {/* MOBILE MENU BUTTON */}
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
    </header>
  );
}
