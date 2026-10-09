/**
 * API Key Validator - Social Red
 * Provides secure validation for API requests
 */

const VALID_API_KEYS = [
  process.env.NEXT_PUBLIC_API_KEY,
  "dev_social_red_2024_test_key",
];

const RATE_LIMIT_MAP = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 30;

export interface ValidationResult {
  valid: boolean;
  error?: string;
  apiKey?: string;
}

/**
 * Validate API Key from request headers
 * @param apiKey - The API key to validate
 * @returns ValidationResult object
 */
export function validateAPIKey(apiKey: string | undefined): ValidationResult {
  if (!apiKey) {
    return {
      valid: false,
      error: "API Key is required",
    };
  }

  if (!VALID_API_KEYS.includes(apiKey)) {
    return {
      valid: false,
      error: "Invalid API Key",
    };
  }

  return {
    valid: true,
    apiKey,
  };
}

/**
 * Check rate limit for API key
 * @param apiKey - The API key to check
 * @returns true if within limits, false if exceeded
 */
export function checkRateLimit(apiKey: string): boolean {
  const now = Date.now();
  const limiter = RATE_LIMIT_MAP.get(apiKey);

  if (!limiter || now > limiter.resetAt) {
    // Reset or initialize
    RATE_LIMIT_MAP.set(apiKey, {
      count: 1,
      resetAt: now + RATE_LIMIT_WINDOW,
    });
    return true;
  }

  if (limiter.count >= RATE_LIMIT_MAX_REQUESTS) {
    return false;
  }

  limiter.count++;
  return true;
}

/**
 * Extract API Key from request
 * @param request - NextRequest or standard Request
 * @returns The API key or undefined
 */
export function extractAPIKey(request: Request): string | undefined {
  // Check header
  const headerKey = request.headers.get("x-api-key");
  if (headerKey) return headerKey;

  // Check authorization bearer token (alternative method)
  const authHeader = request.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.slice(7);
  }

  return undefined;
}

/**
 * Get rate limit status
 */
export function getRateLimitStatus(apiKey: string) {
  const limiter = RATE_LIMIT_MAP.get(apiKey);
  if (!limiter) {
    return {
      used: 0,
      remaining: RATE_LIMIT_MAX_REQUESTS,
      reset: Date.now() + RATE_LIMIT_WINDOW,
    };
  }

  return {
    used: limiter.count,
    remaining: Math.max(0, RATE_LIMIT_MAX_REQUESTS - limiter.count),
    reset: limiter.resetAt,
  };
}
