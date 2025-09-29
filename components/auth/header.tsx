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
    <header className="fixed top-0 inset-x-0 z-50 bg-white">
      <div className="w-full px-6 md:px-10 lg:px-20 py-4 flex items-center justify-between">
        <Link href="/" aria-label="EduCart Home" className="shrink-0">
          <Image alt="EduCart Logo" src="/logo.png" width={200} height={40} />
        </Link>

        <div className="flex items-center gap-1 md:gap-2">
          {isLoginPage && (
            <>
              <span className="hidden md:inline text-sm">New here?</span>
              <Link href="/signup">
                <Button variant="link" className="p-0 h-auto">
                  Create Account <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
            </>
          )}

          {isSignupPage && (
            <>
              <span className="hidden md:inline text-sm">
                Already have an account?
              </span>
              <Link href="/login">
                <Button variant="link" className="p-0 h-auto">
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