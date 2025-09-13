"use client"

export default function TradeDetails({ item }: { item: any }) {
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
          <p className="text-gray-700 leading-relaxed">{item.item_description}</p>
        </div>

        {item.item_price && (
          <div>
            <h2 className="text-sm font-medium text-gray-500 mb-1">Price + Trade</h2>
            <p className="text-2xl font-bold text-gray-900">₱{item.item_price?.toLocaleString()} + trade</p>
          </div>
        )}

        {item.item_trade && (
          <div>
            <h2 className="text-sm font-medium text-gray-500 mb-1">Looking to Trade For</h2>
            <p className="text-gray-700 italic">{item.item_trade}</p>
          </div>
        )}

        <div>
          <h2 className="text-sm font-medium text-gray-500 mb-1">Condition</h2>
          <p className="text-gray-700">{item.item_condition}</p>
        </div>
      </div>
    </div>
  )
}
