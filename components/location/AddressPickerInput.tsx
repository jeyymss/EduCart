"use client";

import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
// @ts-expect-error No TS types
import MapboxGeocoder from "@mapbox/mapbox-gl-geocoder";

import "@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;

interface Props {
  onSelect: (address: string) => void;
  placeholder?: string;
}

export default function AddressPickerInput({ onSelect, placeholder = "Search location..." }: Props) {
  const geocoderContainer = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!geocoderContainer.current) return;

    const geocoder = new MapboxGeocoder({
      accessToken: mapboxgl.accessToken,
      placeholder: placeholder,
      marker: false,
      mapboxgl: null, // No map
    });

    geocoderContainer.current.innerHTML = "";
    geocoderContainer.current?.appendChild(geocoder.onAdd());

    geocoder.on("result", (e: any) => {
      const address = e.result.place_name;
      onSelect(address);
    });

    // Style the geocoder input
    const interval = setInterval(() => {
      const input = geocoderContainer.current?.querySelector<HTMLInputElement>(
        ".mapboxgl-ctrl-geocoder--input"
      );
      if (input) {
        input.style.height = "42px";
        input.style.fontSize = "14px";
        input.style.borderRadius = "0.375rem";
        input.style.border = "1px solid #d1d5db";
        clearInterval(interval);
      }
    }, 100);

    return () => {
      clearInterval(interval);
      geocoder.clear();
    };
  }, [onSelect, placeholder]);

  return (
    <div className="geocoder-wrapper w-full">
      <div ref={geocoderContainer} className="w-full" />
    </div>
  );
}
