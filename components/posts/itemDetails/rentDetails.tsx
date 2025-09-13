"use client"

type RentItem = {
  item_title: string
  item_condition?: string
  category_name?: string
  daily_rent_price?: number
  item_price?: number
  item_description?: string
}

export default function RentDetails({ item }: { item: RentItem }) {
  const price = item.daily_rent_price ?? item.item_price

  return (
    <div className="space-y-1">
      <h1 className="text-2xl font-bold">{item.item_title}</h1>
      {item.item_condition && <p className="text-blue-700">{item.item_condition}</p>}
      {item.category_name && <p className="text-green-700 font-medium">{item.category_name}</p>}
      <p className="text-xl text-yellow-600 font-semibold">
        {price !== undefined ? `₱${price.toLocaleString()} / day` : "N/A"}
      </p>
      <p>{item.item_description ?? "No description provided."}</p>
    </div>
  )
}
