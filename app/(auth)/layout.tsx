"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import HeaderLogin from "@/components/auth/header";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  if (pathname === "/confirm") {
    return <>{children}</>;
  }

  const isLoginPage = pathname === "/login";
  const isSignupPage =
    pathname.startsWith("/signup") ||
    pathname.startsWith("/organization-signup");

  const showSlider = isLoginPage || isSignupPage;

  return (
    <>
      <HeaderLogin />

      <main
        className={`min-h-screen flex flex-col items-center px-4
        ${showSlider ? "pt-12 pb-20" : "pt-32 pb-10"}
      `}
      >
        {/* SLIDER WRAPPER*/}
        {showSlider && (
          <div className="w-full max-w-xl mx-auto mb-6">
            <div
              className={`relative ${
                isSignupPage ? "-mb-20" : "-mb-20"
              }`}
            >
              <div className="relative flex items-center bg-white border border-gray-200 rounded-full shadow-sm p-1.5 overflow-hidden">
                <div
                  className="absolute rounded-full"
                  style={{
                    backgroundColor: "#F3D58D",
                    height: "calc(100% - 12px)",
                    width: "calc(50% - 6px)",
                    top: 6,
                    left: isLoginPage ? 6 : "calc(50% + 0px)",
                    transition:
                      "left 0.45s cubic-bezier(0.175, 0.885, 0.335, 1.15)",
                  }}
                />

                <Link
                  href="/login"
                  className={`flex-1 text-center py-2 text-sm md:text-[0.95rem] font-medium relative z-10 transition ${
                    isLoginPage
                      ? "text-gray-900 font-semibold"
                      : "text-gray-600"
                  }`}
                >
                  Login
                </Link>

                <Link
                  href="/signup"
                  className={`flex-1 text-center py-2 text-sm md:text-[0.95rem] font-medium relative z-10 transition ${
                    isSignupPage
                      ? "text-gray-900 font-semibold"
                      : "text-gray-600"
                  }`}
                >
                  Sign Up
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* FORM WRAPPER */}
        <div
          className={`
            w-full max-w-4xl mx-auto transition-all duration-300
            ${isLoginPage ? "-mt-15" : ""}
            ${isSignupPage ? "mt-4" : ""}
          `}
        >
          {children}
        </div>
      </main>
    </>
  );
}
