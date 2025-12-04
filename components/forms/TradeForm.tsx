"use client";

import { useRef, useState, useEffect } from "react";
import { ForTrade } from "@/app/api/formSubmit/trade/route";
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
import AddressPickerWithMap from "../location/AddressPickerWithMap";
import { CircleQuestionMark, X } from "lucide-react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";

interface FormProps {
  selectedType: string;
  onClose?: () => void;
}

export function TradeForm({ selectedType, onClose }: FormProps) {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [condition, setCondition] = useState<string>("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);


  const formRef = useRef<HTMLFormElement | null>(null);
  const [isFormValid, setIsFormValid] = useState(false);

  const { data: categories, isLoading } = useCategories();

  /* FORM VALIDATION */
  useEffect(() => {
    const form = formRef.current;

    const validate = () => {
      const valid =
        (form?.checkValidity() ?? false) &&
        selectedFiles.length > 0 &&
        selectedCategory !== "" &&
        condition !== "";

      setIsFormValid(valid);
    };

    form?.addEventListener("input", validate);
    validate();
    return () => form?.removeEventListener("input", validate);
  }, [selectedFiles, condition, selectedCategory]);

  /* SUBMIT */
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    try {
      setLoading(true);

      const formData = new FormData(e.currentTarget);

      formData.delete("itemImage");
      selectedFiles.forEach((file) => formData.append("itemImage", file));

      const output = await ForTrade(
        formData,
        selectedType,
        selectedCategory,
        condition
      );

      setLoading(false);

      if (output?.error) setError(output.error);
      else window.location.href = "/home";
    } catch (err) {
      console.error(err);
      setLoading(false);
      setError("Submit Failed");
    }
  };

  return (
    <div
      className="
        relative
        px-2 
        md:px-4
        rounded-lg
        overflow-visible max-h-none
        md:max-h-[75vh] md:overflow-y-auto
      "
    >
      {/* CLOSE BUTTON */}
      {onClose && (
        <button
          onClick={onClose}
          className="
            absolute top-2 right-2 
            p-1 rounded-full 
            text-gray-500 hover:bg-gray-200 hover:text-black 
            transition
          "
        >
          <X className="w-5 h-5" />
        </button>
      )}

      {/* FORM */}
      <form ref={formRef} onSubmit={handleSubmit} className="space-y-4 pb-6">
        {/* Item Name */}
        <div>
          <Label className="text-sm font-medium">
            Item Name <span className="text-red-600">*</span>
          </Label>
          <Input
            type="text"
            name="itemTitle"
            placeholder="Enter item name"
            className="border-gray-300 mt-1"
            required
          />
        </div>

        {/* Looking to Trade */}
        <div>
          <Label className="text-sm font-medium">
            Looking to Trade For <span className="text-red-600">*</span>
          </Label>
          <Input
            type="text"
            name="itemTrade"
            placeholder="What do you want in exchange?"
            className="border-gray-300 mt-1"
            required
          />
        </div>

        {/* Optional Price */}
        <div>
          <Label className="text-sm font-medium">
            Price <span className="text-gray-400">(Optional)</span>
          </Label>
          <Input
            type="number"
            name="itemPrice"
            placeholder="Optional price"
            className="border-gray-300 mt-1"
          />
        </div>

        {/* Condition */}
        <div>
          <Label className="text-sm font-medium">
            Condition <span className="text-red-600">*</span>
          </Label>
          <Select onValueChange={setCondition}>
            <SelectTrigger className="w-full mt-1">
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
        </div>

        {/* Category */}
        <div>
          <Label className="text-sm font-medium">
            Category <span className="text-red-600">*</span>
          </Label>
          <Select onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full mt-1">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>

            <SelectContent>
              {categories?.map((cat: Category) => (
                <SelectItem key={cat.id} value={cat.name}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Description */}
        <div>
          <Label className="text-sm font-medium">
            Description <span className="text-red-600">*</span>
          </Label>
          <textarea
            placeholder="Describe your item..."
            name="itemDescription"
            className="w-full border border-gray-300 p-2 rounded-md mt-1 min-h-[100px]"
            required
          />
        </div>

        {/* Upload Images */}
        <div>
          <Label className="text-sm font-medium">
            Upload Images <span className="text-red-600">*</span>
          </Label>
          <div className="mt-1">
            <ImageUploader
              selectedFiles={selectedFiles}
              setSelectedFiles={setSelectedFiles}
            />
          </div>
        </div>

        {/* Error */}
        {error && <p className="text-sm text-red-600 text-center">{error}</p>}

        {/* Submit */}
        <button
          type="submit"
          disabled={!isFormValid || loading || isLoading}
          className={`
            w-full p-3 rounded-md font-semibold transition mt-2
            ${
              isFormValid
                ? "bg-[#C7D9E5] text-[#333] hover:bg-[#122C4F] hover:text-white"
                : "bg-[#DEDEDE] text-[#333]"
            }
          `}
        >
          Post
        </button>
      </form>
    </div>
  );
}
