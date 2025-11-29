"use client";

import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
// @ts-expect-error No TS types
import MapboxGeocoder from "@mapbox/mapbox-gl-geocoder";

import "mapbox-gl/dist/mapbox-gl.css";
import "@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;

interface Props {
  onSelect: (lat: number, lng: number, address: string) => void;
}

export default function AddressPickerWithMap({ onSelect }: Props) {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const geocoderContainer = useRef<HTMLDivElement | null>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const marker = useRef<mapboxgl.Marker | null>(null);

  // Reverse geocode
  const reverseGeocode = async (lat: number, lng: number) => {
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${mapboxgl.accessToken}`;
    const res = await fetch(url);
    const data = await res.json();
    return data.features?.[0]?.place_name || "Selected Location";
  };

  const setMarkerAt = async (lat: number, lng: number) => {
    if (marker.current) marker.current.remove();

    marker.current = new mapboxgl.Marker({
      color: "#d10000",
      draggable: true,
    })
      .setLngLat([lng, lat])
      .addTo(map.current!);

    map.current?.flyTo({
      center: [lng, lat],
      zoom: 15,
      speed: 1,
    });

    marker.current.on("dragend", async () => {
      const { lat: newLat, lng: newLng } = marker.current!.getLngLat();
      const address = await reverseGeocode(newLat, newLng);
      onSelect(newLat, newLng, address);
    });

    const address = await reverseGeocode(lat, lng);
    onSelect(lat, lng, address);
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation not supported.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setMarkerAt(lat, lng);
      },
      () => alert("Failed to get your location."),
      { enableHighAccuracy: true }
    );
  };

  useEffect(() => {
    if (!mapContainer.current) return;

    // Init map
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [123.194824, 13.623383],
      zoom: 13,
    });

    const geocoder = new MapboxGeocoder({
      accessToken: mapboxgl.accessToken,
      placeholder: "Search pickup address...",
      mapboxgl,
      marker: false,
    });

    geocoderContainer.current!.innerHTML = "";
    geocoderContainer.current?.appendChild(geocoder.onAdd(map.current));

    geocoder.on("result", async (e: any) => {
      const [lng, lat] = e.result.geometry.coordinates;
      await setMarkerAt(lat, lng);
    });

    const interval = setInterval(() => {
      const wrapper = document.querySelector(".mapboxgl-ctrl-geocoder") as HTMLElement;
      const input = document.querySelector(".mapboxgl-ctrl-geocoder input") as HTMLElement;

      if (wrapper && input) {
        wrapper.style.border = "1px solid #d1d5db"; // gray-300
        wrapper.style.borderRadius = "12px";
        wrapper.style.boxShadow = "0 1px 2px rgba(0,0,0,0.05)";
        wrapper.style.padding = "2px 6px";
        wrapper.style.background = "white";
        wrapper.style.width = "100%";

        // Remove Mapbox’s dotted outline
        input.style.outline = "none";
        input.style.boxShadow = "none";
        input.style.border = "none";
        input.style.background = "transparent";
        input.style.borderRadius = "12px";

        // On focus → keep nice clean border & no dotted outline
        input.addEventListener("focus", () => {
          wrapper.style.border = "1px solid #5b8bd4"; // soft blue
          wrapper.style.boxShadow = "0 0 0 3px rgba(87, 138, 255, 0.25)";
        });

        input.addEventListener("blur", () => {
          wrapper.style.border = "1px solid #d1d5db";
          wrapper.style.boxShadow = "0 1px 2px rgba(0,0,0,0.05)";
        });

        clearInterval(interval);
      }
    }, 50);
  }, []);

  return (
    <div className="space-y-3 w-full">

      {/* Search bar */}
      <div ref={geocoderContainer} className="w-full geocoder-wrapper" />

      {/* Use current location button */}
      <button
        type="button"
        onClick={handleUseCurrentLocation}
        className="
          text-sm 
          w-full 
          py-2 
          rounded-md 
          bg-blue-100 
          text-blue-700 
          border 
          border-blue-300 
          transition 
          hover:bg-blue-200 
          flex 
          items-center 
          justify-center 
          gap-1
        "
      >
        📍 Use My Current Location
      </button>

      {/* Map */}
      <div
        ref={mapContainer}
        className="
          w-full 
          h-64 
          rounded-lg 
          border 
          border-gray-300 
          shadow-sm
        "
      />
    </div>
  );
}
