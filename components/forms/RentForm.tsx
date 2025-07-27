export function RentForm() {
  return (
    <form className="space-y-3">
      <input
        type="text"
        placeholder="Item Title"
        className="w-full border border-gray-300 p-2 rounded-md"
      />
      <input
        type="number"
        placeholder="Daily Rent Price"
        className="w-full border border-gray-300 p-2 rounded-md"
      />
      <input
        type="number"
        placeholder="Rental Duration (days)"
        className="w-full border border-gray-300 p-2 rounded-md"
      />
      <textarea
        placeholder="Description"
        className="w-full border border-gray-300 p-2 rounded-md"
      />
      <button
        type="submit"
        className="w-full bg-primary text-white p-2 rounded-md"
      >
        Submit Rent
      </button>
    </form>
  );
}
