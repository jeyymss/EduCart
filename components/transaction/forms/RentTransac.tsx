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
import { RentTransaction } from "@/app/api/transacForm/RentTransac/route";
import RentDurationPicker from "@/components/forms/date-picker/rentdurationpicker";
import { Calendar, MapPin, CreditCard, Users, Check, AlertCircle, Receipt, Clock } from "lucide-react";

interface FormProps {
  conversationId: number;
  itemTitle: string | null;
  itemPrice: number | null;
  sellerId: string;
  post_id: string;
  postType: string;
  onClose?: () => void;
}

export default function RentTransacForm({
  conversationId,
  itemTitle,
  itemPrice,
  sellerId,
  post_id,
  postType,
  onClose,
}: FormProps) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement | null>(null);
  const [isFormValid, setIsFormValid] = useState(false);
  const [selectedType, setSelectedType] = useState("Meetup");
  const [selectPayment, setSelectPayment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rentStart, setRentStart] = useState<string | null>(null);
  const [rentEnd, setRentEnd] = useState<string | null>(null);

  const rentDays = rentStart && rentEnd
    ? Math.ceil((new Date(rentEnd).getTime() - new Date(rentStart).getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  const totalPrice = rentDays > 0 && itemPrice ? rentDays * itemPrice : null;

  useEffect(() => {
    const form = formRef.current;

    const handleValidation = () => {
      const formValid = form?.checkValidity() ?? false;
      const isValid = formValid && selectPayment !== "" && selectedType !== "" && rentStart !== null && rentEnd !== null;
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
  }, [selectPayment, selectedType, rentStart, rentEnd]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    try {
      setLoading(true);
      const formData = new FormData(e.currentTarget);

      const result = await RentTransaction(
        formData,
        conversationId,
        itemPrice,
        itemTitle,
        selectedType,
        selectPayment,
        sellerId,
        post_id,
        postType,
        rentStart,
        rentEnd
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

  const formatCurrency = (v?: number | null) => v != null ? `₱${v.toLocaleString()}` : "—";

  return (
    <form ref={formRef} onSubmit={handleSubmit}>
      <div className="flex flex-col lg:grid lg:grid-cols-5 gap-4 lg:gap-6">
        {/* Form Inputs - Shows second on mobile, left column on desktop */}
        <div className="order-2 lg:order-1 lg:col-span-3 space-y-4 lg:space-y-5">
          {/* Rental Period */}
          <div className="bg-white rounded-xl border-2 border-gray-200 p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-indigo-500 p-2 rounded-lg">
                <Calendar className="w-4 h-4 text-white" />
              </div>
              <h3 className="font-bold text-gray-900">Rental Period</h3>
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-semibold">Select rental duration *</Label>
              <RentDurationPicker
                onChange={(start, end) => {
                  setRentStart(start);
                  setRentEnd(end);
                }}
              />
              {rentStart && rentEnd && (
                <div className="bg-indigo-50 rounded-lg p-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Duration:</span>
                    <span className="font-semibold text-indigo-700">{rentDays} day{rentDays !== 1 ? 's' : ''}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Meetup Details */}
          <div className="bg-white rounded-xl border-2 border-gray-200 p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-purple-500 p-2 rounded-lg">
                <Users className="w-4 h-4 text-white" />
              </div>
              <h3 className="font-bold text-gray-900">Meetup Details</h3>
            </div>

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
          </div>

          {/* Payment Method */}
          <div className="bg-white rounded-xl border-2 border-gray-200 p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-green-500 p-2 rounded-lg">
                <CreditCard className="w-4 h-4 text-white" />
              </div>
              <h3 className="font-bold text-gray-900">Payment Method</h3>
            </div>

            <Select value={selectPayment} onValueChange={setSelectPayment}>
              <SelectTrigger className="w-full h-11 border-2">
                <SelectValue placeholder="Select payment method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Cash on Hand">💵 Cash on Hand</SelectItem>
                <SelectItem value="Online Payment">💳 Online Payment</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Right Column - Item Info & Summary (shows first on mobile as separate cards, combined sticky column on desktop) */}
        <div className="order-1 lg:order-2 lg:col-span-2">
          <div className="lg:sticky lg:top-6 space-y-4 lg:space-y-5">
            {/* Item Info */}
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border-2 border-indigo-200 p-4 lg:p-5">
              <div className="flex items-center gap-3 mb-3">
                <Clock className="w-5 h-5 text-indigo-600" />
                <span className="text-xs font-bold text-indigo-700 uppercase tracking-wide">Item for Rent</span>
              </div>
              <p className="font-bold text-gray-900 text-base lg:text-lg mb-3 lg:mb-4">{itemTitle}</p>

              <div className="bg-white/70 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Price per Day</span>
                  <span className="text-lg lg:text-xl font-bold text-indigo-600">{formatCurrency(itemPrice)}</span>
                </div>
              </div>
            </div>

            {/* Rental Summary */}
            {rentDays > 0 && (
              <div className="bg-white rounded-xl border-2 border-gray-200 p-4 lg:p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Receipt className="w-5 h-5 text-gray-700" />
                  <h3 className="font-bold text-gray-900">Rental Summary</h3>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Price per Day</span>
                    <span className="font-semibold">{formatCurrency(itemPrice)}</span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Duration</span>
                    <span className="font-semibold">{rentDays} day{rentDays !== 1 ? 's' : ''}</span>
                  </div>

                  <div className="text-xs text-gray-500 italic bg-gray-50 p-2 rounded">
                    Meetup transaction — No delivery fees
                  </div>

                  <div className="border-t-2 pt-3">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-gray-900">Total</span>
                      <span className="text-xl lg:text-2xl font-bold text-indigo-600">{formatCurrency(totalPrice)}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

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
                  ? "bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white shadow-lg"
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
                  Confirm Rental
                </div>
              )}
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
}
