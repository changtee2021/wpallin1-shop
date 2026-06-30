import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

type RateLimitOptions = {
  requests: number;
  window: `${number} s` | `${number} m` | `${number} h`;
};

type EnforceRateLimitOptions = RateLimitOptions & {
  /** When true (default in production), missing Redis rejects the request. */
  requiredInProduction?: boolean;
};

const limiterCache = new Map<string, Ratelimit>();

function getRedis(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
}

function isProductionEnv(): boolean {
  return (
    process.env.VERCEL_ENV === "production" ||
    process.env.NODE_ENV === "production"
  );
}

function getLimiter(options: RateLimitOptions): Ratelimit | null {
  const redis = getRedis();
  if (!redis) return null;

  const cacheKey = `${options.requests}:${options.window}`;
  const cached = limiterCache.get(cacheKey);
  if (cached) return cached;

  const limiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(options.requests, options.window),
    prefix: "wpallin1-shop",
  });
  limiterCache.set(cacheKey, limiter);
  return limiter;
}

export class RateLimitError extends Error {
  constructor(message = "Too many requests") {
    super(message);
    this.name = "RateLimitError";
  }
}

export class RateLimitUnavailableError extends Error {
  constructor(message = "Service temporarily unavailable") {
    super(message);
    this.name = "RateLimitUnavailableError";
  }
}

export async function enforceRateLimit(
  scope: string,
  identifier: string,
  options: EnforceRateLimitOptions = { requests: 5, window: "1 m" },
): Promise<void> {
  const { requiredInProduction = true, ...limiterOptions } = options;
  const limiter = getLimiter(limiterOptions);

  if (!limiter) {
    if (requiredInProduction && isProductionEnv()) {
      throw new RateLimitUnavailableError();
    }
    return;
  }

  const key = `${scope}:${identifier}`;
  const { success } = await limiter.limit(key);
  if (!success) {
    throw new RateLimitError();
  }
}

export function getClientIp(request: Request): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown"
  );
}
