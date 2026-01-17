import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/utils/supabase/client";

export type Category = {
  id: string;
  name: string;
};

export const useCategories = () => {
  return useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await supabase.from("categories").select("*");

      if (error) throw new Error(error.message);
      return data;
    },
    staleTime: 1000 * 60 * 10, // 10 minutes - categories rarely change
    refetchOnWindowFocus: false,
  });
};
