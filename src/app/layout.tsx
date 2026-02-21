import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Academic Calendar Builder",
  description: "Build and manage your academic calendar with courses, holidays, and export options.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
