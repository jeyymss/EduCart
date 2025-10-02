"use client";

import { useRef, useState, useEffect } from "react";
import { Giveaway } from "@/app/api/formSubmit/giveaway/route"; // your server action
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

interface FormProps {
  selectedType: string;
}

export function GiveawayForm({ selectedType }: FormProps) {
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

      const output = await Giveaway(
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
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-2">
      {/* Item Name */}
      <Label className="text-sm">
        Item name<span className="text-red-600">*</span>
      </Label>
      <Input
        type="text"
        name="itemTitle"
        placeholder="Enter Name"
        className="w-full border border-gray-300 p-2 rounded-md"
        required
      />

      {/* Condition */}
      <Label className="text-sm">
        Condition<span className="text-red-600">*</span>
      </Label>
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

      {/* Category */}
      <Label className="text-sm">
        Category<span className="text-red-600">*</span>
      </Label>
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

      {/* Upload Images */}
      <Label className="text-sm">
        Upload Images<span className="text-red-600">*</span>
      </Label>
      <ImageUploader
        selectedFiles={selectedFiles}
        setSelectedFiles={setSelectedFiles}
      />

      {/* Error Message */}
      {error && <p className="text-sm text-red-600 text-center">{error}</p>}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={!isFormValid || loading || isLoading}
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
