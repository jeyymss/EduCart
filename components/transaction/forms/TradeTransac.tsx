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
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { TradeTransaction } from "@/app/api/transacForm/TradeTransac/route";
import { Repeat, MapPin, CreditCard, Users, Check, AlertCircle, Receipt, Package, DollarSign } from "lucide-react";

interface FormProps {
  conversationId: number;
  itemTitle: string | null;
  itemTrade: string;
  itemPrice: number | null;
  sellerId: string;
  post_id: string;
  postType: string;
  onClose?: () => void;
}

export default function TradeTransacForm({
  conversationId,
  itemTitle,
  itemTrade,
  itemPrice,
  sellerId,
  post_id,
  postType,
  onClose,
}: FormProps) {
  const formRef = useRef<HTMLFormElement | null>(null);
  const [isFormValid, setIsFormValid] = useState(false);
  const [selectedType, setSelectedType] = useState("");
  const [selectPayment, setSelectPayment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasCashRequired = itemPrice !== null && itemPrice > 0;

  useEffect(() => {
    const form = formRef.current;

    const handleValidation = () => {
      const formValid = form?.checkValidity() ?? false;

      const offeredItemValue =
        form?.querySelector<HTMLInputElement>("input[name='offeredItem']")
          ?.value ?? "";

      const isOfferedItemValid = offeredItemValue.trim() !== "";

      const isValid =
        formValid && selectedType !== "" && isOfferedItemValid;

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

      const result = await TradeTransaction(
        formData,
        conversationId,
        itemPrice,
        itemTitle,
        selectedType,
        selectPayment,
        sellerId,
        post_id,
        postType
      );

      setLoading(false);
      if (result?.error) {
        setError(result.error);
      } else {
        onClose?.();
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
          {/* Your Offered Item */}
          <div className="bg-white rounded-xl border-2 border-gray-200 p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-orange-500 p-2 rounded-lg">
                <Package className="w-4 h-4 text-white" />
              </div>
              <h3 className="font-bold text-gray-900">Your Offered Item</h3>
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-semibold">What are you offering to trade? *</Label>
              <Input
                placeholder="Describe your item (e.g., iPhone 12 Pro Max 128GB)"
                name="offeredItem"
                required
                className="border-2"
              />
              <p className="text-xs text-gray-500">Be specific about the condition and features of your item</p>
            </div>
          </div>

          {/* Additional Cash */}
          {hasCashRequired && (
            <div className="bg-white rounded-xl border-2 border-gray-200 p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="bg-yellow-500 p-2 rounded-lg">
                  <DollarSign className="w-4 h-4 text-white" />
                </div>
                <h3 className="font-bold text-gray-900">Additional Cash</h3>
              </div>

              <div className="space-y-3 p-4 bg-yellow-50 rounded-lg">
                <p className="text-sm text-gray-700">The seller requires additional cash for this trade</p>
                <div>
                  <Label className="text-sm font-semibold">Cash Amount</Label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    name="cashAdded"
                    className="mt-1.5"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>
            </div>
          )}

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

          {/* Payment Method (only if cash required) */}
          {hasCashRequired && (
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
          )}
        </div>

        {/* Right Column - Trade Info & Summary (shows first on mobile as separate cards, combined sticky column on desktop) */}
        <div className="order-1 lg:order-2 lg:col-span-2">
          <div className="lg:sticky lg:top-6 space-y-4 lg:space-y-5">
            {/* Trade Info */}
            <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl border-2 border-orange-200 p-4 lg:p-5">
              <div className="flex items-center gap-3 mb-3">
                <Repeat className="w-5 h-5 text-orange-600" />
                <span className="text-xs font-bold text-orange-700 uppercase tracking-wide">Trade Exchange</span>
              </div>
              <p className="font-bold text-gray-900 text-base lg:text-lg mb-3 lg:mb-4">{itemTitle}</p>

              <div className="bg-white/70 rounded-lg p-3 space-y-2">
                <div>
                  <span className="text-xs text-gray-600 uppercase tracking-wide">Seller wants</span>
                  <p className="font-semibold text-orange-700 mt-1">{itemTrade}</p>
                </div>

                {hasCashRequired && (
                  <div className="pt-2 border-t border-orange-200">
                    <span className="text-xs text-gray-600 uppercase tracking-wide">Plus Cash</span>
                    <p className="text-lg lg:text-xl font-bold text-orange-600 mt-1">{formatCurrency(itemPrice)}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Trade Summary */}
            <div className="bg-white rounded-xl border-2 border-gray-200 p-4 lg:p-5">
              <div className="flex items-center gap-2 mb-4">
                <Receipt className="w-5 h-5 text-gray-700" />
                <h3 className="font-bold text-gray-900">Trade Summary</h3>
              </div>

              <div className="space-y-3">
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-600 uppercase tracking-wide mb-2">Exchange Details</p>
                  {hasCashRequired ? (
                    <p className="text-sm text-gray-700">
                      You&apos;ll trade your item <span className="font-semibold">+ cash</span> for <span className="font-semibold">{itemTitle}</span>
                    </p>
                  ) : (
                    <p className="text-sm text-gray-700">
                      You&apos;ll trade your item for <span className="font-semibold">{itemTitle}</span>
                    </p>
                  )}
                </div>

                {hasCashRequired && (
                  <div className="border-t-2 pt-3">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-gray-900">Required Cash</span>
                      <span className="text-xl lg:text-2xl font-bold text-orange-600">{formatCurrency(itemPrice)}</span>
                    </div>
                  </div>
                )}

                {!hasCashRequired && (
                  <div className="text-xs text-gray-500 italic bg-gray-50 p-2 rounded">
                    No additional cash required
                  </div>
                )}
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
                  ? "bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-lg"
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
                  Confirm Trade
                </div>
              )}
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
}
