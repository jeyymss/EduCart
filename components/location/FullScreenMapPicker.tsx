"use client";

import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: (lat: number, lng: number) => void;
}

export default function FullScreenMapPicker({ open, onClose, onSave }: Props) {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markerRef = useRef<mapboxgl.Marker | null>(null);

  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);

  useEffect(() => {
    if (!open) return;

    if (!map.current && mapContainer.current) {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/streets-v12",
        center: [123.194824, 13.623383],
        zoom: 13,
      });

      map.current.on("click", (e) => {
        const latitude = e.lngLat.lat;
        const longitude = e.lngLat.lng;

        if (markerRef.current) markerRef.current.remove();

        markerRef.current = new mapboxgl.Marker({ color: "red" })
          .setLngLat([longitude, latitude])
          .addTo(map.current!);

        setLat(latitude);
        setLng(longitude);
      });
    }
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="
        fixed inset-0 
        z-[999999] 
        bg-white 
        flex flex-col 
        w-screen 
        h-screen 
        m-0 
        p-0 
        overflow-hidden
      "
    >
      {/* MAP FULLSCREEN */}
      <div ref={mapContainer} className="flex-1 w-full h-full" />

      {/* ACTION BAR */}
      <div className="w-full p-4 bg-white border-t flex justify-between">
        <button
          onClick={onClose}
          className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
        >
          Cancel
        </button>

        <button
          disabled={!lat || !lng}
          onClick={() => {
            if (lat && lng) onSave(lat, lng);
            onClose();
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded disabled:bg-gray-400"
        >
          Save Location
        </button>
      </div>
    </div>
  );
}
