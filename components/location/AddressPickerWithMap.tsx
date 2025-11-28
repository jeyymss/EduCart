"use client";

import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
// @ts-expect-error MapboxGeocoder has no TypeScript types
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

  // Reverse geocode coordinates → readable address
  const reverseGeocode = async (lat: number, lng: number) => {
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${mapboxgl.accessToken}`;
    const res = await fetch(url);
    const data = await res.json();
    return data.features?.[0]?.place_name || "Selected Location";
  };

  const setMarkerAt = async (lat: number, lng: number) => {
    // Remove existing marker
    if (marker.current) marker.current.remove();

    marker.current = new mapboxgl.Marker({
      color: "red",
      draggable: true,
    })
      .setLngLat([lng, lat])
      .addTo(map.current!);

    map.current?.flyTo({
      center: [lng, lat],
      zoom: 15,
    });

    // Update when user drags marker
    marker.current.on("dragend", async () => {
      const { lat: newLat, lng: newLng } = marker.current!.getLngLat();
      const address = await reverseGeocode(newLat, newLng);
      onSelect(newLat, newLng, address);
    });

    // Initial reverse geocode
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

    // Initialize map
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [123.194824, 13.623383],
      zoom: 13,
    });

    // Geocoder Search Bar
    const geocoder = new MapboxGeocoder({
      accessToken: mapboxgl.accessToken,
      placeholder: "Search pickup address...",
      mapboxgl,
      marker: false,
    });

    geocoderContainer.current!.innerHTML = "";
    geocoderContainer.current?.appendChild(geocoder.onAdd(map.current));

    // When user selects from search
    geocoder.on("result", async (e: any) => {
      const [lng, lat] = e.result.geometry.coordinates;
      await setMarkerAt(lat, lng);
    });
  }, []);

  return (
    <div className="space-y-2 w-full">

      {/* Search bar */}
      <div ref={geocoderContainer} className="w-full mb-1" />

      {/* Use Current Location Button */}
      <button
        type="button"
        onClick={handleUseCurrentLocation}
        className="text-sm px-3 py-2 w-full bg-blue-100 border border-blue-400 text-blue-700 rounded-md hover:bg-blue-200 hover:cursor-pointer"
      >
        📍 Use My Current Location
      </button>

      {/* Map */}
      <div
        ref={mapContainer}
        className="w-full h-64 rounded-lg border overflow-hidden"
      />
    </div>
  );
}
