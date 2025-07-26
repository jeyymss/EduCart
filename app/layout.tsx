import type { Metadata } from "next";
import "./globals.css";
import HeaderWrapper from "@/components/HeaderWrapper";
import { Poppins } from "next/font/google";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"], // Choose weights you need
  display: "swap",
  variable: "--font-poppins", // Optional: for Tailwind config
});

export const metadata: Metadata = {
  title: "Educart",
  description: "Marketplace for Universities",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={poppins.className}>
        <HeaderWrapper />
        {children}
      </body>
    </html>
  );
}
