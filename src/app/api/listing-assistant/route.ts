import { NextResponse } from "next/server";
import { can, type AccountRole } from "@/lib/authorization";
import { buildListingAssistancePrompt, sanitizeAssistedDescription } from "@/lib/ai-listing-assistant";
import { getCurrentUser } from "@/lib/user-auth";

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const DEFAULT_MODEL = "deepseek/deepseek-v3.2";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Sign in to use writing assistance." }, { status: 401 });
  if (!can(user.role as AccountRole, "listing:create")) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const input = await request.json().catch(() => null);
  const prepared = buildListingAssistancePrompt(input ?? {});
  if (!prepared.ok) return NextResponse.json({ error: prepared.error }, { status: 400 });

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "Writing assistance is not configured." }, { status: 503 });

  try {
    const response = await fetch(OPENROUTER_URL, {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: process.env.OPENROUTER_LISTING_MODEL || DEFAULT_MODEL,
        messages: [{ role: "user", content: prepared.prompt }],
        temperature: 0.25,
        max_tokens: 260,
      }),
      signal: AbortSignal.timeout(15_000),
    });
    if (!response.ok) {
      console.error("Listing assistant provider error:", response.status);
      return NextResponse.json({ error: "Writing assistance is temporarily unavailable." }, { status: 502 });
    }
    const payload = await response.json() as { choices?: Array<{ message?: { content?: unknown } }> };
    const description = sanitizeAssistedDescription(payload.choices?.[0]?.message?.content);
    if (!description) return NextResponse.json({ error: "Writing assistance returned an invalid response." }, { status: 502 });
    return NextResponse.json({ description });
  } catch (error) {
    console.error("Listing assistant error:", error);
    return NextResponse.json({ error: "Writing assistance is temporarily unavailable." }, { status: 502 });
  }
}
