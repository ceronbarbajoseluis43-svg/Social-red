/**
 * Health Check Endpoint
 * GET /api/health
 */

import { NextRequest, NextResponse } from "next/server";
import { apiAuthMiddleware } from "@/utils/supabase/apiMiddleware";

export async function GET(request: NextRequest) {
  // Validate API key
  const authError = await apiAuthMiddleware(request);
  if (authError) return authError;

  return NextResponse.json(
    {
      status: "ok",
      timestamp: new Date().toISOString(),
      version: "1.0.0",
    },
    { status: 200 }
  );
}
