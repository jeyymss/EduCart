import { useQuery } from "@tanstack/react-query";

type PostWithUser = {
  post_id: string;
  post_user_id: string;
  item_title: string;
  item_description: string;
  item_price: number;
  item_trade: string | null;
  full_name: string;
  item_condition: string;
  category_name: string;
  post_type_name: string;
  created_at: string;
  image_urls: string[];
};

type BasePost = {
  post_id: string;
  full_name: string;
  role: string;
  university_abbreviation: string;
  item_title: string;
  item_description: string;
  post_type_name: string;
  created_at: string;
};

export type EmergencyPost = BasePost;

export type PasaBuyPost = BasePost & {
  item_service_fee: number;
};

// DISPLAY ITEMS IN HOME PAGE
export const useHomepageItems = () => {
  return useQuery<PostWithUser[]>({
    queryKey: ["homepage-items", 5],
    queryFn: async () => {
      const res = await fetch("/api/posts/productCard?limit=5");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch items");
      return data;
    },
    staleTime: 1000 * 60 * 5, // cache is fresh for 5 minutes
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
};

// DISPLAY EMERGENCY LENDING IN HOME PAGE
export const useHomePageEmergency = () => {
  return useQuery<EmergencyPost[]>({
    queryKey: ["emergency", 4],
    queryFn: async () => {
      const res = await fetch("/api/posts/emergencyCard?limit=4");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch items");
      return data;
    },
    staleTime: 1000 * 60 * 5, // cache is fresh for 5 minutes
    refetchOnWindowFocus: true,
  });
};

// DISPLAY PASABUY POSTS IN HOME PAGE
export const useHomePagePasaBuy = () => {
  return useQuery<PasaBuyPost[]>({
    queryKey: ["pasabuy", 4],
    queryFn: async () => {
      const res = await fetch("/api/posts/pasabuyCard?limit=4");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch items");
      return data;
    },
    staleTime: 1000 * 60 * 5, // cache is fresh for 5 minutes
    refetchOnWindowFocus: true,
  });
};

// DISPLAY ITEMS IN BROWSE PAGE
export const useBrowsepageItems = () => {
  return useQuery<PostWithUser[]>({
    queryKey: ["browsepage-items"],
    queryFn: async () => {
      const res = await fetch("/api/posts/productCard");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch items");
      return data;
    },
    staleTime: 1000 * 60 * 5, // cache is fresh for 5 minutes
    refetchOnWindowFocus: true,
  });
};

//DISPLAY ITEM DETAILS
export const useProductDetails = (id: string) => {
  return useQuery<PostWithUser>({
    queryKey: ["productDetails", id],
    queryFn: async () => {
      const res = await fetch(`/api/posts/productDetails?id=${id}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch item");
      return data;
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });
};
