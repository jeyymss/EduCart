import Link from "next/link";

type Props = {
  id: string;
  title: string;
  price?: number;
  seller: string;
  type: string;
  created_at: string;
};

function getRelativeTime(timestamp: string): string {
  const now = new Date();
  const created = new Date(timestamp);
  const diffMs = now.getTime() - created.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? "s" : ""} ago`;

  const diffHrs = Math.floor(diffMins / 60);
  if (diffHrs < 24) return `${diffHrs} hour${diffHrs > 1 ? "s" : ""} ago`;

  const diffDays = Math.floor(diffHrs / 24);
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;

  const diffWeeks = Math.floor(diffDays / 7);
  if (diffWeeks < 4) return `${diffWeeks} week${diffWeeks > 1 ? "s" : ""} ago`;

  const diffMonths = Math.floor(diffDays / 30);
  return `${diffMonths} month${diffMonths > 1 ? "s" : ""} ago`;
}

export default function ItemCard({
  id,
  title,
  price,
  seller,
  type,
  created_at,
}: Props) {
  const formatName = (fullName: string) => {
    const parts = fullName.trim().split(/\s+/); // handles extra spaces
    if (parts.length === 0) return "";

    const firstName = parts[0];
    const lastName = parts[parts.length - 1]; // get last word as last name
    const lastInitial = lastName.charAt(0).toUpperCase();

    return `${firstName} ${lastInitial}.`;
  };

  return (
    <Link href={`/product/${id}`}>
      <div className="rounded-lg shadow-md p-4 hover:shadow-xl transition cursor-pointer">
        <h2 className="text-lg font-bold">{title}</h2>
        <p className="text-lg font-bold">{type}</p>
        <p className="text-blue-600 font-semibold">
          {price !== undefined
            ? `₱${price.toLocaleString()}`
            : "Price not listed"}
        </p>
        <p className="text-sm text-gray-500">Listed by: {formatName(seller)}</p>
        <p className="text-xs text-gray-400">
          Posted: {getRelativeTime(created_at)}
        </p>
      </div>
    </Link>
  );
}
