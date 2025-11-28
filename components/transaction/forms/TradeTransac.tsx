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

  useEffect(() => {
    const form = formRef.current;

    const handleValidation = () => {
      const formValid = form?.checkValidity() ?? false;
      const isValid = formValid && selectPayment !== "" && selectedType !== "";
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
    }
  };

  return (
    <form className="space-y-3" ref={formRef} onSubmit={handleSubmit}>
      <Label>Item</Label>
      <Input
        value={`${itemTitle} for ₱${itemPrice} + ${itemTrade}`}
        disabled
        name="itemTitle"
      />

      <Label>Price ₱ </Label>
      <Input
        value={itemPrice ? `${itemPrice.toLocaleString()}` : "No additional Cash"}
        disabled
        readOnly
      />

      <Label>Added Cash</Label>
      <Input type="number" placeholder="0.00" name="cashAdded" />

      <Label>Offered Item</Label>
      <Input placeholder="Add your offered item" name="offeredItem" />

      <Label>Preferred Method</Label>
      <Select value={selectedType} onValueChange={setSelectedType}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select Delivery Method" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="Meetup">Meetup</SelectItem>
          <SelectItem value="Delivery">Delivery</SelectItem>
        </SelectContent>
      </Select>

      {selectedType === "Meetup" && (
        <div className="space-y-3">
          <div className="flex flex-col space-y-3 max-w-full">
            <Label>Location</Label>
            <Input placeholder="Location" name="inputLocation" />
          </div>
          <div className="flex justify-between gap-4">
            <div className="space-y-3 w-1/2">
              <Label htmlFor="date">Date</Label>
              <Input
                type="date"
                id="date"
                className="w-full"
                name="inputDate"
              />
            </div>
            <div className="space-y-3 w-1/2">
              <Label htmlFor="time">Time</Label>
              <Input type="time" id="time" step="60" name="inputTime" />
            </div>
          </div>
        </div>
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

      {error && <p className="text-sm text-red-600 text-center">{error}</p>}

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
