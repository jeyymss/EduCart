"use client";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { EmergencyTransaction } from "@/app/api/transacForm/EmergencyTransac/route";
import { AlertTriangle, MapPin, Users, Check, AlertCircle, Receipt, Clock, Calendar } from "lucide-react";

interface FormProps {
  conversationId: number;
  itemTitle: string | null;
  sellerId: string;
  post_id: string;
  postType: string;
  onClose?: () => void;
}

export default function EmergencyTransacForm({
  conversationId,
  itemTitle,
  sellerId,
  post_id,
  postType,
  onClose,
}: FormProps) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement | null>(null);
  const [isFormValid, setIsFormValid] = useState(false);
  const [selectedType, setSelectedType] = useState("");
  const [selectPayment, setSelectPayment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const form = formRef.current;

    const handleValidation = () => {
      const formValid = form?.checkValidity() ?? false;
      const isValid = formValid && selectedType !== "";
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
  }, [selectPayment, selectedType]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    try {
      setLoading(true);
      const formData = new FormData(e.currentTarget);

      const result = await EmergencyTransaction(
        formData,
        conversationId,
        itemTitle,
        selectedType,
        sellerId,
        post_id,
        postType
      );

      setLoading(false);
      if (result?.error) {
        setError(result.error);
      } else {
        onClose?.();
        router.push("/profile#transactions");
      }
    } catch (err) {
      console.error(err);
      setError("Submit Failed");
      setLoading(false);
    }
  };

  const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];

  return (
    <form ref={formRef} onSubmit={handleSubmit}>
      <div className="flex flex-col lg:grid lg:grid-cols-5 gap-4 lg:gap-6">
        {/* Form Inputs - Shows second on mobile, left column on desktop */}
        <div className="order-2 lg:order-1 lg:col-span-3 space-y-4 lg:space-y-5">
          {/* Meetup Details */}
          <div className="bg-white rounded-xl border-2 border-gray-200 p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-purple-500 p-2 rounded-lg">
                <Users className="w-4 h-4 text-white" />
              </div>
              <h3 className="font-bold text-gray-900">Meetup Details</h3>
            </div>

            <div className="mb-4">
              <Label className="text-sm font-semibold">Preferred Method *</Label>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="w-full h-11 border-2 mt-1.5">
                  <SelectValue placeholder="Select meetup method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Meetup">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      <span>Meetup</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {selectedType === "Meetup" && (
              <div className="space-y-3 p-4 bg-purple-50 rounded-lg">
                <div>
                  <Label className="text-sm font-semibold">Location *</Label>
                  <Input placeholder="e.g., Starbucks SM Mall" name="inputLocation" required className="mt-1.5" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-sm font-semibold">Date *</Label>
                    <Input
                      type="date"
                      name="inputDate"
                      required
                      className="mt-1.5"
                      min={tomorrow}
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-semibold">Time *</Label>
                    <Input type="time" name="inputTime" required className="mt-1.5" step="60" />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Important Notice */}
          <div className="bg-amber-50 border-2 border-amber-300 rounded-xl p-5">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="space-y-2">
                <h4 className="font-bold text-amber-900">Emergency Lending Agreement</h4>
                <ul className="text-sm text-amber-800 space-y-1 list-disc list-inside">
                  <li>This is a temporary lending arrangement</li>
                  <li>You must return the item in the same condition</li>
                  <li>Respect the agreed return date and time</li>
                  <li>No payment is required for emergency lending</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Emergency Info & Summary (shows first on mobile as separate cards, combined sticky column on desktop) */}
        <div className="order-1 lg:order-2 lg:col-span-2">
          <div className="lg:sticky lg:top-6 space-y-4 lg:space-y-5">
            {/* Emergency Info */}
            <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-xl border-2 border-red-200 p-4 lg:p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="bg-red-500 p-2 rounded-full animate-pulse">
                  <AlertTriangle className="w-5 h-5 text-white" />
                </div>
                <span className="text-xs font-bold text-red-700 uppercase tracking-wide">Emergency Request</span>
              </div>
              <p className="font-bold text-gray-900 text-base lg:text-lg mb-3 lg:mb-4">{itemTitle}</p>

              <div className="bg-white/70 rounded-lg p-3 space-y-2">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-red-600" />
                  <span className="text-sm font-semibold text-red-700">Time-Sensitive</span>
                </div>
                <p className="text-xs text-gray-600">
                  This is an urgent request. Please coordinate pickup as soon as possible.
                </p>
              </div>
            </div>

            {/* Request Summary */}
            <div className="bg-white rounded-xl border-2 border-gray-200 p-4 lg:p-5">
              <div className="flex items-center gap-2 mb-4">
                <Receipt className="w-5 h-5 text-gray-700" />
                <h3 className="font-bold text-gray-900">Request Summary</h3>
              </div>

              <div className="space-y-3">
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-600 uppercase tracking-wide mb-2">Lending Type</p>
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold">Emergency Lending</span> — Temporary item use
                  </p>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Check className="w-4 h-4 text-green-600" />
                    <span className="text-xs font-bold text-green-700 uppercase">Free Service</span>
                  </div>
                  <p className="text-xs text-green-700">
                    No payment required for emergency lending
                  </p>
                </div>

                <div className="border-t-2 pt-3">
                  <div className="space-y-2 text-xs text-gray-600">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>Remember to return the item on time</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" />
                      <span>Handle with care during use</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 flex items-start gap-3 order-3 lg:order-none">
                <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                <p className="text-sm text-red-800 font-medium">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={!isFormValid || loading}
              className={`w-full h-12 rounded-xl font-bold transition-all order-3 lg:order-none ${
                isFormValid && !loading
                  ? "bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white shadow-lg"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Processing...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Check className="w-5 h-5" />
                  Confirm Request
                </div>
              )}
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
}
