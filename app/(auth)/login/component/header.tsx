"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

import { ArrowRight } from "lucide-react";

export default function HeaderLogin() {
  return (
    <header className="relative w-full flex items-center justify-between md:px-10 lg:px-20 px-6 py-4 bg-white z-50 ">
      {/* LOGO */}
      <div>
        <Image alt="EduCart Logo" src="/logo.png" width={200} height={0} />
      </div>
      <div className="hidden md:flex items-center">
        <span className="text-sm">New here?</span>
        <Link href={"/signup"}>
          <Button variant="link" className="hover:cursor-pointer">
            Create Account <ArrowRight />
          </Button>
        </Link>
      </div>
    </header>
  );
}
