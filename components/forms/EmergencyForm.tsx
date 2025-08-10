"use client";

import { useRef, useState, useEffect } from "react";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { EmergencySubmit } from "@/app/api/formSubmit/emergency/route";

interface FormProps {
  selectedType: string;
}

export function EmergencyForm({ selectedType }: FormProps) {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const formRef = useRef<HTMLFormElement | null>(null);
  const [isFormValid, setIsFormValid] = useState(false);

  useEffect(() => {
    const form = formRef.current;

    const handleValidation = () => {
      const formValid = form?.checkValidity() ?? false;
      const isValid = formValid;

      setIsFormValid(isValid);
    };

    if (form) {
      form.addEventListener("input", handleValidation);
    }

    handleValidation();

    return () => {
      if (form) {
        form.removeEventListener("input", handleValidation);
      }
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    try {
      setLoading(true);

      const formData = new FormData(e.currentTarget);

      const output = await EmergencySubmit(formData, selectedType);

      setLoading(false);

      if (output?.error) {
        setError(output.error);
      } else {
        window.location.href = "/home";
      }
    } catch (err) {
      console.error(err);
      setError("Submit Failed");
    }
  };

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-2">
      {/* Item Name */}
      <Label className="text-sm">
        Item Name<span className="text-red-600">*</span>
      </Label>
      <Input
        type="text"
        name="itemTitle"
        placeholder="Enter Name"
        className="w-full border border-gray-300 p-2 rounded-md"
        required
      />

      {/* Description */}
      <Label className="text-sm">
        Description<span className="text-red-600">*</span>
      </Label>
      <textarea
        placeholder="Description"
        name="itemDescription"
        required
        className="w-full border border-gray-300 p-2 rounded-md"
      />

      {/* Error Message */}
      {error && <p className="text-sm text-red-600 text-center">{error}</p>}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={!isFormValid || loading}
        className={`w-full p-2 rounded-md font-semibold transition 
          ${
            isFormValid
              ? "bg-[#C7D9E5] text-[#333333]  hover:text-white hover:bg-[#122C4F] hover:cursor-pointer"
              : "bg-[#DEDEDE] text-[#333333]"
          }
        `}
      >
        Post
      </button>
    </form>
  );
}
