"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "./ui/button";
import { useState } from "react";

export default function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const link = [
    { href: "/", label: "Home" },
    { href: "/browse", label: "Browse" },
    { href: "/business", label: "Businesses" },
    { href: "/organization", label: "Organizations" },
  ];

  return (
    <>
      {isLoggedIn ? (
        <header className="w-full drop-shadow-[0_4px_4px_rgba(0,0,0,0.1)] bg-white fixed">
          <nav className="flex items-center justify-between p-5">
            {/* EDUCART LOGO */}
            <Link href={"/"}>
              <Image
                src="/logo.png"
                alt="EduCart Logo"
                width={170}
                height={120}
              />
            </Link>

            {/* DESKTOP LINKS */}
            <div className={`hidden lg:flex lg:gap-20 xl:gap-40`}>
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

            {/* DESKTOP BUTTONS */}
            <div className="hidden lg:flex gap-3">
              <Link href="/login">
                <Button className="py-6 px-6 bg-[#BA3A2C] hover:bg-[#A03126] hover:cursor-pointer">
                  Sign In
                </Button>
              </Link>
              <Link href="/register">
                <Button className="py-6 px-5 border border-[#BA3A2C] bg-white text-[#BA3A2C] hover:bg-[#BA3A2C] hover:text-white hover:cursor-pointer">
                  Sign Up
                </Button>
              </Link>
            </div>

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
              <Link href="/login" onClick={() => setIsOpen(false)}>
                <Button className="w-full bg-[#BA3A2C] hover:bg-[#A03126]">
                  Sign In
                </Button>
              </Link>
              <Link href="/register" onClick={() => setIsOpen(false)}>
                <Button className="w-full border border-[#BA3A2C] bg-white text-[#BA3A2C] hover:bg-[#BA3A2C] hover:text-white">
                  Sign Up
                </Button>
              </Link>
            </div>
          )}
        </header>
      ) : (
        <header className="w-full drop-shadow-[0_4px_4px_rgba(0,0,0,0.1)] bg-white fixed">
          {/* IF USER LOGGED IN */}
          <nav className="flex items-center justify-between p-5">
            {/* EDUCART LOGO */}
            <Link href={"/"}>
              <Image
                src="/logo.png"
                alt="EduCart Logo"
                width={170}
                height={120}
              />
            </Link>

            {/* DESKTOP LINKS */}
            <div className={`hidden lg:flex lg:gap-20 xl:gap-40`}>
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

            <div className="hidden lg:block pr-10">
              <div className="flex gap-5 justify-center items-center">
                <div>
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
                </div>
                <div className="flex gap-5">
                  {/* MESSAGES ICON */}
                  <Link href={"/message"}>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width={24}
                      height={24}
                      viewBox="0 0 24 24"
                    >
                      <g fill="none" fillRule="evenodd">
                        <path d="m12.593 23.258l-.011.002l-.071.035l-.02.004l-.014-.004l-.071-.035q-.016-.005-.024.005l-.004.01l-.017.428l.005.02l.01.013l.104.074l.015.004l.012-.004l.104-.074l.012-.016l.004-.017l-.017-.427q-.004-.016-.017-.018m.265-.113l-.013.002l-.185.093l-.01.01l-.003.011l.018.43l.005.012l.008.007l.201.093q.019.005.029-.008l.004-.014l-.034-.614q-.005-.018-.02-.022m-.715.002a.02.02 0 0 0-.027.006l-.006.014l-.034.614q.001.018.017.024l.015-.002l.201-.093l.01-.008l.004-.011l.017-.43l-.003-.012l-.01-.01z"></path>
                        <path
                          fill="currentColor"
                          d="M2 6a3 3 0 0 1 3-3h14a3 3 0 0 1 3 3v10a3 3 0 0 1-3 3h-7.667L8 21.5c-.824.618-2 .03-2-1V19H5a3 3 0 0 1-3-3zm3-1a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h1.5A1.5 1.5 0 0 1 8 18.5v.5l2.133-1.6a2 2 0 0 1 1.2-.4H19a1 1 0 0 0 1-1V6a1 1 0 0 0-1-1z"
                        ></path>
                      </g>
                    </svg>
                  </Link>

                  {/* NOTIFICATION ICON */}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width={24}
                    height={24}
                    viewBox="0 0 24 24"
                  >
                    <path
                      fill="currentColor"
                      d="M10.146 3.248a2 2 0 0 1 3.708 0A7 7 0 0 1 19 10v4.697l1.832 2.748A1 1 0 0 1 20 19h-4.535a3.501 3.501 0 0 1-6.93 0H4a1 1 0 0 1-.832-1.555L5 14.697V10c0-3.224 2.18-5.94 5.146-6.752M10.586 19a1.5 1.5 0 0 0 2.829 0zM12 5a5 5 0 0 0-5 5v5a1 1 0 0 1-.168.555L5.869 17H18.13l-.963-1.445A1 1 0 0 1 17 15v-5a5 5 0 0 0-5-5"
                    ></path>
                  </svg>

                  {/* PROFILE ICON */}
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
                </div>
              </div>
            </div>

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
              <Link href="/login" onClick={() => setIsOpen(false)}>
                <Button className="w-full bg-[#BA3A2C] hover:bg-[#A03126]">
                  Sign In
                </Button>
              </Link>
              <Link href="/register" onClick={() => setIsOpen(false)}>
                <Button className="w-full border border-[#BA3A2C] bg-white text-[#BA3A2C] hover:bg-[#BA3A2C] hover:text-white">
                  Sign Up
                </Button>
              </Link>
            </div>
          )}
        </header>
      )}
    </>
  );
}
