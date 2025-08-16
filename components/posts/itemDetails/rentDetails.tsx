"use client";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function RentDetails({ item }: { item: any }) {
  return (
    <div className="space-y-1">
      <h1 className="text-2xl font-bold">{item.item_title}</h1>
      <p className="text-blue-700">{item.item_condition}</p>
      <p className="text-green-700 font-medium">{item.category_name}</p>
      <p className="text-xl text-yellow-600 font-semibold">
        ₱{item.daily_rent_price ?? item.item_price} / day
      </p>
      <p>{item.item_description}</p>
    </div>
  );
}
