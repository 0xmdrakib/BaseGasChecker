import type { Metadata } from "next";
import "./globals.css";

// NOTE: Keep this a valid absolute URL so embeds work in production.
// You can set NEXT_PUBLIC_APP_URL in Vercel. Trailing slash is removed.
const RAW_APP_URL = process.env.NEXT_PUBLIC_APP_URL?.trim();
const APP_URL = (RAW_APP_URL && /^https?:\/\//.test(RAW_APP_URL) ? RAW_APP_URL : "https://basegaschecker.vercel.app").replace(/\/$/, "");
const BASE_APP_ID = "6946d047d19763ca26ddc710"; // from Base Build modal

const miniappEmbed = {
  version: "next",
  imageUrl: `${APP_URL}/hero.png`,
  button: {
    title: "Open",
    action: {
      type: "launch_frame",
      url: APP_URL,
    },
  },
};

export const metadata: Metadata = {
  title: "Base Gas Checker",
  description: "Live Base L2 gas with a quick gauge and a tiny history trail.",
  other: {
    "base:app_id": BASE_APP_ID,

    // Base/Farcaster mini app embed
    "fc:miniapp": JSON.stringify(miniappEmbed),

    // Back-compat (some clients still read fc:frame)
    "fc:frame": JSON.stringify(miniappEmbed),
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
