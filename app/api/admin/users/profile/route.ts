import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { checkIfAdmin } from "@/utils/checkAdmin";

export async function GET(request: Request) {
  try {
    const { isAdmin } = await checkIfAdmin();

    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 });
    }

    // Fetch user profile data (check both individuals and organizations)
    const [individualRes, orgRes] = await Promise.all([
      supabase
        .from("individuals")
        .select(`
          *,
          universities:university_id (
            id,
            name,
            abbreviation
          )
        `)
        .eq("user_id", userId)
        .maybeSingle(),
      supabase
        .from("organizations")
        .select(`
          *,
          universities:university_id (
            id,
            name,
            abbreviation
          )
        `)
        .eq("user_id", userId)
        .maybeSingle(),
    ]);

    const userProfile = individualRes.data || orgRes.data;
    const isOrganization = !!orgRes.data;
    const universityName = userProfile?.universities?.name || userProfile?.university || null;

    if (!userProfile) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Fetch wallet balance
    const { data: wallet } = await supabase
      .from("wallets")
      .select("current_balance, escrow_balance")
      .eq("user_id", userId)
      .maybeSingle();

    // Fetch total transactions count
    const { count: transactionsCount } = await supabase
      .from("transactions")
      .select("*", { count: "exact", head: true })
      .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`);

    // Fetch user's posts/listings with better error handling
    const { data: posts, error: postsError } = await supabase
      .from("posts")
      .select(`
        id,
        item_title,
        item_description,
        item_price,
        status,
        created_at,
        post_type_id,
        category_id,
        post_types:post_type_id(name),
        categories:category_id(name)
      `)
      .eq("post_user_id", userId)
      .order("created_at", { ascending: false })
      .limit(10);

    // Fetch total posts count
    const { count: totalPosts } = await supabase
      .from("posts")
      .select("*", { count: "exact", head: true })
      .eq("post_user_id", userId);

    return NextResponse.json({
      profile: {
        user_id: userProfile.user_id,
        name: userProfile.name || userProfile.full_name,
        email: userProfile.email,
        bio: userProfile.bio || null,
        university: universityName,
        role: isOrganization ? "Organization" : (userProfile.role || "Individual"),
        avatar_url: userProfile.avatar_url || null,
        background_url: userProfile.background_url || null,
        credits: Number(userProfile.credits || userProfile.post_credits_balance || 0),
        created_at: userProfile.created_at,
      },
      wallet: {
        current_balance: Number(wallet?.current_balance || 0),
        escrow_balance: Number(wallet?.escrow_balance || 0),
      },
      transactionsCount: transactionsCount || 0,
      totalPosts: totalPosts || 0,
      posts: posts || [],
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
