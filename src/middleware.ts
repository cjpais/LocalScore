import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // Skip all checks in development mode
  if (process.env.NODE_ENV === "development") {
    return NextResponse.next();
  }

  // Regular middleware logic for production
  const referer = request.headers.get("referer");
  const origin = request.headers.get("origin");

  const allowedOrigins = [
    "https://localscore.org",
    "https://www.localscore.org",
    "https://localscore.ai",
    "https://www.localscore.ai",
    "https://localscore.vercel.app",
  ];

  if (process.env.VERCEL_URL) {
    console.log("vercel url", process.env.VERCEL_URL);
    allowedOrigins.push(`https://${process.env.VERCEL_URL}`);
  }

  const sourceOrigin = referer || origin;
  if (
    !sourceOrigin ||
    !allowedOrigins.some((origin) => sourceOrigin.startsWith(origin))
  ) {
    return new NextResponse(JSON.stringify({ error: "Access forbidden" }), {
      status: 403,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/api/search",
};
