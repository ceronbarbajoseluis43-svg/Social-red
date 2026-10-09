/**
 * Posts API Endpoint
 * GET /api/posts - Fetch posts
 * POST /api/posts - Create post (requires auth)
 */

import { NextRequest, NextResponse } from "next/server";
import { apiAuthMiddleware, getAuthenticatedUser } from "@/utils/supabase/apiMiddleware";
import { createClient } from "@/utils/supabase/server";

export async function GET(request: NextRequest) {
  try {
    // Validate API key
    const authError = await apiAuthMiddleware(request);
    if (authError) return authError;

    const supabase = await createClient();

    const { data: posts, error } = await supabase
      .from("posts")
      .select(
        `
        id,
        content,
        image_url,
        created_at,
        user_id,
        profiles (username, avatar_url)
      `
      )
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data: posts }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Validate API key
    const authError = await apiAuthMiddleware(request);
    if (authError) return authError;

    // Get authenticated user
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { content, image_url } = body;

    if (!content && !image_url) {
      return NextResponse.json(
        { error: "Content or image_url is required" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    const { data: post, error } = await supabase
      .from("posts")
      .insert({
        user_id: user.id,
        content,
        image_url,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data: post }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
