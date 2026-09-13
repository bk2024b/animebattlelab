import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";

// Self-hosted via next/font: no external request at runtime, no CLS.
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://animebattlelab.com"),
  title: {
    default: "Anime Battle Lab — Who Really Wins?",
    template: "%s | Anime Battle Lab",
  },
  description:
    "Debate anime matchups, build tier lists and prove your scaling.",
  openGraph: {
    type: "website",
    siteName: "Anime Battle Lab",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${spaceGrotesk.variable} h-full`}
    >
      <body className="min-h-full flex flex-col bg-bg text-text-primary">
        {children}
      </body>
    </html>
  );
}
