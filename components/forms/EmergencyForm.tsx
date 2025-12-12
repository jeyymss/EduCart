"use client";

import { useRef, useState, useEffect } from "react";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { EmergencySubmit } from "@/app/api/formSubmit/emergency/route";
import { Info, AlertCircle } from "lucide-react";

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
    <div className="w-full">
      {/* Info Alert */}
      <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
        <Info className="w-5 h-5 text-red-600 mt-0.5 shrink-0" />
        <div className="text-sm text-red-800">
          <p className="font-medium mb-1">Emergency Lending Guidelines:</p>
          <ul className="list-disc list-inside space-y-0.5 text-xs">
            <li>Use for urgent, time-sensitive item requests only</li>
            <li>Clearly describe why you need this item urgently</li>
            <li>Specify expected return date if borrowing</li>
            <li>Be respectful and return items promptly</li>
          </ul>
        </div>
      </div>

      <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information Section */}
        <div className="space-y-5">
          <h3 className="text-base font-semibold text-gray-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-500" />
            Emergency Request Details
          </h3>

          {/* Item Name */}
          <div>
            <Label className="text-sm font-medium text-gray-700">
              What do you need urgently? <span className="text-red-600">*</span>
            </Label>
            <Input
              type="text"
              name="itemTitle"
              placeholder="e.g., Calculator for Exam, Laptop Charger, Medical Supplies"
              className="mt-1.5 border-gray-300 focus:border-red-400 focus:ring-red-400"
              required
            />
          </div>

          {/* Description */}
          <div>
            <Label className="text-sm font-medium text-gray-700">
              Why do you need this urgently? <span className="text-red-600">*</span>
            </Label>
            <textarea
              placeholder="Explain your urgent need and when you need it by. Include expected duration if borrowing..."
              name="itemDescription"
              required
              className="w-full border border-gray-300 p-3 rounded-md mt-1.5 min-h-[120px] resize-none focus:border-red-400 focus:ring-1 focus:ring-red-400 transition"
            />
            <p className="text-xs text-gray-500 mt-1">
              Provide context about your emergency to help others understand your urgent need
            </p>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200"></div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
            <svg className="w-5 h-5 text-red-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={!isFormValid || loading}
          className={`
            w-full
            py-3.5
            px-6
            rounded-lg
            font-semibold
            text-base
            transition-all
            duration-200
            flex items-center justify-center gap-2
            ${
              isFormValid && !loading
                ? "bg-red-500 text-white hover:bg-red-600 hover:shadow-lg transform hover:-translate-y-0.5"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }
          `}
        >
          {loading ? (
            <>
              <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Posting...
            </>
          ) : (
            <>
              <AlertCircle className="w-5 h-5" />
              Post Emergency Request
            </>
          )}
        </button>
      </form>
    </div>
  );
}
