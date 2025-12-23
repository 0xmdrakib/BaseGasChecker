import { NextResponse } from "next/server";
import { promises as fs } from "node:fs";
import path from "node:path";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const p = path.join(process.cwd(), "public", ".well-known", "farcaster.json");
    const raw = await fs.readFile(p, "utf8");
    return new NextResponse(raw, {
      status: 200,
      headers: {
        "content-type": "application/json; charset=utf-8",
        "cache-control": "no-store",
      },
    });
  } catch {
    return NextResponse.json({ error: "manifest not found" }, { status: 404 });
  }
}
