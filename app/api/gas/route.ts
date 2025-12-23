export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { createPublicClient, http, formatUnits } from "viem";
import { base } from "viem/chains";

const RPC_URL = "https://mainnet.base.org";
const client = createPublicClient({ chain: base, transport: http(RPC_URL) });

export async function GET() {
  try {
    const wei = await client.getGasPrice();
    const gwei = formatUnits(wei, 9);
    return NextResponse.json(
      {
        chain: "base",
        gasPriceWei: wei.toString(),
        gasPriceGwei: gwei,
        fetchedAt: Date.now(),
      },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch gas price" },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  }
}
