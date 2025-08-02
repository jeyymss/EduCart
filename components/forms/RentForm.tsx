"use client";

import { useState } from "react";
import { ForSale } from "@/app/api/formSubmit/sale/route";
import { useCategories, Category } from "@/hooks/useCategories";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

interface ForSaleFormProps {
  selectedType: string;
}

export function RentForm({ selectedType }: ForSaleFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [condition, setCondition] = useState<string>("");

  const { data: categories, isLoading } = useCategories();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const formData = new FormData(e.currentTarget);

    try {
      setLoading(true);

      const output = await ForSale(
        formData,
        selectedType,
        selectedCategory,
        condition
      );

      setLoading(false);

      if (output?.error) {
        setError(output.error);
      } else {
        window.location.href = "/home";
      }
    } catch (err) {
      console.error(err);
      setError("Submit Failed");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <input
        type="text"
        name="itemTitle"
        placeholder="Item Title"
        className="w-full border border-gray-300 p-2 rounded-md"
      />
      <input
        type="number"
        name="itemPrice"
        placeholder="Price"
        className="w-full border border-gray-300 p-2 rounded-md"
      />
      <textarea
        placeholder="Description"
        name="itemDescription"
        className="w-full border border-gray-300 p-2 rounded-md"
      />
      <input
        type="file"
        name="itemImage"
        accept="image/*"
        multiple
        required
        className="w-full"
      />

      <Select onValueChange={(value) => setSelectedCategory(value)}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select a category" />
        </SelectTrigger>
        <SelectContent>
          {categories?.map((category: Category) => (
            <SelectItem key={category.id} value={category.name}>
              {category.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select onValueChange={setCondition}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select condition" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="New">New</SelectItem>
          <SelectItem value="Used - Like New">Used - Like New</SelectItem>
          <SelectItem value="Used - Very Good">Used - Very Good</SelectItem>
          <SelectItem value="Used - Good">Used - Good</SelectItem>
          <SelectItem value="Used - Acceptable">Used - Acceptable</SelectItem>
        </SelectContent>
      </Select>

      {error && <p className="text-sm text-red-600 text-center">{error}</p>}

      <button
        type="submit"
        className="w-full bg-primary text-white p-2 rounded-md"
        disabled={loading || isLoading}
      >
        Submit For Sale
      </button>
    </form>
  );
}
