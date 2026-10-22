import { NextResponse, type NextRequest } from "next/server";

/**
 * Optional access gate for prospect demos.
 *
 * When DEMO_ACCESS_KEY is unset, demos are open (still noindex and never linked publicly).
 * When set, the first visit must carry ?key=<value>; the proxy then sets a 30-day HttpOnly
 * cookie and redirects to the clean URL so the key never lingers in the address bar.
 */
const COOKIE = "tca_demo_access";

async function sha256(value: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, "0")).join("");
}

export async function proxy(request: NextRequest) {
  const key = process.env.DEMO_ACCESS_KEY;
  if (!key) return NextResponse.next();

  const expected = await sha256(key);
  if (request.cookies.get(COOKIE)?.value === expected) return NextResponse.next();

  const provided = request.nextUrl.searchParams.get("key");
  if (provided && (await sha256(provided)) === expected) {
    const clean = request.nextUrl.clone();
    clean.searchParams.delete("key");
    const response = NextResponse.redirect(clean);
    response.cookies.set(COOKIE, expected, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/demo",
      maxAge: 60 * 60 * 24 * 30,
    });
    return response;
  }

  return new NextResponse(
    "This demo link has expired or is incomplete. Contact Adbyrd for a new link.",
    {
      status: 401,
      headers: { "content-type": "text/plain; charset=utf-8", "x-robots-tag": "noindex" },
    },
  );
}

export const config = {
  matcher: "/demo/:path*",
};
