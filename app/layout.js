import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans", display: "swap" });

export const metadata = {
  title: "Playlist Bingo — music bingo sheets from a Spotify playlist",
  description: "Paste a public Spotify playlist link and generate printable music bingo sheets plus a master sheet.",
};

export const viewport = { themeColor: "#07151c" };

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="antialiased">{children}</body>
    </html>
  );
}
