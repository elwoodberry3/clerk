import { NextResponse } from "next/server";
import { demoEventSchema } from "@/lib/analytics/events";

const MAX_BYTES = 1024;

/**
 * POST /api/events
 * Receives first-party demo engagement beacons and writes them to structured logs
 * (Vercel Log Drains → your log store). No personal data is accepted or stored.
 */
export async function POST(request: Request) {
  const raw = await request.text();
  if (raw.length > MAX_BYTES) return new NextResponse(null, { status: 413 });

  let json: unknown;
  try {
    json = JSON.parse(raw);
  } catch {
    return new NextResponse(null, { status: 400 });
  }

  const parsed = demoEventSchema.safeParse(json);
  if (!parsed.success) return new NextResponse(null, { status: 422 });

  console.info(
    JSON.stringify({ type: "demo_event", at: new Date().toISOString(), ...parsed.data }),
  );
  return new NextResponse(null, { status: 204 });
}
