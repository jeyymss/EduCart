"use client";

import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter, DrawerClose } from "@/components/ui/drawer";
import mapboxgl from "mapbox-gl";
import { useEffect, useRef, useState } from "react";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSave: (lat: number, lng: number) => void;
}

export default function MapDrawerPicker({ open, onOpenChange, onSave }: Props) {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markerRef = useRef<mapboxgl.Marker | null>(null);

  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);

  // Initialize the map on drawer open
  useEffect(() => {
    if (!open) return;

    if (!map.current && mapContainer.current) {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/streets-v12",
        center: [123.194824, 13.623383], // Naga default
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

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="p-0 max-h-screen h-screen">
        <DrawerHeader>
          <DrawerTitle>Select Pickup Location</DrawerTitle>
        </DrawerHeader>

        {/* Fullscreen map */}
        <div ref={mapContainer} className="w-full flex-1 h-full" />

        <DrawerFooter className="flex justify-between gap-3">
          <DrawerClose asChild>
            <button className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">
              Cancel
            </button>
          </DrawerClose>

          <button
            disabled={!lat || !lng}
            onClick={() => {
              if (lat && lng) onSave(lat, lng);
              onOpenChange(false);
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded disabled:bg-gray-400"
          >
            Save Location
          </button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
