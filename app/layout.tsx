import type { Metadata } from "next";
import "./globals.css";

// IMPORTANT: APP_URL must be a valid absolute https URL in production.
// We keep a safe fallback so Vercel builds never fail even if you forget to edit it.
const APP_URL = (process.env.NEXT_PUBLIC_APP_URL || "").replace(/\/$/, "");
const BASE_APP_ID = "6946d047d19763ca26ddc710";

const embedMiniapp = {
  version: "1",
  imageUrl: `${APP_URL}/hero.png`,
  button: {
    title: "Open Gas Checker",
    action: {
      type: "launch_miniapp",
      name: "Base Gas Checker",
      url: APP_URL,
      splashImageUrl: `${APP_URL}/splash.png`,
      splashBackgroundColor: "#0b0d12",
    },
  },
};

const embedFrameCompat = {
  ...embedMiniapp,
  button: {
    ...embedMiniapp.button,
    action: {
      ...embedMiniapp.button.action,
      type: "launch_frame",
    },
  },
};

export const metadata: Metadata = {
  // Do NOT use new URL("") — Vercel type-check/build will crash. Always keep this valid.
  metadataBase: new URL(APP_URL),
  title: "Base Gas Checker",
  description: "Live Base L2 gas with a quick gauge and a tiny history trail.",
  other: {
    "base:app_id": BASE_APP_ID,
    // Embeds (shareable rich cards)
    "fc:miniapp": JSON.stringify(embedMiniapp),
    // Backward compatibility
    "fc:frame": JSON.stringify(embedFrameCompat),
  },
  openGraph: {
    title: "Base Gas Checker",
    description: "Check Base gas price instantly with a gauge and micro-trend.",
    url: APP_URL,
    images: [`${APP_URL}/hero.png`],
  },
  twitter: {
    card: "summary_large_image",
    title: "Base Gas Checker",
    description: "Check Base gas price instantly with a gauge and micro-trend.",
    images: [`${APP_URL}/hero.png`],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
