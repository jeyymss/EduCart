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

interface FormProps {
  conversationId: number;
  itemTitle: string | null;
  itemPrice: number | null;
  sellerId: string;
  post_id: string;
  postType: string;
  onClose?: () => void;
}

export default function SaleTransacForm({
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

  // map picker
  const [deliveryLat, setDeliveryLat] = useState<number | null>(null);
  const [deliveryLng, setDeliveryLng] = useState<number | null>(null);
  const [deliveryAddress, setDeliveryAddress] = useState<string>("");

  // NEW: Delivery Fee States
  const [distanceKm, setDistanceKm] = useState<number | null>(null);
  const [deliveryFee, setDeliveryFee] = useState<number | null>(null);

  // validate form
  useEffect(() => {
    const form = formRef.current;

    const handleValidation = () => {
      const formValid = form?.checkValidity() ?? false;
      const valid =
        formValid &&
        selectPayment !== "" &&
        selectedType !== "" &&
        (selectedType !== "Delivery" ||
          (deliveryLat !== null && deliveryLng !== null));

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

  //Calculate delivery fee when a delivery address is selected
  useEffect(() => {
    async function computeFee() {
      if (
        selectedType !== "Delivery" ||
        deliveryLat === null ||
        deliveryLng === null
      )
        return;

      const supabase = createClient();
      const { data: post } = await supabase
        .from("posts")
        .select("pickup_lat, pickup_lng")
        .eq("id", post_id)
        .single();

      if (!post) return;

      const km = await getRoadDistanceKm(
        post.pickup_lat,
        post.pickup_lng,
        deliveryLat,
        deliveryLng
      );

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
        itemPrice,
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
    }
  };

  const formatCurrency = (v?: number | null) =>
  v != null ? `₱${v.toLocaleString()}` : "—";

  return (
    <form className="space-y-3" ref={formRef} onSubmit={handleSubmit}>
      <Label>Item</Label>
      <Input value={itemTitle ?? ""} readOnly name="itemTitle" />
      <Label>Price ₱ </Label>
      <Input value={itemPrice ?? ""} readOnly />

      <Label>Preferred Method</Label>
      <Select value={selectedType} onValueChange={setSelectedType}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Delivery or Meetup" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="Meetup">Meetup</SelectItem>
          <SelectItem value="Delivery">Delivery</SelectItem>
        </SelectContent>
      </Select>

      {/* DELIVERY SECTION */}
      {selectedType === "Delivery" && (
        <>
          <Label>
            Delivery Location <span className="text-red-500">*</span>
          </Label>

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
            className="bg-gray-100"
          />

          {/* SHOW DELIVERY FEE + DISTANCE */}
          {deliveryFee !== null && (
            <div className="p-3 border rounded-lg bg-gray-50 mt-3">
              <p className="text-sm">
                <strong>Distance:</strong> {distanceKm?.toFixed(2)} km
              </p>
              <p className="text-sm">
                <strong>Delivery Fee:</strong> {formatCurrency(deliveryFee)}
              </p>
            </div>
          )}
        </>
      )}

      <Label>Payment Method</Label>
      <Select value={selectPayment} onValueChange={setSelectPayment}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select Payment Method" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="Cash on Hand">Cash on Hand</SelectItem>
          <SelectItem value="Online Payment">Online Payment</SelectItem>
        </SelectContent>
      </Select>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <Button type="submit" disabled={!isFormValid || loading} className="w-full">
        {loading ? "Submitting..." : "Confirm"}
      </Button>
    </form>
  );
}
