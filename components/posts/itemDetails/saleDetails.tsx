"use client";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function SaleDetails({ item }: { item: any }) {
  return (
    <div className="space-y-1">
      <h1 className="text-2xl font-bold">{item.item_title}</h1>
      <p className="text-blue-700">{item.item_condition}</p>
      <p className="text-green-700 font-medium">{item.category_name}</p>
      <p className="text-xl text-emerald-600 font-semibold">
        ₱{item.item_price}
      </p>
      <p>{item.item_description}</p>
      <p className="text-sm text-gray-600">Posted by: {item.full_name}</p>
    </div>
  );
}
