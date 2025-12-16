import { useQuery } from "@tanstack/react-query";

export type PasabuyItem = {
  id: string;
  product_name: string;
  price: number;
};

export type PasabuyDetails = {
  id: string;
  item_title: string;
  item_description: string;
  item_service_fee: number;
  item_pasabuy_location: string;
  item_pasabuy_cutoff: string;
  created_at: string;
  pasabuy_items: PasabuyItem[];
};

export function usePasabuyDetails(postId: string | null) {
  return useQuery<PasabuyDetails>({
    queryKey: ["pasabuy-details", postId],
    queryFn: async () => {
      const res = await fetch(`/api/posts/pasabuyDetails?id=${postId}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      return data;
    },
    enabled: !!postId,
  });
}
