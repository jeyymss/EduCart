"use client";

import { useRef, useState, useEffect } from "react";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { PasaBuySubmit } from "@/app/api/formSubmit/pasabuy/route";
import { Plus, Trash2 } from "lucide-react";

interface FormProps {
  selectedType: string;
}

interface PasaBuyItem {
  id: string;
  productName: string;
  price: number;
}

export function PasaBuyForm({ selectedType }: FormProps) {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const formRef = useRef<HTMLFormElement | null>(null);
  const [isFormValid, setIsFormValid] = useState(false);

  // Items list state
  const [items, setItems] = useState<PasaBuyItem[]>([]);
  const [newItemName, setNewItemName] = useState("");
  const [newItemPrice, setNewItemPrice] = useState("");

  useEffect(() => {
    const form = formRef.current;

    const handleValidation = () => {
      const formValid = form?.checkValidity() ?? false;
      const isValid = formValid;

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
  }, []);

  const addItem = () => {
    if (!newItemName.trim() || !newItemPrice.trim()) {
      return;
    }

    const price = parseFloat(newItemPrice);
    if (isNaN(price) || price <= 0) {
      return;
    }

    const newItem: PasaBuyItem = {
      id: Date.now().toString(),
      productName: newItemName.trim(),
      price: price,
    };

    setItems([...items, newItem]);
    setNewItemName("");
    setNewItemPrice("");
  };

  const removeItem = (id: string) => {
    setItems(items.filter((item) => item.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    try {
      setLoading(true);

      const formData = new FormData(e.currentTarget);

      const output = await PasaBuySubmit(formData, selectedType);

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
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-2">
      {/* Title */}
      <Label className="text-sm">
        Title<span className="text-red-600">*</span>
      </Label>
      <Input
        type="text"
        name="itemTitle"
        placeholder="Enter Name"
        className="w-full border border-gray-300 p-2 rounded-md"
        required
      />

      {/* Service Fee */}
      <Label className="text-sm">
        Service Fee<span className="text-red-600">*</span>
      </Label>
      <Input
        type="number"
        name="itemServiceFee"
        placeholder="Enter Service Fee"
        className="w-full border border-gray-300 p-2 rounded-md"
        required
      />

      {/* Items List Section */}
      <div className=" border-gray-200 space-y-2">
        <Label className="text-sm font-semibold">Items to Buy</Label>

        {/* Add Item Form */}
        <div className="space-y-2 mb-3">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Input
                type="text"
                placeholder="Product Name"
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                className="w-full border border-gray-300 p-2 rounded-md text-sm"
              />
            </div>
            <div>
              <Input
                type="number"
                placeholder="Price"
                value={newItemPrice}
                onChange={(e) => setNewItemPrice(e.target.value)}
                min="0"
                step="0.01"
                className="w-full border border-gray-300 p-2 rounded-md text-sm"
              />
            </div>
          </div>
          <Button
            type="button"
            onClick={addItem}
            disabled={!newItemName.trim() || !newItemPrice.trim()}
            className="w-full bg-[#E59E2C] hover:bg-[#d88f1f] text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Item
          </Button>
        </div>

        {/* Items List Display */}
        {items.length > 0 && (
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg p-3"
              >
                <div className="flex-1">
                  <p className="font-medium text-sm text-[#102E4A]">
                    {item.productName}
                  </p>
                  <p className="text-sm text-[#E59E2C] font-semibold">
                    ₱{item.price.toFixed(2)}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeItem(item.id)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
            <div className="pt-2 border-t border-gray-200">
              <p className="text-sm font-semibold text-[#102E4A]">
                Total: ₱
                {items
                  .reduce((sum, item) => sum + item.price, 0)
                  .toFixed(2)}
              </p>
              <p className="text-xs text-gray-500">
                {items.length} item{items.length !== 1 ? "s" : ""} added
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Location */}
      <Label className="text-sm">
        Location<span className="text-red-600">*</span>
      </Label>
      <Input
        type="text"
        name="pasabuyLocation"
        placeholder="Enter Location"
        className="w-full border border-gray-300 p-2 rounded-md"
        required
      />

      {/* Cut Off Date */}
      <Label className="text-sm">
        Cut off Date<span className="text-red-600">*</span>
      </Label>
      <Input
        type="text"
        name="pasabuyCutOffDate"
        placeholder="Enter Cut off Date"
        className="w-full border border-gray-300 p-2 rounded-md"
        required
      />

      

      {/* Description */}
      <Label className="text-sm">
        Description<span className="text-red-600">*</span>
      </Label>
      <textarea
        placeholder="Description"
        name="itemDescription"
        required
        className="w-full border border-gray-300 p-2 rounded-md"
      />

      {/* Error Message */}
      {error && <p className="text-sm text-red-600 text-center">{error}</p>}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={!isFormValid || loading}
        className={`w-full p-2 rounded-md font-semibold transition 
          ${
            isFormValid
              ? "bg-[#C7D9E5] text-[#333333]  hover:text-white hover:bg-[#122C4F] hover:cursor-pointer"
              : "bg-[#DEDEDE] text-[#333333]"
          }
        `}
      >
        Post
      </button>
    </form>
  );
}
