"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function HeaderLogin() {
  const pathname = usePathname() || "";

  const isAuthPage =
    pathname === "/login" ||
    pathname.startsWith("/signup") ||
    pathname.startsWith("/organization-signup");

  if (!isAuthPage) return null;

  return (
    <header className="fixed top-0 inset-x-0 z-50 bg-white/90 backdrop-blur border-b">
      <div className="w-full max-w-6xl mx-auto flex items-center px-6 py-4">
        <Link href="/" aria-label="EduCart Home" className="shrink-0">
          <Image
            alt="EduCart Logo"
            src="/logo.png"
            width={170}
            height={40}
            className="opacity-90 hover:opacity-100 transition"
          />
        </Link>
      </div>
    </header>
  );
}
