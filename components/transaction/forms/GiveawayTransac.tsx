"use client";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState, useEffect, useRef } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { GiveawayTransaction } from "@/app/api/transacForm/GivewayTransac/route";
import AddressPickerWithMap from "@/components/location/AddressPickerWithMap";

interface FormProps {
  conversationId: number;
  itemTitle: string | null;
  sellerId: string;
  post_id: string;
  postType: string;
  onClose?: () => void;
}

export default function GiveawayTransacForm({
  conversationId,
  itemTitle,
  sellerId,
  post_id,
  postType,
  onClose,
}: FormProps) {
  const formRef = useRef<HTMLFormElement | null>(null);

  const [isFormValid, setIsFormValid] = useState(false);
  const [selectedType, setSelectedType] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Meetup states
  const [meetLocation, setMeetLocation] = useState("");
  const [meetDate, setMeetDate] = useState("");
  const [meetTime, setMeetTime] = useState("");

  // Delivery states
  const [deliveryLat, setDeliveryLat] = useState<number | null>(null);
  const [deliveryLng, setDeliveryLng] = useState<number | null>(null);
  const [deliveryAddress, setDeliveryAddress] = useState("");

  const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0];

  // -------------------------------
  // VALIDATION LOGIC
  // -------------------------------
  useEffect(() => {
    let valid = false;

    if (selectedType === "Meetup") {
      valid =
        meetLocation.trim() !== "" &&
        meetDate !== "" &&
        meetTime !== "";
    }

    if (selectedType === "Delivery") {
      valid = deliveryAddress.trim() !== "" && deliveryLat !== null;
    }

    setIsFormValid(valid);
  }, [
    selectedType,
    meetLocation,
    meetDate,
    meetTime,
    deliveryLat,
    deliveryLng,
    deliveryAddress,
  ]);

  // -------------------------------
  // SUBMIT HANDLER
  // -------------------------------
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("selectedType", selectedType);

      // meetup
      formData.append("meetLocation", meetLocation);
      formData.append("meetDate", meetDate);
      formData.append("meetTime", meetTime);

      // delivery
      formData.append("deliveryAddress", deliveryAddress);
      formData.append("deliveryLat", deliveryLat?.toString() ?? "");
      formData.append("deliveryLng", deliveryLng?.toString() ?? "");

      const result = await GiveawayTransaction(
        formData,
        conversationId,
        itemTitle,
        sellerId,
        post_id,
        postType
      );

      setLoading(false);

      if ("error" in result) {
        setError(result.error);
    } else if (result.success) {
        onClose?.();
    }

    } catch (err) {
      console.error(err);
      setError("Submit Failed");
      setLoading(false);
    }
  };

  return (
    <form className="space-y-3" ref={formRef} onSubmit={handleSubmit}>
      {/* ITEM TITLE */}
      <Label>Item</Label>
      <Input value={itemTitle ?? ""} readOnly />

      {/* PREFERRED METHOD */}
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

      {/* ----------------------------------------- */}
      {/* MEETUP SECTION */}
      {/* ----------------------------------------- */}
      {selectedType === "Meetup" && (
        <>
          <Label>Meetup Location</Label>
          <Input
            placeholder="Location"
            value={meetLocation}
            onChange={(e) => setMeetLocation(e.target.value)}
          />

          <div className="flex justify-between gap-4">
            <div className="space-y-2 w-1/2">
              <Label>Date</Label>
              <Input
                type="date"
                min={tomorrow}
                value={meetDate}
                onChange={(e) => setMeetDate(e.target.value)}
              />
            </div>

            <div className="space-y-2 w-1/2">
              <Label>Time</Label>
              <Input
                type="time"
                step="60"
                value={meetTime}
                onChange={(e) => setMeetTime(e.target.value)}
              />
            </div>
          </div>
        </>
      )}

      {/* ----------------------------------------- */}
      {/* DELIVERY SECTION */}
      {/* ----------------------------------------- */}
      {selectedType === "Delivery" && (
        <>
          <Label>
            Delivery Address <span className="text-red-500">*</span>
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
            className="bg-gray-100"
            placeholder="Selected address will appear here"
            value={deliveryAddress}
          />
        </>
      )}

      {/* ERROR MESSAGE */}
      {error && <p className="text-sm text-red-600 text-center">{error}</p>}

      {/* SUBMIT BUTTON */}
      <Button
        type="submit"
        disabled={!isFormValid || loading}
        className="w-full"
      >
        {loading ? "Submitting..." : "Confirm"}
      </Button>
    </form>
  );
}
