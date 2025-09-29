"use client";

import { usePathname } from "next/navigation";
import AuthFeatureCard from "@/components/auth/authDesign";
import HeaderLogin from "@/components/auth/header";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  if (pathname === "/confirm") {
    return <>{children}</>;
  }

  return (
    <>
      <HeaderLogin /> 
      <main className="flex items-center min-h-screen pt-5">
        <div className="w-full md:w-[45%] ml-50">{children}</div>
        <div className="flex-1 mr-8">
          <AuthFeatureCard />
        </div>
      </main>
    </>
  );
}