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
  const isConfirmPage = pathname.startsWith("/confirm");

  return (
    <>
      {/* Show header only if NOT /confirm */}
      {!isConfirmPage && <HeaderLogin />}
      <main className="flex">
        <div className="w-full md:w-[45%]">{children}</div>
        <AuthFeatureCard />
      </main>
    </>
  );
}
