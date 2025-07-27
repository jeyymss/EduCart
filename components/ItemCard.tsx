// components/ItemCard.tsx
import Link from "next/link";

type Props = {
  id: number;
  title: string;
  price?: number; // optional
  seller: string;
};

export default function ItemCard({ id, title, price, seller }: Props) {
  return (
    <Link href={`/product/${id}`}>
      <div className="rounded-lg shadow-md p-4 hover:shadow-xl transition cursor-pointer">
        <h2 className="text-lg font-bold">{title}</h2>

        {/* ✅ Fix: check if price exists before formatting */}
        <p className="text-blue-600 font-semibold">
          {price !== undefined
            ? `₱${price.toLocaleString()}`
            : "Price not listed"}
        </p>

        <p className="text-sm text-gray-500">Listed by: {seller}</p>
      </div>
    </Link>
  );
}
