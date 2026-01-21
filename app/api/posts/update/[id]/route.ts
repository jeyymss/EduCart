import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function PATCH(request: Request, context: { params: { id: string } }) {
  try {
    const params = await context.params; 
    const supabase = await createClient();
    const body = await request.json();

    console.log("PATCH BODY:", body);
    console.log("POST ID:", params.id);

    const updateData: any = {};

    if (body.item_price !== undefined) updateData.item_price = body.item_price;
    if (body.item_description !== undefined) updateData.item_description = body.item_description;
    if (body.item_trade !== undefined) updateData.item_trade = body.item_trade;
    if (body.item_service_fee !== undefined) updateData.item_service_fee = body.item_service_fee;

    
    if (body.quantity !== undefined) updateData.quantity = body.quantity;

    console.log("FINAL UPDATE DATA:", updateData);

    const { data, error } = await supabase
      .from("posts")
      .update(updateData)
      .eq("id", params.id)
      .select();

    console.log("SUPABASE ERROR:", error);
    console.log("SUPABASE DATA:", data);

    if (error) {
      return NextResponse.json({ error: error.message, details: error }, { status: 400 });
    }

    return NextResponse.json({ success: true, updated: data });
  } catch (err: any) {
    console.log("SERVER ERROR:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
