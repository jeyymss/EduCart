"use client";

import { useEffect, useState } from "react";
import { calculateDistanceKm, calculateDeliveryFee } from "@/utils/deliveryFee";
import { createClient } from "@/utils/supabase/client";

interface Props {
  postId: string;
  buyerLat: number;
  buyerLng: number;
  onFeeComputed?: (fee: number, distanceKm: number) => void;
}

export default function DeliveryFeeCalculator({ 
  postId, 
  buyerLat, 
  buyerLng,
  onFeeComputed
}: Props) {

  const supabase = createClient();

  const [sellerLat, setSellerLat] = useState<number | null>(null);
  const [sellerLng, setSellerLng] = useState<number | null>(null);
  const [distanceKm, setDistanceKm] = useState<number | null>(null);
  const [deliveryFee, setDeliveryFee] = useState<number | null>(null);

  useEffect(() => {
    const fetchSellerLocation = async () => {
      const { data, error } = await supabase
        .from("posts")
        .select("pickup_lat, pickup_lng")
        .eq("id", postId)
        .single();

      if (data) {
        setSellerLat(data.pickup_lat);
        setSellerLng(data.pickup_lng);
      }
    };

    fetchSellerLocation();
  }, [postId]);

  useEffect(() => {
    if (sellerLat && sellerLng && buyerLat && buyerLng) {
      const distance = calculateDistanceKm(sellerLat, sellerLng, buyerLat, buyerLng);
      const fee = calculateDeliveryFee(distance);

      setDistanceKm(distance);
      setDeliveryFee(fee);

      if (onFeeComputed) {
        onFeeComputed(fee, distance);
      }
    }
  }, [sellerLat, sellerLng, buyerLat, buyerLng]);

  if (deliveryFee === null) return <p>Calculating delivery fee...</p>;

  return (
    <div className="p-4 border rounded-md bg-gray-50">
      <p className="font-medium">🚚 Delivery Details</p>
      <p><strong>Distance:</strong> {distanceKm?.toFixed(2)} km</p>
      <p><strong>Delivery Fee:</strong> ₱{deliveryFee}</p>
    </div>
  );
}
