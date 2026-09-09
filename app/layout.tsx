import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Crossly — Make a puzzle worth sharing", template: "%s · Crossly" },
  description: "Create, share, and solve beautifully crafted custom crosswords.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
