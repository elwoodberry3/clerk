import { describe, expect, it } from "vitest";
import { POST as events } from "@/app/api/events/route";
import { POST as deadline } from "@/app/api/foia/deadline/route";
import { GET as health } from "@/app/api/health/route";

const post = (body: unknown) =>
  new Request("http://localhost/api", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });

describe("POST /api/foia/deadline", () => {
  it("returns deadlines with citations", async () => {
    const res = await deadline(post({ submittedOn: "2026-11-20", channel: "email" }));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.responseDueOn).toBe("2026-12-01");
    expect(json.rulesPack.state).toBe("MI");
    expect(json.citations.length).toBeGreaterThan(0);
  });

  it("rejects malformed JSON", async () => {
    expect((await deadline(post("{nope"))).status).toBe(400);
  });

  it("rejects invalid dates and unknown fields", async () => {
    expect((await deadline(post({ submittedOn: "2026-02-30", channel: "email" }))).status).toBe(
      422,
    );
    expect(
      (await deadline(post({ submittedOn: "2026-11-20", channel: "email", extra: 1 }))).status,
    ).toBe(422);
  });

  it("returns 422 when spam discovery precedes submission", async () => {
    const res = await deadline(
      post({ submittedOn: "2026-11-20", channel: "email", discoveredInSpamOn: "2026-11-19" }),
    );
    expect(res.status).toBe(422);
  });
});

describe("POST /api/events", () => {
  it("accepts a known event", async () => {
    expect(
      (await events(post({ name: "demo_opened", tenant: "cooper-charter-township" }))).status,
    ).toBe(204);
  });

  it("rejects free text and unknown events", async () => {
    expect((await events(post({ name: "demo_opened", detail: "Jane Doe 555-1212" }))).status).toBe(
      422,
    );
    expect((await events(post({ name: "anything" }))).status).toBe(422);
  });

  it("rejects oversized payloads", async () => {
    expect((await events(post("x".repeat(2000)))).status).toBe(413);
  });
});

describe("GET /api/health", () => {
  it("reports ok and the rules pack", async () => {
    const json = await health().json();
    expect(json.status).toBe("ok");
    expect(json.rulesPack.version).toMatch(/^\d{4}\.\d{2}\.\d+$/);
  });
});
