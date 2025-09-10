"use client";

import { useState } from "react";
import { ForSaleForm } from "@/components/forms/ForSaleForm";
import { RentForm } from "@/components/forms/RentForm";
import { TradeForm } from "@/components/forms/TradeForm";
import { EmergencyForm } from "@/components/forms/EmergencyForm";
import { PasaBuyForm } from "@/components/forms/PasaBuyForm";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

export default function OrgAddProduct() {
  const [selectedType, setSelectedType] = useState<string>("");

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-semibold">List a New Product</h1>

      {/* Select Post Type */}
      <div className="space-y-2">
        <label className="text-sm font-medium">
          Select Post Type<span className="text-red-600">*</span>
        </label>
        <Select onValueChange={(value) => setSelectedType(value)}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Choose a post type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Sale">For Sale</SelectItem>
            <SelectItem value="Rent">For Rent</SelectItem>
            <SelectItem value="Trade">For Trade</SelectItem>
            <SelectItem value="Emergency Lending">Emergency Lending</SelectItem>
            <SelectItem value="PasaBuy">PasaBuy</SelectItem>
            <SelectItem value="Giveaway">Giveaway</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Render the right form */}
      <div>
        {selectedType === "Sale" && (
          <ForSaleForm selectedType={selectedType} />
        )}
        {selectedType === "Rent" && (
          <RentForm selectedType={selectedType} />
        )}
        {selectedType === "Trade" && (
          <TradeForm selectedType={selectedType} />
        )}
        {selectedType === "Emergency Lending" && (
          <EmergencyForm selectedType={selectedType} />
        )}
        {selectedType === "PasaBuy" && (
          <PasaBuyForm selectedType={selectedType} />
        )}
        {selectedType === "Giveaway" && (
          <PasaBuyForm selectedType={selectedType} />
        )}
      </div>
    </div>
  );
}
