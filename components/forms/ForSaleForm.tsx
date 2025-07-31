import { ForSale } from "@/app/api/formSubmit/route";
import { useState } from "react";

interface ForSaleFormProps {
  selectedType: string;
}

export function ForSaleForm({ selectedType }: ForSaleFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const formData = new FormData(e.currentTarget);

    try {
      setLoading(true);

      console.log("received selectedType: ", selectedType);

      await ForSale(formData, selectedType);
      setLoading(false);

      window.location.href = "/home";
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
        required
        className="w-full"
      />
      {/* Errors */}
      {error && <p className="text-sm text-red-600 text-center">{error}</p>}
      <button
        type="submit"
        className="w-full bg-primary text-white p-2 rounded-md"
        disabled={loading}
      >
        Submit For Sale
      </button>
    </form>
  );
}
