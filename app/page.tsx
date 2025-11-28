"use client";

import { Button } from "@/components/ui/button";
import Image from "next/image";
import { FeatureList } from "@/components/FeatureList";
import { TransactionSteps } from "@/components/TransactionSteps";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Link from "next/link";

const primary = "#2F4157";
const accent = "#E59E2C";

export default function Landing() {
  return (
    <div className="w-full overflow-x-hidden">
      {/* MAIN CONTAINER FOR WEB */}
      <div className="max-w-[1500px] mx-auto">

        {/* HERO SECTION */}
        <div className="flex flex-col-reverse md:flex-row items-center justify-between 
          px-6 md:px-10 lg:px-16 xl:px-24 
          min-h-[75vh] py-10 md:py-16 gap-10 md:gap-0"
        >

          {/* LEFT SIDE */}
          <div className="flex flex-col space-y-6 text-center md:text-left md:w-1/2 
            xl:pr-10 2xl:pr-20"
          >
            <h1 className="font-semibold text-4xl sm:text-5xl lg:text-6xl xl:text-7xl 
              2xl:text-8xl leading-tight max-w-[650px]"
            >
              Your University&apos;s <br />
              <span className="text-[#E59E2C]">Marketplace</span>
            </h1>

            <h3 className="text-sm md:text-base text-gray-700 max-w-[420px] mx-auto md:mx-0">
              Connect, trade, and thrive in your academic community!
            </h3>

            {/* BUTTONS */}
            <div className="flex flex-col sm:flex-row justify-center md:justify-start gap-4 mt-3">
              <Link href="/signup">
                <Button
                  className="rounded-full w-full sm:w-[150px] font-semibold transition-all duration-300 ease-in-out 
                    border-2 border-[#E59E2C] text-[#E59E2C] 
                    hover:bg-[#E59E2C] hover:text-white hover:shadow-lg hover:scale-[1.03]"
                  variant="outline"
                >
                  Sign Up
                </Button>
              </Link>

              <Link href="/login">
                <Button
                  className="rounded-full w-full sm:w-[150px] font-semibold transition-all duration-300 ease-in-out 
                    bg-[#C7D9E5] text-[#2F4157] 
                    hover:bg-[#122C4F] hover:text-white hover:shadow-lg hover:scale-[1.03]"
                >
                  Log In
                </Button>
              </Link>
            </div>
          </div>

          {/* RIGHT SIDE */}
          <div className="flex justify-center md:justify-end md:w-1/2">
            <Image
              src="/logo2.png"
              alt="logo2"
              width={550}
              height={550}
              className="w-[75%] md:w-[110%] lg:w-[120%] xl:w-[130%] 2xl:w-[140%] h-auto"
              priority
            />
          </div>
        </div>

        {/* FEATURES SECTION */}
        <div className="px-6 md:px-10 lg:px-20 mt-10 md:mt-20">
          <hr className="border-t border-gray-300" />

          <div className="mt-10 flex flex-col justify-center items-center text-center space-y-3 max-w-[1000px] mx-auto">
            <h1 className="text-2xl md:text-3xl lg:text-4xl text-[#577C8E] font-semibold">
              Why <span className="text-[#E59E2C]">Choose</span> EduCart?
            </h1>

            <p className="text-gray-700 text-sm md:text-lg max-w-2xl">
              Our platform is specifically designed for university communities
              with features that address your unique needs.
            </p>

            <FeatureList />
          </div>

          <hr className="border-t border-gray-300 mt-10" />
        </div>

        {/* HOW IT WORKS */}
        <div className="mt-15 mx-6 md:mx-10 lg:mx-20 xl:mx-40 
          bg-[#FEF7E5] rounded-3xl flex flex-col justify-center items-center 
          text-center py-10 px-6 md:px-12"
        >
          <h1 className="text-3xl lg:text-4xl font-semibold mb-5">
            <span className="text-[#577C8E]">How</span> EduCart Works
          </h1>

          <TransactionSteps />
        </div>

        {/* CONTACT SECTION */}
        <div className="mt-15 px-6 md:px-10 lg:px-20 flex flex-col lg:flex-row gap-8 lg:gap-12 max-w-[1400px] mx-auto">

          {/* Left */}
          <div className="lg:w-1/3 w-full text-center lg:text-left space-y-4">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-[#333333] leading-tight">
              Questions? Let&apos;s talk
            </h1>
            <h3 className="text-[#102E4A] text-base sm:text-lg">
              Contact us through our email. We&apos;re always happy to help!
            </h3>
          </div>

          {/* Right */}
          <div className="lg:w-2/3 border border-[#577C8E] rounded-2xl p-6 sm:p-10 
            space-y-6 flex flex-col md:flex-row md:justify-between md:items-start 
            gap-8 shadow-sm"
          >
            <form className="md:w-5/12 space-y-5">
              <div className="border-b border-gray-300">
                <Input
                  type="name"
                  name="name"
                  placeholder="Enter Full Name"
                  className="border-none shadow-none focus:ring-0 text-sm md:text-base"
                  required
                />
              </div>

              <div className="border-b border-gray-300">
                <Input
                  type="email"
                  name="email"
                  placeholder="Enter Email"
                  className="border-none shadow-none focus:ring-0 text-sm md:text-base"
                  required
                />
              </div>

              <Textarea
                name="message"
                placeholder="Message"
                className="shadow-none focus:ring-0 text-sm md:text-base"
                required
              />

              <button
                type="submit"
                className="w-full sm:w-auto rounded-full font-medium px-6 py-2 
                  text-sm md:text-base bg-[#C7D9E5] text-[#2F4157] border-2 border-[#C7D9E5]
                  transition-all duration-300 hover:bg-[#122C4F] hover:text-white hover:shadow-lg hover:scale-[1.03]"
              >
                Send Message
              </button>
            </form>

            <div className="grid grid-cols-1 gap-5 md:w-1/2 text-center md:text-left text-[#333333]">
              <div>
                <h4 className="font-semibold text-lg">⚡ Quick Response</h4>
                <p className="text-sm md:text-base">
                  We typically respond within 24 hours
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-lg">🕒 Support Hours</h4>
                <p className="text-sm md:text-base">Monday - Friday: 8AM - 5PM</p>
                <p className="text-sm md:text-base">Weekend: 8AM - 12PM</p>
              </div>

              <div>
                <h4 className="font-semibold text-lg">📍 Location</h4>
                <p className="text-sm md:text-base">Naga City, Camarines Sur</p>
              </div>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="mt-15 px-6 md:px-10 lg:px-20">
          <hr className="border-t border-gray-300" />

          <div className="flex flex-col md:flex-row justify-between items-center mt-3 gap-2 max-w-[1500px] mx-auto">
            <Image
              alt="EduCart Logo"
              src="/logo.png"
              width={160}
              height={0}
              className="hidden md:block"
            />

            <p className="text-[#E59E2C] text-xs md:text-sm text-center">
              &copy; 2025 EduCart. All rights reserved.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
