import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { checkIfAdmin } from "@/utils/checkAdmin";

// GET all categories with post counts
export async function GET() {
  try {
    const { isAdmin } = await checkIfAdmin();

    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const supabase = await createClient();

    // Fetch all categories
    const { data: categories, error } = await supabase
      .from("categories")
      .select("id, name, created_at")
      .order("name", { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Get post counts for each category
    const categoriesWithCounts = await Promise.all(
      (categories || []).map(async (category) => {
        const { count } = await supabase
          .from("posts")
          .select("*", { count: "exact", head: true })
          .eq("category_id", category.id);

        return {
          ...category,
          post_count: count || 0,
        };
      })
    );

    return NextResponse.json(categoriesWithCounts);
  } catch (err: any) {
    console.error("Error fetching categories:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST - Create new category
export async function POST(request: Request) {
  try {
    const { isAdmin } = await checkIfAdmin();

    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { name } = await request.json();

    if (!name || !name.trim()) {
      return NextResponse.json({ error: "Category name is required" }, { status: 400 });
    }

    const supabase = await createClient();

    const { data, error } = await supabase
      .from("categories")
      .insert({ name: name.trim() })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (err: any) {
    console.error("Error creating category:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// PUT - Update category
export async function PUT(request: Request) {
  try {
    console.log("PUT /api/admin/categories - Starting category update");

    const { isAdmin } = await checkIfAdmin();
    console.log("Admin check result:", isAdmin);

    if (!isAdmin) {
      console.error("PUT /api/admin/categories - Unauthorized: User is not admin");
      return NextResponse.json({ error: "Unauthorized - Only admins can edit categories" }, { status: 403 });
    }

    const { id, name } = await request.json();
    console.log("PUT /api/admin/categories - Request data:", { id, name });

    if (!id) {
      console.error("PUT /api/admin/categories - Missing category ID");
      return NextResponse.json({ error: "Category ID is required" }, { status: 400 });
    }

    if (!name || !name.trim()) {
      console.error("PUT /api/admin/categories - Missing or empty category name");
      return NextResponse.json({ error: "Category name is required" }, { status: 400 });
    }

    const supabase = await createClient();

    console.log("PUT /api/admin/categories - Updating category:", { id, trimmedName: name.trim() });

    const { data, error } = await supabase
      .from("categories")
      .update({ name: name.trim() })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("PUT /api/admin/categories - Supabase error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log("PUT /api/admin/categories - Success:", data);
    return NextResponse.json(data);
  } catch (err: any) {
    console.error("PUT /api/admin/categories - Unexpected error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE - Delete category
export async function DELETE(request: Request) {
  try {
    const { isAdmin } = await checkIfAdmin();

    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Category ID is required" }, { status: 400 });
    }

    const supabase = await createClient();

    // Check if category has posts
    const { count } = await supabase
      .from("posts")
      .select("*", { count: "exact", head: true })
      .eq("category_id", id);

    if (count && count > 0) {
      return NextResponse.json(
        { error: "Cannot delete category with existing posts" },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from("categories")
      .delete()
      .eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Error deleting category:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
