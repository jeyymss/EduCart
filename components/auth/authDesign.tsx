"use client";

import Image from "next/image";

export default function AuthFeatureCard() {
  return (
    <div className="hidden md:flex w-1/2 xl:w-[52%] justify-center items-center">
      <div className="flex flex-col items-center justify-center space-y-14 lg:space-y-16 p-6 lg:p-8">
        {/* Yellow Card */}
        <div
          className="relative bg-[#FAD794] rounded-2xl shadow-lg
            p-8 w-[480px]
            md:p-10 md:w-[540px]
            lg:p-12 lg:w-[600px]"
        >
          <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-800 leading-snug">
            Join Your <br /> Academic Community
          </h2>
          <p className="text-sm md:text-base lg:text-lg italic text-gray-700 mt-3">
            Connect with students, faculty, and alumni.
          </p>

          <div
            className="absolute
              right-[-12px] bottom-[-34px] w-[140px]
              md:right-[-14px] md:bottom-[-38px] md:w-[160px]
              lg:right-[-18px] lg:bottom-[-46px] lg:w-[200px]"
          >
            <Image
              src="/cart.png"
              alt="Cart"
              width={200}
              height={200}
              className="w-full h-auto object-contain"
              priority
            />
          </div>
        </div>

        {/* Features */}
        <div
          className="border border-[#FAD794] rounded-2xl shadow-md text-center
            flex justify-between items-stretch
            px-8 py-5 w-[470px] text-sm
            md:px-10 md:py-6 md:w-[540px] md:text-base
            lg:w-[600px]"
        >
          {/* Feature 1 */}
          <div className="flex-1">
            <p className="font-semibold text-gray-800">Easy</p>
            <p className="text-gray-500 text-xs md:text-sm">To Use</p>
          </div>

          <div className="border-l border-gray-300 mx-4 md:mx-5 lg:mx-6" />

          {/* Feature 2 */}
          <div className="flex-1">
            <p className="font-semibold text-gray-800">Affordable</p>
            <p className="text-gray-500 text-xs md:text-sm">Prices</p>
          </div>

          <div className="border-l border-gray-300 mx-4 md:mx-5 lg:mx-6" />

          {/* Feature 3 */}
          <div className="flex-1">
            <p className="font-semibold text-gray-800">Trusted</p>
            <p className="text-gray-500 text-xs md:text-sm">Community</p>
          </div>
        </div>
      </div>
    </div>
  );
}
