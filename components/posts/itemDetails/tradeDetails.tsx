"use client";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function TradeDetails({ item }: { item: any }) {
  return (
    <div className="space-y-1">
      <h1 className="text-2xl font-bold">{item.item_title}</h1>
      <p className="text-blue-700">{item.item_condition}</p>
      <p className="text-green-700 font-medium">{item.category_name}</p>
      {item.item_price && (
        <p className="text-lg text-orange-600 font-semibold">
          ₱{item.item_price} + trade
        </p>
      )}
      {item.item_to_trade && (
        <p className="italic text-sm text-gray-700">
          Wants to trade for: {item.item_to_trade}
        </p>
      )}
      <p>{item.item_description}</p>
      <p className="text-sm text-gray-600">Posted by: {item.full_name}</p>
    </div>
  );
}
