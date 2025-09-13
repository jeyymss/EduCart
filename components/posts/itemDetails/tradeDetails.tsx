"use client"

type TradeItem = {
  item_title: string
  category_name?: string
  item_description?: string
  item_price?: number | null // explicitly allow null just in case
  item_trade?: string
  item_condition?: string
}

export default function TradeDetails({ item }: { item: TradeItem }) {
  const hasPrice = typeof item.item_price === "number" && !isNaN(item.item_price)
  const hasTrade = !!item.item_trade

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
        <div>
          <h2 className="text-sm font-medium text-gray-500 mb-1">Description</h2>
          <p className="text-gray-700 leading-relaxed">
            {item.item_description || "No description provided."}
          </p>
        </div>

        {(hasPrice || hasTrade) && (
          <div>
            <h2 className="text-sm font-medium text-gray-500 mb-1">Offer</h2>
            <p className="text-2xl font-bold text-gray-900">
              {hasPrice ? `₱${item.item_price!.toLocaleString()}` : ""}
              {hasPrice && hasTrade ? " + " : ""}
              {hasTrade ? `Trade for ${item.item_trade}` : ""}
            </p>
          </div>
        )}

        <div>
          <h2 className="text-sm font-medium text-gray-500 mb-1">Condition</h2>
          <p className="text-gray-700">{item.item_condition || "Not specified"}</p>
        </div>
      </div>
    </div>
  )
}
