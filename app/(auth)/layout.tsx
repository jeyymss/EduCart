"use client";

import { usePathname } from "next/navigation";
import AuthFeatureCard from "@/components/auth/authDesign";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // if current route is /confirm, just render children directly
  if (pathname === "/confirm") {
    return <>{children}</>;
  }

  return (
    <>
      <main className="flex items-center min-h-screen">
  <div className="w-full md:w-[45%] ml-50">{children}</div>
  <div className="flex-1 mr-8">
    <AuthFeatureCard />
  </div>
</main>

    </>
  );
}
