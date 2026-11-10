import "./globals.css";
import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "KDX | Khātunganj Digital DO Exchange",
  description: "Digital marketplace for Khātunganj traders."
};
export default function RootLayout({ children }: Readonly<{children: React.ReactNode}>) {
  return <html lang="en"><body>{children}</body></html>;
}
