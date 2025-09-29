import type { Metadata } from "next";
import "./globals.css";
import { HeaderWrapper } from "@/components/HeaderWrapper";
import { Poppins } from "next/font/google";
import Providers from "./providers";
import ScrollToTop from "@/components/ScrollToTop";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: "Educart",
  description: "Marketplace for Universities",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={poppins.className}>
        <Providers>
          <HeaderWrapper />
          <main className="pt-16">{children}</main>
          <ScrollToTop />
        </Providers>
      </body>
    </html>
  );
}