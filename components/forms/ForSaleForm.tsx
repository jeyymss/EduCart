import { ForSale } from "@/lib/formSubmit";
import { useState } from "react";

export function ForSaleForm() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const formData = new FormData(e.currentTarget);

    try {
      setLoading(true);

      await ForSale(formData);
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
