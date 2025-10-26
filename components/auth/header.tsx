"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { usePathname } from "next/navigation";
import { ArrowRight } from "lucide-react";

export default function HeaderLogin() {
  const pathname = usePathname() || "";

  const isLoginPage = pathname === "/login";
  const isSignupPage =
    pathname.startsWith("/signup") ||
    pathname.startsWith("/organization-signup");
  const isConfirmPage = pathname.startsWith("/confirm");

  if (isConfirmPage) return null;
  if (!isLoginPage && !isSignupPage) return null;

  return (
    <header className="fixed top-0 inset-x-0 z-50 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 border-b">
      <div className="mx-auto max-w-6xl w-full px-4 sm:px-6 lg:px-8 py-3 sm:py-4 flex items-center justify-between">
        <Link href="/" aria-label="EduCart Home" className="shrink-0">
          <Image alt="EduCart Logo" src="/logo.png" width={200} height={40} />
        </Link>

        <div className="flex items-center gap-1 sm:gap-2">
          {isLoginPage && (
            <>
              <span className="hidden sm:inline text-sm text-gray-600">
                New here?
              </span>
              <Link href="/signup" aria-label="Create an account">
                <Button variant="link" className="p-0 h-auto text-sm sm:text-base">
                  Create Account <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
            </>
          )}

          {isSignupPage && (
            <>
              <span className="hidden sm:inline text-sm text-gray-600">
                Already have an account?
              </span>
              <Link href="/login" aria-label="Sign in to your account">
                <Button variant="link" className="p-0 h-auto text-sm sm:text-base">
                  Sign In <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
