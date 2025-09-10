"use client";

import { useRef, useState, useEffect } from "react";
import { ForSale } from "@/app/api/formSubmit/sale/route";
import { useCategories, Category } from "@/hooks/queries/useCategories";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import ImageUploader from "../posts/ImageUpload";
import { Info } from "lucide-react"; // for alert icon

interface FormProps {
  remainingPosts?: number; // pass this in if you want dynamic "Remaining Post"
}

export function OrgForSaleForm({ remainingPosts = 3 }: FormProps) {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [condition, setCondition] = useState<string>("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const formRef = useRef<HTMLFormElement | null>(null);
  const [isFormValid, setIsFormValid] = useState(false);

  const { data: categories, isLoading } = useCategories();

  useEffect(() => {
    const form = formRef.current;

    const handleValidation = () => {
      const formValid = form?.checkValidity() ?? false;
      const isValid =
        formValid &&
        selectedFiles.length > 0 &&
        condition !== "" &&
        selectedCategory !== "";

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
  }, [selectedFiles, condition, selectedCategory]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!condition) {
      setError("Select Condition");
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData(e.currentTarget);

      formData.delete("itemImage");
      selectedFiles.forEach((file) => {
        formData.append("itemImage", file);
      });

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
    <div className="bg-white shadow rounded-xl p-6 border border-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-[#333333] flex items-center gap-2">
          🛒 Post Item for Sale
        </h1>
        <span className="text-sm bg-gray-100 px-3 py-1 rounded-full">
          Remaining Post:{" "}
          <span className="text-red-600 font-semibold">{remainingPosts}</span>
        </span>
      </div>

      {/* Info Alert */}
      <div className="flex items-start gap-2 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-md p-3 mb-6">
        <Info className="w-5 h-5 mt-0.5" />
        <p className="text-sm">
          Selling is for items you no longer need but others might find useful.
          Please include accurate details, set a fair price, and upload clear
          photos to attract more buyers.
        </p>
      </div>

      <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
        {/* Item Name */}
        <div>
          <Label className="text-sm font-medium">
            What are you selling?<span className="text-red-600">*</span>
          </Label>
          <Input
            type="text"
            name="itemTitle"
            placeholder="e.g., iPhone 13, Mountain Bike, Calculus Text"
            className="w-full border border-gray-300 p-2 rounded-md mt-1"
            required
          />
        </div>

        {/* Description */}
        <div>
          <Label className="text-sm font-medium">
            Description<span className="text-red-600">*</span>
          </Label>
          <textarea
            placeholder="Describe your item's condition, features, and any other relevant details..."
            name="itemDescription"
            required
            className="w-full border border-gray-300 p-2 rounded-md mt-1 h-24 resize-none"
          />
        </div>

        {/* Price + Condition */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label className="text-sm font-medium">
              Price (₱)<span className="text-red-600">*</span>
            </Label>
            <Input
              type="number"
              name="itemPrice"
              placeholder="0"
              className="w-full border border-gray-300 p-2 rounded-md mt-1"
              required
            />
          </div>
          <div>
            <Label className="text-sm font-medium">
              Item Condition<span className="text-red-600">*</span>
            </Label>
            <Select onValueChange={setCondition}>
              <SelectTrigger className="w-full mt-1">
                <SelectValue placeholder="Select Condition" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="New">New</SelectItem>
                <SelectItem value="Used - Like New">Used - Like New</SelectItem>
                <SelectItem value="Used - Very Good">Used - Very Good</SelectItem>
                <SelectItem value="Used - Good">Used - Good</SelectItem>
                <SelectItem value="Used - Acceptable">Used - Acceptable</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Category */}
        <div>
          <Label className="text-sm font-medium">
            Category<span className="text-red-600">*</span>
          </Label>
          <Select onValueChange={(value) => setSelectedCategory(value)}>
            <SelectTrigger className="w-full mt-1">
              <SelectValue placeholder="Select Category" />
            </SelectTrigger>
            <SelectContent>
              {categories?.map((category: Category) => (
                <SelectItem key={category.id} value={category.name}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Upload Images */}
        <div>
          <Label className="text-sm font-medium">
            Item Photos<span className="text-red-600">*</span>
          </Label>
          <ImageUploader
            selectedFiles={selectedFiles}
            setSelectedFiles={setSelectedFiles}
          />
          <p className="text-xs text-gray-500 mt-1">
            Add up to 3 photos to help people identify what you need.
          </p>
        </div>

        {/* Error */}
        {error && <p className="text-sm text-red-600 text-center">{error}</p>}

        {/* Submit */}
        <button
          type="submit"
          disabled={!isFormValid || loading || isLoading}
          className={`w-full py-3 rounded-md font-semibold transition text-white
            ${
              isFormValid
                ? "bg-orange-500 hover:bg-orange-600"
                : "bg-gray-300 cursor-not-allowed"
            }
          `}
        >
          Post Item for Sale
        </button>
      </form>
    </div>
  );
}
