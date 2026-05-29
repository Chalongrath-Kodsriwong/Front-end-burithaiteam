import { NextRequest, NextResponse } from "next/server";

const BACKEND_API_URL = process.env.BACKEND_API_URL || "http://localhost:5001";

const TIMEOUT_MS = 15_000;
const MAX_BODY_BYTES = 5 * 1024 * 1024; // 5MB

/* ──────────────────────────────────────────────────────────
   Simple sliding-window rate limiter (per IP, in-memory)
   100 requests / 60 seconds per IP
────────────────────────────────────────────────────────── */
const RATE_LIMIT = 100;
const RATE_WINDOW_MS = 60_000;

const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

function getClientIp(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitStore.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitStore.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return false;
  }

  entry.count += 1;
  if (entry.count > RATE_LIMIT) return true;
  return false;
}

// Periodically clean up expired entries to avoid memory leak
setInterval(() => {
  const now = Date.now();
  for (const [ip, entry] of rateLimitStore) {
    if (now > entry.resetAt) rateLimitStore.delete(ip);
  }
}, RATE_WINDOW_MS);

/* ──────────────────────────────────────────────────────────
   Proxy
────────────────────────────────────────────────────────── */
function buildTargetUrl(path: string[], search: string) {
  return `${BACKEND_API_URL}/api/${path.join("/")}${search}`;
}

async function proxyRequest(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  // Rate limit check
  const ip = getClientIp(request);
  if (isRateLimited(ip)) {
    return NextResponse.json(
      { message: "Too many requests, please slow down" },
      { status: 429, headers: { "Retry-After": "60" } },
    );
  }

  // Block oversized request bodies
  const contentLength = request.headers.get("content-length");
  if (contentLength && parseInt(contentLength) > MAX_BODY_BYTES) {
    return NextResponse.json({ message: "Request too large" }, { status: 413 });
  }

  const { path } = await context.params;
  const targetUrl = buildTargetUrl(path, request.nextUrl.search);

  // Forward only safe, necessary request headers
  const headers = new Headers();
  for (const key of ["content-type", "accept", "accept-language", "authorization", "cookie"]) {
    const val = request.headers.get(key);
    if (val) headers.set(key, val);
  }
  // All requests through this proxy are trusted — satisfy backend CSRF check
  headers.set("x-requested-with", "XMLHttpRequest");

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  const init: RequestInit = {
    method: request.method,
    headers,
    redirect: "manual",
    signal: controller.signal,
  };

  if (request.method !== "GET" && request.method !== "HEAD") {
    init.body = await request.arrayBuffer();
  }

  try {
    const upstream = await fetch(targetUrl, init);
    clearTimeout(timer);

    // Forward only safe response headers
    const responseHeaders = new Headers();
    for (const key of ["content-type", "content-length", "cache-control", "set-cookie", "location", "etag", "last-modified"]) {
      const val = upstream.headers.get(key);
      if (val) responseHeaders.set(key, val);
    }

    responseHeaders.set("X-Content-Type-Options", "nosniff");
    responseHeaders.set("X-Frame-Options", "DENY");

    return new Response(upstream.body, {
      status: upstream.status,
      statusText: upstream.statusText,
      headers: responseHeaders,
    });
  } catch (error: any) {
    clearTimeout(timer);
    const isTimeout = error?.name === "AbortError";
    console.error("API proxy error:", isTimeout ? "timeout" : error?.message);
    return NextResponse.json(
      { message: isTimeout ? "Backend request timed out" : "Backend API unreachable" },
      { status: isTimeout ? 504 : 502 },
    );
  }
}

export async function GET(req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) { return proxyRequest(req, ctx); }
export async function POST(req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) { return proxyRequest(req, ctx); }
export async function PUT(req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) { return proxyRequest(req, ctx); }
export async function PATCH(req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) { return proxyRequest(req, ctx); }
export async function DELETE(req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) { return proxyRequest(req, ctx); }
export async function OPTIONS(req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) { return proxyRequest(req, ctx); }
export async function HEAD(req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) { return proxyRequest(req, ctx); }
