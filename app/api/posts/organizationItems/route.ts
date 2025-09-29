import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("organization_items_view")
    .select("*")
    .neq("post_type_name", "PasaBuy")
    .neq("post_type_name", "Giveaway")
    .neq("post_type_name", "Emergency Lending")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching organization items:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
