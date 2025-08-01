import { useQuery } from "@tanstack/react-query";

export type PostWithUser = {
  post_id: string;
  item_title: string;
  item_description: string;
  item_price: number;
  full_name: string;
  post_type_name: string;
  created_at: string;
};

// DISPLAY ITEMS IN HOME PAGE
export const useHomepageItems = () => {
  return useQuery<PostWithUser[]>({
    queryKey: ["homepage-items", 5],
    queryFn: async () => {
      const res = await fetch("/api/product?limit=5");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch items");
      return data;
    },
    staleTime: 1000 * 60 * 3, // cache is fresh for 3 minutes
    refetchOnWindowFocus: true,
  });
};

// DISPLAY ITEMS IN BROWSE PAGE
export const useBrowsepageItems = () => {
  return useQuery<PostWithUser[]>({
    queryKey: ["browsepage-items"],
    queryFn: async () => {
      const res = await fetch("/api/product");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch items");
      return data;
    },
    staleTime: 1000 * 60 * 3, // cache is fresh for 3 minutes
    refetchOnWindowFocus: true,
  });
};
