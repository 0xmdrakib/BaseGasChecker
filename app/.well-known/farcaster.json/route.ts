import { readFile } from "fs/promises";
import path from "path";

export const runtime = "nodejs";

export async function GET() {
  const filePath = path.join(process.cwd(), "public", ".well-known", "farcaster.json");
  const raw = await readFile(filePath, "utf-8");
  return new Response(raw, {
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}
