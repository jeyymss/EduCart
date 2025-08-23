"use client";

import { Button } from "@/components/ui/button";
import Image from "next/image";
import { FeatureList } from "@/components/FeatureList";
import { TransactionSteps } from "@/components/TransactionSteps";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function Landing() {
  return (
    <div>
      <div className="flex md:px-10 lg:px-20 px-6 items-center justify-center h-[75vh] py-10 md:py-16">
        {/* LEFT SIDE */}
        <div className="flex flex-col space-y-5 md:w-1/2">
          <h1 className="font-semibold text-center md:text-left text-4xl md:text-5xl lg:text-7xl">
            Your University&apos;s <br />
            <span className="text-[#E59E2C]">Marketplace</span>
          </h1>
          <h3 className="text-sm md:text-base text-center md:text-left">
            Connect, trade, and thrive in your academic community!
          </h3>
          <Button className="w-full md:w-30 bg-[#C7D9E5] text-[#333333] hover:bg-[#122C4F] hover:text-white hover:cursor-pointer ">
            Get Started
          </Button>
        </div>

        {/* RIGHT SIDE */}
        <div className="hidden md:flex items-center justify-center xl:w-[500px] md:z-3">
          <Image
            src="/logo2.png"
            alt="logo2"
            width={0}
            height={0}
            sizes="100vw"
            className="w-[100%] h-auto"
            priority
          />
        </div>
      </div>

      {/* FEATURES */}
      <div className="md:mt-15 mt-0 md:px-10 lg:px-20 px-6">
        <hr className="border-t border-1 border-gray-300" />

        <div className="mt-10 flex flex-col justify-center items-center space-y-3">
          <h1 className="md:text-3xl text-2xl text-[#577C8E] font-semibold">
            Why <span className="text-[#E59E2C]">Choose</span> EduCart?
          </h1>
          <p className="text-[#333333] text-center text-sm md:text-lg">
            Our platform is specifically designed for university communities
            with features that address your unique needs.
          </p>
          <FeatureList />
        </div>
        <hr className="border-t border-1 border-gray-300 mt-5" />
      </div>

      {/* HOW EDUCART WORKS */}
      <div className="mt-15 lg:mx-40 md:mx-15 mx-10 md:px-10 lg:px-20 px-6 bg-[#FEF7E5] rounded-3xl flex flex-col justify-center items-center text-center">
        <h1 className="text-3xl font-semibold pt-10">
          <span className="text-[#577C8E]">How</span> EduCart Works
        </h1>
        <TransactionSteps />
      </div>

      {/* Questions */}
      <div className="mt-15 md:px-10 lg:px-20 px-6 lg:flex md:gap-3">
        {/* Left Side */}
        <div className="lg:w-1/3 w-full space-y-2 lg:py-15">
          <h1 className="text-3xl text-[#333333] sm:text-4xl md:text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl font-semibold lg:text-left text-center">
            Questions? Let&apos;s talk
          </h1>
          <h3 className="text-center text-[#102E4A] text-sm sm:text-lg md:text-xl lg:text-left lg:text-lg">
            Contact us through our email. We&apos;re always happy to help!
          </h3>
        </div>

        {/* Right Side */}
        <div className="lg:w-2/3 mt-5 lg:mt-0 border border-[#577C8E] rounded-xl p-10 space-y-5 md:flex md:justify-between md:items-center">
          <form className="md:w-5/12 space-y-5">
            <div className="border-b border-gray-300">
              <Input
                type="name"
                name="name"
                placeholder="Enter Full Name"
                className="border-none shadow-none focus:outline-none focus:ring-0"
                required
              />
            </div>
            <div className="border-b border-gray-300">
              <Input
                type="email"
                name="email"
                placeholder="Enter Email"
                className="border-none shadow-none focus:outline-none focus:ring-0"
                required
              />
            </div>
            <div>
              <Textarea
                name="message"
                placeholder="Message"
                className="shadow-none focus:outline-none focus:ring-0"
                required
              />
            </div>
            <button
              type="submit"
              className="group relative inline-flex h-10 items-center justify-center overflow-hidden rounded-md  border-2 dark:border-[#656fe2] border-[#577C8E] font-medium"
            >
              <div className="inline-flex h-10 translate-y-0 items-center justify-center  bg-gradient-to-r dark:from-[#070e41] dark:to-[#263381] from-[#f7f8ff] to-[#ffffff] px-6 dark:text-white text-black transition group-hover:-translate-y-[150%]">
                Send Message
              </div>
              <div className="absolute inline-flex h-10 w-full translate-y-[100%] items-center justify-center bg-[#394481] dark:bg-[#656fe2] px-6 text-neutral-50 transition duration-300 group-hover:translate-y-0">
                Send Message
              </div>
            </button>
          </form>

          <div className="grid grid-cols-1 gap-5 md:flex md:flex-col md:w-1/2 text-[#333333] md:space-y-4 md:pl-20 text-center md:text-left">
            <div className="space-y-1 mt-2">
              <h4 className="font-semibold text-xl">Quick Response</h4>
              <p className="text-[15px]">
                We typically respond within 24 hours
              </p>
            </div>
            <div className="space-y-1">
              <h4 className="font-semibold text-xl">Support Hours</h4>
              <div>
                <p className="text-[15px]">Monday - Friday: 8AM - 5PM</p>
                <p className="text-[15px]">Weekend: 8AM - 12PM</p>
              </div>
            </div>
            <div className="space-y-1">
              <h4 className="font-semibold text-xl">Location</h4>
              <p className="text-[15px]">Naga City, Camarines Sur</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-15 md:px-10 lg:px-20 px-6">
        <hr className="border-t border-1 border-gray-300" />
        <div className="md:flex md:justify-between items-center mt-3">
          <div>
            <Image
              alt="EduCart Logo"
              src="/logo.png"
              width={180}
              height={0}
              className="hidden md:block"
            />
          </div>
          <div>
            <p className="text-[#E59E2C] text-xs mb-3 text-center md:text-md">
              &copy; 2025 EduCart. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
