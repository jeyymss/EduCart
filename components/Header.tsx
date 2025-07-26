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
    <header className="w-full drop-shadow-[0_4px_4px_rgba(0,0,0,0.1)] bg-white fixed z-50">
      <nav className="flex items-center justify-between p-5">
        {/* EDUCART LOGO */}
        <Link href={"/"}>
          <Image src="/logo.png" alt="EduCart Logo" width={170} height={120} />
        </Link>

        {/* DESKTOP LINKS */}
        <div className="hidden lg:flex lg:gap-20 xl:gap-40">
          {link.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`transition pb-1 text-[16px] ${
                pathname === link.href
                  ? "border-b-2 border-[#BA3A2C] font-medium text-[#BA3A2C] px-2"
                  : "border-b-2 border-transparent font-medium hover:text-[#BA3A2C]"
              } hover:border-[#BA3A2C] px-2`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* DESKTOP RIGHT SIDE */}
        {isLoggedIn ? (
          <div className="hidden lg:flex gap-5 pr-10 items-center">
            <Button className="py-6">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width={50}
                height={50}
                viewBox="0 0 24 24"
              >
                <path
                  fill="currentColor"
                  d="M11 13H5v-2h6V5h2v6h6v2h-6v6h-2z"
                ></path>
              </svg>
              Post Item
            </Button>
            <Link href={"/messages"}>
              {" "}
              {/* BUTTON FOR MESSAGES */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width={24}
                height={24}
                viewBox="0 0 24 24"
              >
                <path
                  fill="currentColor"
                  d="M2 6a3 3 0 0 1 3-3h14a3 3 0 0 1 3 3v10a3 3 0 0 1-3 3h-7.667L8 21.5c-.824.618-2 .03-2-1V19H5a3 3 0 0 1-3-3z"
                />
              </svg>
            </Link>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width={24}
              height={24}
              viewBox="0 0 24 24"
            >
              <path
                fill="currentColor"
                d="M10.146 3.248a2 2 0 0 1 3.708 0A7 7 0 0 1 19 10v4.697l1.832 2.748A1 1 0 0 1 20 19h-4.535a3.501 3.501 0 0 1-6.93 0H4a1 1 0 0 1-.832-1.555L5 14.697V10c0-3.224 2.18-5.94 5.146-6.752Z"
              />
            </svg>

            <Link href={"/profile"}>
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
            </Link>
          </div>
        ) : (
          <div className="hidden lg:flex gap-3">
            <Link href="/login">
              <Button className="py-6 px-6 bg-[#BA3A2C] hover:bg-[#A03126] hover:cursor-pointer">
                Sign In
              </Button>
            </Link>
            <Link href="/signup">
              <Button className="py-6 px-5 border border-[#BA3A2C] bg-white text-[#BA3A2C] hover:bg-[#BA3A2C] hover:text-white hover:cursor-pointer">
                Sign Up
              </Button>
            </Link>
          </div>
        )}

        {/* MOBILE MENU BUTTON */}
        <div className="lg:hidden">
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
      </nav>

      {/* MOBILE DROPDOWN MENU */}
      {isOpen && (
        <div className="lg:hidden flex flex-col gap-3 px-5 pb-4">
          {link.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`pb-2 border-b ${
                pathname === link.href ? "text-[#BA3A2C] font-semibold" : ""
              }`}
              onClick={() => setIsOpen(false)}
            >
              {link.label}
            </Link>
          ))}

          {!isLoggedIn && (
            <>
              <Link href="/login" onClick={() => setIsOpen(false)}>
                <Button className="w-full bg-[#BA3A2C] hover:bg-[#A03126]">
                  Sign In
                </Button>
              </Link>
              <Link href="/signup" onClick={() => setIsOpen(false)}>
                <Button className="w-full border border-[#BA3A2C] bg-white text-[#BA3A2C] hover:bg-[#BA3A2C] hover:text-white">
                  Sign Up
                </Button>
              </Link>
            </>
          )}
        </div>
      )}
    </header>
  );
}
