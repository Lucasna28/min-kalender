import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  try {
    const res = NextResponse.next();
    const supabase = createMiddlewareClient({ req, res });

    const {
      data: { session },
    } = await supabase.auth.getSession();

    // Hvis brugeren ikke er logget ind og prøver at tilgå beskyttede ruter
    if (!session && req.nextUrl.pathname !== "/login") {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    // Hvis brugeren er logget ind og prøver at tilgå login siden
    if (session && req.nextUrl.pathname === "/login") {
      return NextResponse.redirect(new URL("/calendar", req.url));
    }

    // Tilføj session info til response headers for debugging
    res.headers.set(
      "x-session-status",
      session ? "authenticated" : "unauthenticated",
    );

    return res;
  } catch (error) {
    console.error("Middleware error:", error);
    // Ved fejl, redirect til login med fejl parameter
    const errorUrl = new URL("/login", req.url);
    errorUrl.searchParams.set("error", "auth_error");
    return NextResponse.redirect(errorUrl);
  }
}

// Angiv hvilke ruter middleware skal køre på
export const config = {
  matcher: [
    "/calendar",
    "/calendar/(.*)",
    "/login",
    "/api/(.*)",
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
