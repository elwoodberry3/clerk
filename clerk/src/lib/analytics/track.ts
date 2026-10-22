"use client";

import type { DemoEvent } from "@/lib/analytics/events";

/** Fire-and-forget event beacon. Never throws, never blocks the UI. */
export function track(event: DemoEvent): void {
  try {
    const body = JSON.stringify(event);
    if (typeof navigator !== "undefined" && "sendBeacon" in navigator) {
      navigator.sendBeacon("/api/events", new Blob([body], { type: "application/json" }));
      return;
    }
    void fetch("/api/events", {
      method: "POST",
      body,
      headers: { "content-type": "application/json" },
      keepalive: true,
    }).catch(() => undefined);
  } catch {
    // Analytics must never affect the demo.
  }
}
