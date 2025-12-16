"use client";

import { useRef, useState, useEffect } from "react";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { PasaBuySubmit } from "@/app/api/formSubmit/pasabuy/route";
import { Plus, Trash2, Info, ShoppingCart, MapPin, CalendarIcon } from "lucide-react";
import { Calendar } from "../ui/calendar";
import AddressPickerWithMap from "../location/AddressPickerWithMap";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "../ui/popover";
import { format } from "date-fns";

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

  // Location and Date state
  const [location, setLocation] = useState("");
  const [cutoffDate, setCutoffDate] = useState<Date>();

  // Pickup Location state
  const [pickupLat, setPickupLat] = useState<number | null>(null);
  const [pickupLng, setPickupLng] = useState<number | null>(null);
  const [pickupAddress, setPickupAddress] = useState<string>("");

  useEffect(() => {
    const isValid =
      location !== "" &&
      cutoffDate !== undefined &&
      pickupAddress !== "";

    setIsFormValid(isValid);
  }, [location, cutoffDate, pickupAddress]);


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

    if (items.length === 0) {
      setError("Please add at least one item.");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData(e.currentTarget);

      // 🔥 THIS IS THE MISSING PIECE
      formData.append("items", JSON.stringify(items));

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
      setLoading(false);
    }
  };


  return (
    <div className="w-full">
      {/* Info Alert */}
      <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
        <Info className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
        <div className="text-sm text-amber-800">
          <p className="font-medium mb-1">How PasaBuy Works:</p>
          <ul className="list-disc list-inside space-y-0.5 text-xs">
            <li>List items you&apos;re willing to buy FOR buyers at the specified location</li>
            <li>Set ONE flat service fee (not per item) for your shopping service</li>
            <li>Buyers will pay: Item Price + Your Service Fee</li>
            <li>Set a cutoff date for when you&apos;ll do the shopping trip</li>
          </ul>
        </div>
      </div>

      <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information Section */}
        <div className="space-y-5">
          <h3 className="text-base font-semibold text-gray-700 flex items-center gap-2">
            <ShoppingCart className="w-4 h-4 text-amber-500" />
            Service Details
          </h3>

          {/* Title */}
          <div>
            <Label className="text-sm font-medium text-gray-700">
              Service Title <span className="text-red-600">*</span>
            </Label>
            <Input
              type="text"
              name="itemTitle"
              placeholder="e.g., PasaBuy from SM City Manila, Grocery Shopping Service"
              className="mt-1.5 border-gray-300 focus:border-amber-400 focus:ring-amber-400"
              required
            />
            <p className="text-xs text-gray-500 mt-1">Give your PasaBuy service a clear title</p>
          </div>

          {/* Service Fee */}
          <div>
            <Label className="text-sm font-medium text-gray-700">
              Flat Service Fee (₱) <span className="text-red-600">*</span>
            </Label>
            <Input
              type="number"
              name="itemServiceFee"
              placeholder="0.00"
              min="0"
              step="0.01"
              className="mt-1.5 border-gray-300 focus:border-amber-400 focus:ring-amber-400"
              required
            />
            <p className="text-xs text-gray-500 mt-1">One-time fee per buyer order (not per item)</p>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200"></div>

        {/* Items List Section */}
        <div className="space-y-4">
          <h3 className="text-base font-semibold text-gray-700">Items Available for PasaBuy</h3>
          <p className="text-xs text-gray-600">
            List items you&apos;re willing to buy for customers. Buyers will request these items and pay the item price + your service fee.
          </p>

          {/* Add Item Form */}
          <div className="space-y-3 bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-medium text-gray-600">Product Name</Label>
                <Input
                  type="text"
                  placeholder="e.g., Shampoo, Notebook, Snacks"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  className="mt-1 border-gray-300 focus:border-amber-400 focus:ring-amber-400"
                />
              </div>
              <div>
                <Label className="text-xs font-medium text-gray-600">Price (₱)</Label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={newItemPrice}
                  onChange={(e) => setNewItemPrice(e.target.value)}
                  min="0"
                  step="0.01"
                  className="mt-1 border-gray-300 focus:border-amber-400 focus:ring-amber-400"
                />
              </div>
            </div>
            <Button
              type="button"
              onClick={addItem}
              disabled={!newItemName.trim() || !newItemPrice.trim()}
              className="w-full bg-amber-500 hover:bg-amber-600 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Item to List
            </Button>
          </div>

          {/* Items List Display */}
          {items.length > 0 && (
            <div className="max-h-60 overflow-y-auto space-y-2">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between bg-white border border-gray-200 rounded-lg p-3 hover:border-amber-300 transition"
                >
                  <div className="flex-1">
                    <p className="font-medium text-sm text-gray-800">
                      {item.productName}
                    </p>
                    <p className="text-sm text-amber-600 font-semibold">
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
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200"></div>

        {/* Location & Date Section */}
        <div className="space-y-5">
          <h3 className="text-base font-semibold text-gray-700 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-amber-500" />
            Shopping Location & Schedule
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Location */}
            <div>
              <Label className="text-sm font-medium text-gray-700">
                Where will you shop? <span className="text-red-600">*</span>
              </Label>
              <Input
                type="text"
                name="pasabuyLocation"
                placeholder="e.g., SM City Manila, Puregold Cubao"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="mt-1.5 border-gray-300 focus:border-amber-400 focus:ring-amber-400"
                required
              />
              <p className="text-xs text-gray-500 mt-1">Store or location where you&apos;ll purchase the items</p>
            </div>

            {/* Cut Off Date */}
            <div>
              <Label className="text-sm font-medium text-gray-700">
                Shopping Date <span className="text-red-600">*</span>
              </Label>

              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={`w-full mt-1.5 justify-start text-left font-normal border-gray-300 hover:border-amber-400 focus:border-amber-400 focus:ring-amber-400 ${
                      !cutoffDate && "text-muted-foreground"
                    }`}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {cutoffDate ? format(cutoffDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>

                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={cutoffDate}
                    onSelect={setCutoffDate}
                    disabled={(date) => date < new Date()}
                  />
                </PopoverContent>
              </Popover>

              {/* ✅ IMPORTANT CHANGE HERE */}
              <Input
                type="hidden"
                name="pasabuyCutOffDate"
                value={cutoffDate ? cutoffDate.toISOString() : ""}
                required
              />

              <p className="text-xs text-gray-500 mt-2">
                When will you go shopping? Buyers must order before this date.
              </p>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200"></div>

        {/* Description Section */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700">
            Service Description <span className="text-red-600">*</span>
          </Label>
          <textarea
            placeholder="Explain your PasaBuy service: when you'll shop, how buyers can order, payment terms, delivery/meetup arrangements, etc..."
            name="itemDescription"
            required
            className="w-full border border-gray-300 p-3 rounded-md min-h-[100px] resize-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition"
          />
          <p className="text-xs text-gray-500">
            Help buyers understand how to request items and receive their orders
          </p>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200"></div>

        {/* Pickup Location Section */}
        <div className="space-y-4">
          <div className="flex items-start gap-2">
            <div className="flex-1">
              <h3 className="text-base font-semibold text-gray-700 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-amber-500" />
                Pickup Location
              </h3>
              <p className="text-xs text-gray-600 mt-1">Where buyers can pick up their orders (also used to calculate delivery fees)</p>
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

            <input type="hidden" name="seller_lat" value={pickupLat ?? ""} />
            <input type="hidden" name="seller_lng" value={pickupLng ?? ""} />
            <input type="hidden" name="seller_address" value={pickupAddress} />
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
          disabled={!isFormValid || loading}
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
              isFormValid && !loading
                ? "bg-amber-500 text-white hover:bg-amber-600 hover:shadow-lg transform hover:-translate-y-0.5"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }
          `}
        >
          {loading ? (
            <>
              <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Posting...
            </>
          ) : (
            <>
              <ShoppingCart className="w-5 h-5" />
              Post PasaBuy Service
            </>
          )}
        </button>
      </form>
    </div>
  );
}
