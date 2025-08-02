import type { NextConfig } from "next";

// Strip the protocol (https://) from the Supabase URL to get the domain
const supabaseDomain = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(
  /^https?:\/\//,
  ""
);

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    domains: supabaseDomain ? [supabaseDomain] : [],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb", // You can adjust this if needed
    },
  },
};

export default nextConfig;
