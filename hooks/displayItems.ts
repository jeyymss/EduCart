import { useQuery } from "@tanstack/react-query";

type PostWithUser = {
  post_id: string;
  item_title: string;
  item_description: string;
  item_price: number;
  full_name: string;
  category_name: string;
  post_type_name: string;
  created_at: string;
  image_urls: string[];
};

// DISPLAY ITEMS IN HOME PAGE
export const useHomepageItems = () => {
  return useQuery<PostWithUser[]>({
    queryKey: ["homepage-items", 5],
    queryFn: async () => {
      const res = await fetch("/api/productCard?limit=5");
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
      const res = await fetch("/api/productCard");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch items");
      return data;
    },
    staleTime: 1000 * 60 * 3,
    refetchOnWindowFocus: true,
  });
};

//DISPLAY ITEM DETAILS
export const useProductDetails = (id: string) => {
  return useQuery<PostWithUser>({
    queryKey: ["productDetails", id],
    queryFn: async () => {
      const res = await fetch(`/api/productDetails?id=${id}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch item");
      return data;
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 3,
  });
};
