"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { usePathname } from "next/navigation";
import { ArrowRight, ArrowLeft } from "lucide-react";

export default function HeaderLogin() {
  const pathname = usePathname();

  // Check the current route
  const isLoginPage = pathname === "/login";
  const isSignupPage = pathname === "/signup";

  if (!isLoginPage && !isSignupPage) return null; // don't show header on other pages

  return (
    <header className="relative w-full flex items-center justify-between md:px-10 lg:px-20 px-6 py-4 bg-white z-50">
      {/* LOGO */}
      <div>
        <Link href={"/"}>
          <Image alt="EduCart Logo" src="/logo.png" width={200} height={0} />
        </Link>
      </div>

      {/* Right section changes depending on login/signup */}
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
    </header>
  );
}
