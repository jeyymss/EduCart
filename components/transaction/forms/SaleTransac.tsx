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
import { SaleTransaction } from "@/app/api/transacForm/SaleTransac/route";
import AddressPickerWithMap from "@/components/location/AddressPickerWithMap";
import { createClient } from "@/utils/supabase/client";
import { calculateDeliveryFee } from "@/utils/deliveryFee";
import { getRoadDistanceKm } from "@/utils/getRoadDistance";
import { ShoppingCart, MapPin, CreditCard, Truck, Users, Check, AlertCircle, Tag, TrendingDown, Receipt } from "lucide-react";

interface FormProps {
  conversationId: number;
  itemTitle: string | null;
  itemPrice: number | null;
  sellerId: string;
  post_id: string;
  postType: string;
  onClose?: () => void;
  acceptedOfferPrice?: number | null;
}

export default function SaleTransacForm({
  conversationId,
  itemTitle,
  itemPrice,
  sellerId,
  post_id,
  postType,
  onClose,
  acceptedOfferPrice,
}: FormProps) {
  const finalPrice = acceptedOfferPrice ?? itemPrice;
  const formRef = useRef<HTMLFormElement | null>(null);
  const [isFormValid, setIsFormValid] = useState(false);
  const [selectedType, setSelectedType] = useState("");
  const [selectPayment, setSelectPayment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [deliveryLat, setDeliveryLat] = useState<number | null>(null);
  const [deliveryLng, setDeliveryLng] = useState<number | null>(null);
  const [deliveryAddress, setDeliveryAddress] = useState<string>("");
  const [distanceKm, setDistanceKm] = useState<number | null>(null);
  const [deliveryFee, setDeliveryFee] = useState<number | null>(null);

  useEffect(() => {
    const form = formRef.current;

    const handleValidation = () => {
      const formValid = form?.checkValidity() ?? false;
      const valid =
        formValid &&
        selectPayment !== "" &&
        selectedType !== "" &&
        (selectedType !== "Delivery" || (deliveryLat !== null && deliveryLng !== null));

      setIsFormValid(valid);
    };

    if (form) {
      form.addEventListener("input", handleValidation);
    }

    handleValidation();

    return () => {
      form?.removeEventListener("input", handleValidation);
    };
  }, [selectedType, selectPayment, deliveryLat, deliveryLng]);

  useEffect(() => {
    async function computeFee() {
      if (selectedType !== "Delivery" || deliveryLat === null || deliveryLng === null) return;

      const supabase = createClient();
      const { data: post } = await supabase
        .from("posts")
        .select("pickup_lat, pickup_lng")
        .eq("id", post_id)
        .single();

      if (!post) return;

      const km = await getRoadDistanceKm(post.pickup_lat, post.pickup_lng, deliveryLat, deliveryLng);
      const fee = calculateDeliveryFee(km);

      setDistanceKm(km);
      setDeliveryFee(fee);
    }

    computeFee();
  }, [deliveryLat, deliveryLng, selectedType, post_id]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    try {
      setLoading(true);
      const formData = new FormData(e.currentTarget);

      const result = await SaleTransaction(
        formData,
        conversationId,
        finalPrice,
        itemTitle,
        selectedType,
        selectPayment,
        sellerId,
        post_id,
        postType,
        deliveryLat,
        deliveryLng,
        deliveryAddress,
        deliveryFee,
        distanceKm
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

  const formatCurrency = (v?: number | null) => v != null ? `₱${v.toLocaleString()}` : "—";

  const totalPrice = selectedType === "Delivery" && deliveryFee !== null
    ? (finalPrice ?? 0) + deliveryFee
    : finalPrice;

  return (
    <form ref={formRef} onSubmit={handleSubmit}>
      <div className="flex flex-col lg:grid lg:grid-cols-5 gap-4 lg:gap-6">
        {/* Form Inputs - Shows second on mobile, left column on desktop */}
        <div className="order-2 lg:order-1 lg:col-span-3 space-y-4 lg:space-y-5">
          {/* Fulfillment Method */}
          <div className="bg-white rounded-xl border-2 border-gray-200 p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-purple-500 p-2 rounded-lg">
                <Truck className="w-4 h-4 text-white" />
              </div>
              <h3 className="font-bold text-gray-900">Fulfillment Method</h3>
            </div>

            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-full h-11 border-2">
                <SelectValue placeholder="Choose delivery or meetup" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Meetup">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    <span>Meetup</span>
                  </div>
                </SelectItem>
                <SelectItem value="Delivery">
                  <div className="flex items-center gap-2">
                    <Truck className="w-4 h-4" />
                    <span>Delivery</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>

            {/* Delivery Details */}
            {selectedType === "Delivery" && (
              <div className="mt-4 space-y-3 p-4 bg-blue-50 rounded-lg">
                <Label className="text-sm font-semibold">Delivery Location *</Label>
                <p className="text-xs text-gray-600">Pin your exact delivery address</p>
                <AddressPickerWithMap
                  onSelect={(lat, lng, addr) => {
                    setDeliveryLat(lat);
                    setDeliveryLng(lng);
                    setDeliveryAddress(addr);
                  }}
                />
                <Input
                  readOnly
                  value={deliveryAddress}
                  placeholder="Selected address will appear here"
                  className="bg-white"
                />
                {deliveryFee !== null && distanceKm !== null && (
                  <div className="bg-blue-100 rounded-lg p-3 text-sm">
                    <div className="flex justify-between mb-1">
                      <span>Distance:</span>
                      <span className="font-semibold">{distanceKm.toFixed(2)} km</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Delivery Fee:</span>
                      <span className="font-semibold">{formatCurrency(deliveryFee)}</span>
                    </div>
                  </div>
                )}
              </div>
            )}
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
                {selectedType === "Meetup" ? (
                  <>
                    <SelectItem value="Cash on Hand">💵 Cash on Hand</SelectItem>
                    <SelectItem value="Online Payment">💳 Online Payment</SelectItem>
                  </>
                ) : (
                  <SelectItem value="Online Payment">💳 Online Payment</SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Right Column - Item Info & Summary (shows first on mobile as separate cards, combined sticky column on desktop) */}
        <div className="order-1 lg:order-2 lg:col-span-2">
          <div className="lg:sticky lg:top-6 space-y-4 lg:space-y-5">
            {/* Item Info */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-200 p-4 lg:p-5">
              <div className="flex items-center gap-3 mb-3">
                <ShoppingCart className="w-5 h-5 text-blue-600" />
                <span className="text-xs font-bold text-blue-700 uppercase tracking-wide">Item for Purchase</span>
              </div>
              <p className="font-bold text-gray-900 text-base lg:text-lg mb-3 lg:mb-4">{itemTitle}</p>

              <div className="bg-white/70 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Item Price</span>
                  <span className="text-lg lg:text-xl font-bold text-green-600">{formatCurrency(finalPrice)}</span>
                </div>

                {acceptedOfferPrice && itemPrice && acceptedOfferPrice !== itemPrice && (
                  <div className="mt-2 pt-2 border-t flex items-center gap-2 text-xs">
                    <TrendingDown className="w-3.5 h-3.5 text-orange-500" />
                    <span className="text-gray-500">
                      Original: <span className="line-through">₱{itemPrice.toLocaleString()}</span>
                    </span>
                    <span className="text-orange-600 font-semibold">Offer accepted!</span>
                  </div>
                )}
              </div>
            </div>

            {/* Order Summary */}
            {selectedType && (
              <div className="bg-white rounded-xl border-2 border-gray-200 p-4 lg:p-5 order-3 lg:order-none">
                <div className="flex items-center gap-2 mb-4">
                  <Receipt className="w-5 h-5 text-gray-700" />
                  <h3 className="font-bold text-gray-900">Order Summary</h3>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Item Price</span>
                    <span className="font-semibold">{formatCurrency(finalPrice)}</span>
                  </div>

                  {selectedType === "Delivery" && deliveryFee !== null && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Delivery Fee</span>
                      <span className="font-semibold">{formatCurrency(deliveryFee)}</span>
                    </div>
                  )}

                  {selectedType === "Meetup" && (
                    <div className="text-xs text-gray-500 italic bg-gray-50 p-2 rounded">
                      No delivery fees for meetup
                    </div>
                  )}

                  <div className="border-t-2 pt-3">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-gray-900">Total</span>
                      <span className="text-xl lg:text-2xl font-bold text-blue-600">{formatCurrency(totalPrice)}</span>
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
                  ? "bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white shadow-lg"
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
                  Confirm Purchase
                </div>
              )}
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
}
