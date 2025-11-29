"use client";

import { useState, useEffect } from "react";

import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose, 
} from "@/components/ui/dialog";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";

import { Info, X } from "lucide-react"; 

export default function AddBusinessModal() {
  const [businessName, setBusinessName] = useState("");
  const [businessType, setBusinessType] = useState("");
  const [document, setDocument] = useState<File | null>(null);

  const isValid = businessName.trim() !== "" && businessType.trim() !== "";

  const [isMobile, setIsMobile] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    const checkMobile =
      typeof window !== "undefined" &&
      ("ontouchstart" in window || navigator.maxTouchPoints > 0);

    setIsMobile(checkMobile);
  }, []);

  const handleSubmit = () => {
    if (!isValid) return;

    console.log("Business Account Data:", {
      businessName,
      businessType,
      document,
    });
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="border-[#F3AD4B] text-[#F3AD4B] hover:bg-[#FFF7E9]"
        >
          Add Business Account
        </Button>
      </DialogTrigger>

      {/* MOBILE */}
      <DialogContent
        className="
          max-w-lg rounded-xl p-6 shadow-lg
          md:max-w-lg md:p-6
          w-[90%] p-4
        "
      >

        <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 hover:opacity-100 transition">
          <X className="h-5 w-5" />
        </DialogClose>

        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-[#2F4157]">
            Create Business Account
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-2">
          {/* BUSINESS NAME */}
          <div className="space-y-2">
            <div className="flex items-center gap-1">
              <Label className="text-sm font-medium text-[#2F4157]">
                Business Name
              </Label>
              <span className="text-red-500">*</span>
            </div>

            <Input
              placeholder="Enter business name"
              className="rounded-md border-gray-300 focus:ring-[#C7D9E5]"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
            />
          </div>

          {/* BUSINESS TYPE */}
          <div className="space-y-2">
            <div className="flex items-center gap-1">
              <Label className="text-sm font-medium text-[#2F4157]">
                Business Type
              </Label>
              <span className="text-red-500">*</span>
            </div>

            <Select value={businessType} onValueChange={setBusinessType}>
              <SelectTrigger className="rounded-md border-gray-300">
                <SelectValue placeholder="Select business type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="clothing">Clothing</SelectItem>
                <SelectItem value="food">Food & Snacks</SelectItem>
                <SelectItem value="services">Services</SelectItem>
                <SelectItem value="technology">Technology</SelectItem>
                <SelectItem value="handmade">Handmade Goods</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* OPTIONAL DOCUMENT UPLOAD */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label className="text-sm font-medium text-[#2F4157]">
                Upload Documents (Optional)
              </Label>

              {/* Tooltip */}
              <div className="relative group">
                <button
                  type="button"
                  className="cursor-pointer"
                  onClick={() => {
                    if (isMobile) setShowTooltip((prev) => !prev);
                  }}
                >
                  <Info size={16} className="text-gray-500" />
                </button>

                <div
                  className={`
                    absolute left-1/2 -translate-x-1/2 mt-2 w-60
                    bg-black text-white text-xs p-2 rounded-md shadow-lg z-50
                    transition-opacity duration-200
                    ${!isMobile ? "opacity-0 group-hover:opacity-100" : ""}
                    ${isMobile ? (showTooltip ? "opacity-100" : "opacity-0 pointer-events-none") : ""}
                  `}
                >
                  Optional documents may include: Business permit or clearance,
                  DTI certificate, Store or product photos.
                </div>
              </div>
            </div>

            <Input
              type="file"
              className="rounded-md border-gray-300"
              onChange={(e) => setDocument(e.target.files?.[0] ?? null)}
            />
          </div>

          {/* NOTE */}
          <p className="text-xs text-gray-500 leading-relaxed">
            No additional ID or email verification is required. Your personal
            account is already verified. Providing business documents is optional
            but can help establish credibility with buyers.
          </p>
        </div>

        <DialogFooter>
          <Button
            onClick={handleSubmit}
            disabled={!isValid}
            className={`
              w-full rounded-md transition-all
              ${
                isValid
                  ? "bg-[#C7D9E5] text-[#102E4A] hover:bg-[#b8cedc]"
                  : "bg-[#DEDEDE] text-gray-500 cursor-not-allowed"
              }
            `}
          >
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
