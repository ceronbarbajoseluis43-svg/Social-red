/**
 * API Middleware - Social Red
 * Validates all API requests with authentication and rate limiting
 */

import { NextRequest, NextResponse } from "next/server";
import { validateAPIKey, checkRateLimit, extractAPIKey, getRateLimitStatus } from "@/lib/apiKeyValidator";
import { createClient } from "./server";

export interface AuthenticatedRequest extends NextRequest {
  apiKey?: string;
  userId?: string;
}

/**
 * Middleware to validate API requests
 */
export async function apiAuthMiddleware(request: NextRequest) {
  const apiKey = extractAPIKey(request);

  // Validate API Key
  const validation = validateAPIKey(apiKey);
  if (!validation.valid) {
    return NextResponse.json(
      { error: validation.error },
      { status: 401 }
    );
  }

  // Check rate limit
  if (!checkRateLimit(validation.apiKey!)) {
    const status = getRateLimitStatus(validation.apiKey!);
    return NextResponse.json(
      { error: "Rate limit exceeded", retryAfter: status.reset },
      {
        status: 429,
        headers: {
          "Retry-After": String(Math.ceil((status.reset - Date.now()) / 1000)),
        },
      }
    );
  }

  return null; // Request is valid
}

/**
 * Get authenticated user from Supabase
 */
export async function getAuthenticatedUser(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}
