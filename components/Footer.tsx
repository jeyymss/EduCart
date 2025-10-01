import Image from "next/image";

export default function Footer() {
  return (
    <footer className="hidden md:block bg-[#C7D9E5] px-6 md:px-10 lg:px-20 py-3 w-full">
      <div className="flex justify-between items-center">
        {/* Logo */}
        <Image
          alt="EduCart Logo"
          src="/logo.png"
          width={160}
          height={40}
          className="object-contain"
        />

        {/* Copyright */}
        <p className="text-sm text-gray-800">
          &copy; {new Date().getFullYear()} EduCart. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
