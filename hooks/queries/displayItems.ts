import { useQuery } from "@tanstack/react-query";

type PostWithUser = {
  post_id: string;
  post_user_id: string;
  item_title: string;
  item_description: string;
  item_price: number;
  item_trade: string | null;
  full_name: string;
  status: "Listed" | "Sold" | "Unlisted";
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

export type GiveawayPost = {
  id: string;
  item_title: string;
  item_description: string | null;
  image_urls: string[];
  created_at: string;
  like_count: number;
  comment_count: number;
  is_liked: boolean;
  category_name?: string;
  condition?: string;
  user?: {
    full_name: string;
    avatar_url?: string;
  };
};

export type OrganizationPost = {
  post_id: string;
  item_title: string;
  item_description: string;
  item_price: number | null;
  item_condition: string | null;
  image_urls: string[] | null;
  created_at: string;
  status: "Listed" | "Sold" | "Unlisted";
  category_name: string | null;
  post_type_name: string | null;
  organization_name: string;
  university_name: string | null;
  university_abbr: string | null;
};

// DISPLAY ITEMS IN HOME PAGE
export const useHomepageItems = () => {
  return useQuery<PostWithUser[]>({
    queryKey: ["homepage-items", 5],
    queryFn: async () => {
      const res = await fetch("/api/posts/homeItems?limit=5");
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
      const res = await fetch("/api/posts/browseItems");
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

//DISPLAY ITEMS LISTED IN USER PROFILE
export function useUserPosts(userId: string | undefined, status?: string) {
  return useQuery({
    queryKey: ["userPosts", userId, status], // include status in cache key
    queryFn: async () => {
      if (!userId) return [];
      const url = new URL(
        "/api/user-profile-view/userPosts",
        window.location.origin
      );
      url.searchParams.set("userId", userId);
      if (status) url.searchParams.set("status", status); // ✅ add status filter

      const res = await fetch(url.toString());
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Failed to fetch user posts");
      return data;
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutes cache
  });
}

// DISPLAY GIVEAWAY POSTS
export const useGiveawayPosts = () => {
  return useQuery<GiveawayPost[]>({
    queryKey: ["giveaway-posts"],
    queryFn: async () => {
      const res = await fetch("/api/posts/giveaways", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch giveaways");
      return data;
    },
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });
};

//DISPLAY ORGANIZATION POSTS
export const useOrganizationItems = () => {
  return useQuery<OrganizationPost[]>({
    queryKey: ["organization-items"],
    queryFn: async () => {
      const res = await fetch("/api/posts/organizationItems");
      const data = await res.json();
      if (!res.ok)
        throw new Error(data.error || "Failed to fetch organization items");
      return data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes cache
    refetchOnWindowFocus: false,
  });
};
