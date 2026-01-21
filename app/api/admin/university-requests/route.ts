import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { checkIfAdmin } from "@/utils/checkAdmin";

// GET - Fetch all university requests
export async function GET() {
  try {
    const { isAdmin } = await checkIfAdmin();
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("university_requests")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching university requests:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (error: any) {
    console.error("Error in GET university-requests:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch requests" },
      { status: 500 }
    );
  }
}

// POST - Update request status
export async function POST(req: Request) {
  try {
    const { isAdmin } = await checkIfAdmin();
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { requestId, decision } = body;

    if (!requestId || !decision) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const newStatus = decision === "approve" ? "approved" : "rejected";

    // Update request status in database
    const supabase = await createClient();
    const { error: updateError } = await supabase
      .from("university_requests")
      .update({ status: newStatus })
      .eq("id", requestId);

    if (updateError) {
      console.error("Error updating request status:", updateError);
      return NextResponse.json(
        { error: "Failed to update status", details: updateError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Request ${newStatus} successfully`,
    });
  } catch (error: any) {
    console.error("Error in POST university-requests:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process request" },
      { status: 500 }
    );
  }
}
