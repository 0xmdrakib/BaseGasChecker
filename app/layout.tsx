import type { Metadata } from "next";
import "./globals.css";

const APP_URL = "https://base-gas-checker.vercel.app";
const BASE_APP_ID = "6946d047d19763ca26ddc710"; // from Base Build modal

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: "Base Gas Checker",
  description: "Live Base L2 gas with a quick gauge and a tiny history trail.",
  other: {
    "base:app_id": BASE_APP_ID,
  
    // Required for Base app embed rendering on the homeUrl page
    "fc:miniapp": JSON.stringify({
      version: "next",
      imageUrl: `${APP_URL}/hero.png`, // 3:2 recommended (1200x630)
      button: {
        title: "Open Base Gas Checker",
        action: {
          type: "launch_frame",
          url: APP_URL,
        },
      },
    }),
    "fc:frame": JSON.stringify({
      version: "next",
      imageUrl: `${APP_URL}/hero.png`, // 3:2 recommended (1200x630)
      button: {
        title: "Open Base Gas Checker",
        action: {
          type: "launch_frame",
          url: APP_URL,
        },
      },
    }),
},
  openGraph: {
    title: "Base Gas Checker",
    description: "Check Base gas price instantly with a gauge and micro-trend.",
    url: APP_URL,
    images: [{ url: "/hero.png" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Base Gas Checker",
    description: "Check Base gas price instantly with a gauge and micro-trend.",
    images: ["/hero.png"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
