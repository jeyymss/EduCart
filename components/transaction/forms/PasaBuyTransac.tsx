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
import { Checkbox } from "@/components/ui/checkbox";
import { PasaBuyTransaction } from "@/app/api/transacForm/PasaBuyTransac/route";
import AddressPickerWithMap from "@/components/location/AddressPickerWithMap";
import { usePasabuyDetails } from "@/hooks/queries/usePasabuyDetailts";
import { createClient } from "@/utils/supabase/client";
import { calculateDeliveryFee } from "@/utils/deliveryFee";
import { getRoadDistanceKm } from "@/utils/getRoadDistance";
import { ShoppingBag, MapPin, Calendar, CreditCard, Truck, Users, Check, AlertCircle, Receipt } from "lucide-react";

interface FormProps {
  conversationId: number;
  itemTitle: string | null;
  itemPrice: number | null;
  sellerId: string;
  post_id: string;
  postType: string;
  onClose?: () => void;
}

export default function PasaBuyTransacForm({
  conversationId,
  itemTitle,
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

  const { data: pasabuyDetails, isLoading: isLoadingDetails } = usePasabuyDetails(post_id);
  const [selectedItems, setSelectedItems] = useState<{[key: string]: boolean}>({});

  const [deliveryLat, setDeliveryLat] = useState<number | null>(null);
  const [deliveryLng, setDeliveryLng] = useState<number | null>(null);
  const [deliveryAddress, setDeliveryAddress] = useState<string>("");
  const [distanceKm, setDistanceKm] = useState<number | null>(null);
  const [deliveryFee, setDeliveryFee] = useState<number | null>(null);

  const itemsTotal = pasabuyDetails?.pasabuy_items
    ?.filter(item => selectedItems[item.id])
    .reduce((sum, item) => sum + item.price, 0) ?? 0;

  const serviceFee = pasabuyDetails?.item_service_fee ?? 0;
  const finalDeliveryFee = selectedType === "Delivery" ? (deliveryFee ?? 0) : 0;
  const totalPrice = itemsTotal + serviceFee + finalDeliveryFee;

  useEffect(() => {
    async function computeFee() {
      if (selectedType !== "Delivery" || deliveryLat === null || deliveryLng === null) return;

      const supabase = createClient();
      const { data: post } = await supabase
        .from("posts")
        .select("pickup_lat, pickup_lng")
        .eq("id", post_id)
        .single();

      if (!post || !post.pickup_lat || !post.pickup_lng) return;

      const km = await getRoadDistanceKm(post.pickup_lat, post.pickup_lng, deliveryLat, deliveryLng);
      const fee = calculateDeliveryFee(km);

      setDistanceKm(km);
      setDeliveryFee(fee);
    }

    computeFee();
  }, [deliveryLat, deliveryLng, selectedType, post_id]);

  useEffect(() => {
    const form = formRef.current;

    const handleValidation = () => {
      const formValid = form?.checkValidity() ?? false;
      const hasSelectedItems = Object.values(selectedItems).some(val => val);
      const deliveryValid = selectedType !== "Delivery" || (deliveryLat !== null && deliveryLng !== null);

      const isValid = formValid && selectPayment !== "" && selectedType !== "" && hasSelectedItems && deliveryValid;
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
  }, [selectPayment, selectedType, selectedItems, deliveryLat, deliveryLng]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    try {
      setLoading(true);
      const formData = new FormData(e.currentTarget);

      const selectedItemsList = pasabuyDetails?.pasabuy_items?.filter(item => selectedItems[item.id]) ?? [];

      formData.append("selectedItems", JSON.stringify(selectedItemsList));
      formData.append("itemsTotal", itemsTotal.toString());
      formData.append("serviceFee", serviceFee.toString());
      formData.append("totalPrice", totalPrice.toString());

      const result = await PasaBuyTransaction(
        formData,
        conversationId,
        totalPrice,
        itemTitle,
        selectedType,
        selectPayment,
        sellerId,
        post_id,
        postType,
        deliveryLat,
        deliveryLng,
        deliveryAddress,
        finalDeliveryFee,
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

  const toggleItem = (itemId: string) => {
    setSelectedItems(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };

  if (isLoadingDetails) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center space-y-3">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto"></div>
          <p className="text-gray-600 font-medium">Loading PasaBuy details...</p>
        </div>
      </div>
    );
  }

  const selectedItemsCount = Object.values(selectedItems).filter(val => val).length;

  return (
    <form ref={formRef} onSubmit={handleSubmit}>
      <div className="flex flex-col lg:grid lg:grid-cols-5 gap-4 lg:gap-6">
        {/* Form Inputs - Shows second on mobile, left column on desktop */}
        <div className="order-2 lg:order-1 lg:col-span-3 space-y-4 lg:space-y-5">
          {/* Items Selection */}
          <div className="bg-white rounded-xl border-2 border-gray-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="bg-amber-500 p-2 rounded-lg">
                  <ShoppingBag className="w-4 h-4 text-white" />
                </div>
                <h3 className="font-bold text-gray-900">Select Items</h3>
              </div>
              {selectedItemsCount > 0 && (
                <span className="bg-amber-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                  {selectedItemsCount} selected
                </span>
              )}
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto">
              {pasabuyDetails?.pasabuy_items && pasabuyDetails.pasabuy_items.length > 0 ? (
                pasabuyDetails.pasabuy_items.map((item) => (
                  <div
                    key={item.id}
                    className={`flex items-center justify-between p-3 rounded-lg border-2 transition-all ${
                      selectedItems[item.id]
                        ? "border-amber-400 bg-amber-50"
                        : "border-gray-200 hover:border-amber-300"
                    }`}
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <Checkbox
                        id={`item-${item.id}`}
                        checked={selectedItems[item.id] || false}
                        onCheckedChange={() => toggleItem(item.id)}
                      />
                      <label htmlFor={`item-${item.id}`} className="text-sm font-medium cursor-pointer flex-1">
                        {item.product_name}
                      </label>
                    </div>
                    <span className="text-sm font-bold text-amber-600">₱{item.price.toFixed(2)}</span>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">No items available</p>
                </div>
              )}
            </div>
          </div>

          {/* Fulfillment Method */}
          <div className="bg-white rounded-xl border-2 border-gray-200 p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-blue-500 p-2 rounded-lg">
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

            {/* Meetup Details */}
            {selectedType === "Meetup" && (
              <div className="mt-4 space-y-3 p-4 bg-purple-50 rounded-lg">
                <div>
                  <Label className="text-sm font-semibold">Location *</Label>
                  <Input placeholder="e.g., Starbucks SM Mall" name="inputLocation" required className="mt-1.5" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-sm font-semibold">Date *</Label>
                    <Input type="date" name="inputDate" required className="mt-1.5" />
                  </div>
                  <div>
                    <Label className="text-sm font-semibold">Time *</Label>
                    <Input type="time" name="inputTime" required className="mt-1.5" />
                  </div>
                </div>
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

        {/* Right Column - Service Info & Summary (shows first on mobile as separate cards, combined sticky column on desktop) */}
        <div className="order-1 lg:order-2 lg:col-span-2">
          <div className="lg:sticky lg:top-6 space-y-4 lg:space-y-5">
            {/* Service Info */}
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl border-2 border-amber-200 p-4 lg:p-5">
              <div className="flex items-center gap-3 mb-3">
                <ShoppingBag className="w-5 h-5 text-amber-600" />
                <span className="text-xs font-bold text-amber-700 uppercase tracking-wide">PasaBuy Service</span>
              </div>
              <p className="font-bold text-gray-900 text-base lg:text-lg">{itemTitle}</p>
            </div>

            {/* Order Summary */}
            {selectedItemsCount > 0 && (
              <div className="bg-white rounded-xl border-2 border-gray-200 p-4 lg:p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Receipt className="w-5 h-5 text-gray-700" />
                  <h3 className="font-bold text-gray-900">Order Summary</h3>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Items ({selectedItemsCount})</span>
                    <span className="font-semibold">{formatCurrency(itemsTotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Service Fee</span>
                    <span className="font-semibold">{formatCurrency(serviceFee)}</span>
                  </div>
                  {selectedType === "Delivery" && deliveryFee !== null && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Delivery Fee</span>
                      <span className="font-semibold">{formatCurrency(deliveryFee)}</span>
                    </div>
                  )}
                  <div className="border-t-2 pt-3">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-gray-900">Total</span>
                      <span className="text-xl lg:text-2xl font-bold text-amber-600">{formatCurrency(totalPrice)}</span>
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
                  ? "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg"
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
                  Confirm Order
                </div>
              )}
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
}
