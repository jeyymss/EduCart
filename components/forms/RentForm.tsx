"use client";

import { useRef, useState, useEffect } from "react";
import { ForRent } from "@/app/api/formSubmit/rent/route";
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
import { Info, MapPin, Calendar } from "lucide-react";

interface FormProps {
  selectedType: string;
}

export function RentForm({ selectedType }: FormProps) {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [condition, setCondition] = useState<string>("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const [pickupLat, setPickupLat] = useState<number | null>(null);
  const [pickupLng, setPickupLng] = useState<number | null>(null);
  const [pickupAddress, setPickupAddress] = useState<string>("");

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
        condition !== "" &&
        selectedCategory !== "" &&
        pickupAddress !== "";

      setIsFormValid(valid);
    };

    form?.addEventListener("input", validate);
    validate();

    return () => form?.removeEventListener("input", validate);
  }, [selectedFiles, condition, selectedCategory, pickupAddress]);

  /* SUBMIT */
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
      selectedFiles.forEach((file) => formData.append("itemImage", file));

      const result = await ForRent(
        formData,
        selectedType,
        selectedCategory,
        condition,
        pickupLat,
        pickupLng,
        pickupAddress
      );

      setLoading(false);

      if (result?.error) setError(result.error);
      else window.location.href = "/home";
    } catch (err) {
      console.error(err);
      setLoading(false);
      setError("Submit Failed");
    }
  };

  return (
    <div className="w-full">
      {/* Info Alert */}
      <div className="flex items-start gap-3 bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6">
        <Info className="w-5 h-5 text-purple-600 mt-0.5 shrink-0" />
        <div className="text-sm text-purple-800">
          <p className="font-medium mb-1">Tips for renting out your item:</p>
          <ul className="list-disc list-inside space-y-0.5 text-xs">
            <li>Set a fair daily rate based on item value and market rates</li>
            <li>Specify item condition and any usage restrictions</li>
            <li>Include deposit or damage policy in description</li>
            <li>Choose a convenient meet-up location</li>
          </ul>
        </div>
      </div>

      <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information Section */}
        <div className="space-y-5">
          <h3 className="text-base font-semibold text-gray-700 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-purple-500" />
            Rental Information
          </h3>

          {/* Item Name */}
          <div>
            <Label className="text-sm font-medium text-gray-700">
              What are you renting out? <span className="text-red-600">*</span>
            </Label>
            <Input
              type="text"
              name="itemTitle"
              placeholder="e.g., DSLR Camera, Camping Tent, Power Tools"
              className="mt-1.5 border-gray-300 focus:border-purple-400 focus:ring-purple-400"
              required
            />
          </div>

          {/* Description */}
          <div>
            <Label className="text-sm font-medium text-gray-700">
              Description <span className="text-red-600">*</span>
            </Label>
            <textarea
              placeholder="Describe your item, rental terms, any deposit required, and usage guidelines..."
              name="itemDescription"
              className="w-full border border-gray-300 p-3 rounded-md mt-1.5 min-h-[100px] resize-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400 transition"
              required
            />
            <p className="text-xs text-gray-500 mt-1">Include rental conditions and any special requirements</p>
          </div>

          {/* Daily Rent Price and Condition - Grid Layout */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Daily Rent Price */}
            <div>
              <Label className="text-sm font-medium text-gray-700">
                Daily Rent Price (₱) <span className="text-red-600">*</span>
              </Label>
              <Input
                type="number"
                name="itemPrice"
                placeholder="0.00"
                min="0"
                step="0.01"
                className="mt-1.5 border-gray-300 focus:border-purple-400 focus:ring-purple-400"
                required
              />
            </div>

            {/* Condition */}
            <div>
              <Label className="text-sm font-medium text-gray-700">
                Item Condition <span className="text-red-600">*</span>
              </Label>
              <Select onValueChange={setCondition}>
                <SelectTrigger className="w-full mt-1.5 border-gray-300 focus:border-purple-400 focus:ring-purple-400">
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
          </div>

          {/* Category */}
          <div>
            <Label className="text-sm font-medium text-gray-700">
              Category <span className="text-red-600">*</span>
            </Label>
            <Select onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full mt-1.5 border-gray-300 focus:border-purple-400 focus:ring-purple-400">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories?.map((cat: Category) => (
                  <SelectItem key={cat.id} value={cat.name}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500 mt-1">Choose the category that best describes your item</p>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200"></div>

        {/* Images Section */}
        <div className="space-y-4">
          <h3 className="text-base font-semibold text-gray-700 flex items-center gap-2">
            <svg className="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Item Photos
          </h3>

          <div>
            <Label className="text-sm font-medium text-gray-700">
              Upload Images <span className="text-red-600">*</span>
            </Label>
            <div className="mt-1.5">
              <ImageUploader
                selectedFiles={selectedFiles}
                setSelectedFiles={setSelectedFiles}
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Upload up to 10 clear photos. First photo will be the cover image.
            </p>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200"></div>

        {/* Meet-up Location Section */}
        <div className="space-y-4">
          <div className="flex items-start gap-2">
            <div className="flex-1">
              <h3 className="text-base font-semibold text-gray-700 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-purple-500" />
                Meet-up Location
              </h3>
              <p className="text-xs text-gray-600 mt-1">Location for item pickup and return</p>
            </div>
          </div>

          <div>
            <Label className="text-sm font-medium text-gray-700">
              Set Location <span className="text-red-600">*</span>
            </Label>
            <div className="mt-1.5">
              <AddressPickerWithMap
                onSelect={(lat, lng, address) => {
                  setPickupLat(lat);
                  setPickupLng(lng);
                  setPickupAddress(address);
                }}
              />
            </div>

            <div className="mt-3">
              <Input
                readOnly
                value={pickupAddress}
                placeholder="Selected address will appear here"
                className="bg-gray-50 border-gray-300 text-gray-700"
              />
            </div>

            <input type="hidden" name="pickup_lat" value={pickupLat ?? ""} />
            <input type="hidden" name="pickup_lng" value={pickupLng ?? ""} />
            <input type="hidden" name="pickup_address" value={pickupAddress} />
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200"></div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
            <svg className="w-5 h-5 text-red-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={!isFormValid || loading || isLoading}
          className={`
            w-full
            py-3.5
            px-6
            rounded-lg
            font-semibold
            text-base
            transition-all
            duration-200
            flex items-center justify-center gap-2
            ${
              isFormValid && !loading && !isLoading
                ? "bg-purple-500 text-white hover:bg-purple-600 hover:shadow-lg transform hover:-translate-y-0.5"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }
          `}
        >
          {loading || isLoading ? (
            <>
              <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Posting...
            </>
          ) : (
            <>
              <Calendar className="w-5 h-5" />
              Post Rental Listing
            </>
          )}
        </button>
      </form>
    </div>
  );
}
