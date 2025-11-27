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
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <h1 className="text-3xl font-bold text-gray-900">{item.item_title}</h1>

        {item.category_name && (
          <span className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">
            {item.category_name}
          </span>
        )}
      </div>

      <div className="space-y-3">
        {/* Description */}
        <div>
          <h2 className="text-sm font-medium text-gray-500 mb-1">Description</h2>
          <p className="text-gray-700 leading-relaxed">
            {item.item_description || "No description provided."}
          </p>
        </div>

        {/* Price */}
        <div>
          <h2 className="text-sm font-medium text-gray-500 mb-1">Daily Rent Price</h2>
          <p className="text-2xl font-bold text-gray-900">
            {price !== undefined ? `₱${price.toLocaleString()} / day` : "N/A"}
          </p>
        </div>

        {/* Condition */}
        {item.item_condition && (
          <div>
            <h2 className="text-sm font-medium text-gray-500 mb-1">Condition</h2>
            <p className="text-gray-700">
              {item.item_condition}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
