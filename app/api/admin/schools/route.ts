import { NextResponse } from "next/server";
import { checkIfAdmin } from "@/utils/checkAdmin";
import { supabaseAdmin } from "@/utils/supabase/admin";

// GET all universities with user counts
export async function GET() {
  try {
    const { isAdmin } = await checkIfAdmin();

    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Fetch all universities
    const { data: universities, error } = await supabaseAdmin
      .from("universities")
      .select("*")
      .order("name", { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Get user counts for each university
    const universitiesWithCounts = await Promise.all(
      (universities || []).map(async (university) => {
        // Count individuals
        const { count: individualCount } = await supabaseAdmin
          .from("individuals")
          .select("*", { count: "exact", head: true })
          .eq("university_id", university.id);

        // Count organizations
        const { count: orgCount } = await supabaseAdmin
          .from("organizations")
          .select("*", { count: "exact", head: true })
          .eq("university_id", university.id);

        return {
          ...university,
          user_count: (individualCount || 0) + (orgCount || 0),
        };
      })
    );

    return NextResponse.json(universitiesWithCounts);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST - Create new university
export async function POST(request: Request) {
  try {
    const { isAdmin } = await checkIfAdmin();

    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { name, abbreviation, domain } = await request.json();

    if (!name || !name.trim()) {
      return NextResponse.json({ error: "School name is required" }, { status: 400 });
    }

    if (!abbreviation || !abbreviation.trim()) {
      return NextResponse.json({ error: "Abbreviation is required" }, { status: 400 });
    }

    const insertData: any = {
      name: name.trim(),
      abbreviation: abbreviation.trim(),
    };

    // Only add domain if provided
    if (domain && domain.trim()) {
      insertData.domain = domain.trim();
    }

    const { data, error } = await supabaseAdmin
      .from("universities")
      .insert(insertData)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// PUT - Update university
export async function PUT(request: Request) {
  try {
    const { isAdmin } = await checkIfAdmin();

    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized - Only admins can edit schools" }, { status: 403 });
    }

    const { id, name, abbreviation, domain } = await request.json();

    if (!id) {
      return NextResponse.json({ error: "School ID is required" }, { status: 400 });
    }

    if (!name || !name.trim()) {
      return NextResponse.json({ error: "School name is required" }, { status: 400 });
    }

    if (!abbreviation || !abbreviation.trim()) {
      return NextResponse.json({ error: "Abbreviation is required" }, { status: 400 });
    }

    const updateData: any = {
      name: name.trim(),
      abbreviation: abbreviation.trim(),
    };

    // Only add domain if provided
    if (domain && domain.trim()) {
      updateData.domain = domain.trim();
    }

    const { data, error } = await supabaseAdmin
      .from("universities")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE - Delete university
export async function DELETE(request: Request) {
  try {
    const { isAdmin } = await checkIfAdmin();

    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "School ID is required" }, { status: 400 });
    }

    // Check if university has users (individuals)
    const { count: individualCount } = await supabaseAdmin
      .from("individuals")
      .select("*", { count: "exact", head: true })
      .eq("university_id", id);

    // Check if university has users (organizations)
    const { count: orgCount } = await supabaseAdmin
      .from("organizations")
      .select("*", { count: "exact", head: true })
      .eq("university_id", id);

    const totalUsers = (individualCount || 0) + (orgCount || 0);

    if (totalUsers > 0) {
      return NextResponse.json(
        { error: "Cannot delete school with existing users" },
        { status: 400 }
      );
    }

    const { error } = await supabaseAdmin
      .from("universities")
      .delete()
      .eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
