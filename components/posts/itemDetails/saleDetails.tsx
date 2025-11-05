"use client"

type SaleItem = {
  item_title: string
  quantity: number
  category_name: string
  item_description: string
  item_price?: number
  item_condition: string
}

export default function SaleDetails({ item }: { item: SaleItem }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <h1 className="text-3xl font-bold text-gray-900">{item.item_title}</h1>
        <span className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">
          {item.category_name}
        </span>
      </div>

      <div className="space-y-3">
        <div>
          <h2 className="text-sm font-medium text-gray-500 mb-1">Description</h2>
          <p className="text-gray-700 leading-relaxed">
            {item.item_description || "No description provided."}
          </p>
        </div>

        <div>
          <h2 className="text-sm font-medium text-gray-500 mb-1">Price</h2>
          <p className="text-2xl font-bold text-gray-900">
            {item.item_price !== undefined ? `₱${item.item_price.toLocaleString()}` : "N/A"}
          </p>
        </div>

        <div>
          <h2 className="text-sm font-medium text-gray-500 mb-1">Condition</h2>
          <p className="text-gray-700">{item.item_condition || "Not specified"}</p>
        </div>
        <div>
          <h2 className="text-sm font-medium text-gray-500 mb-1">Stock</h2>
          <p className="text-gray-700">{item.quantity || "Not specified"}</p>
        </div>
      </div>
    </div>
  )
}
