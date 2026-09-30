import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "COGNIRA | AURION MOTORS",
  description: "Conversational business intelligence for AURION MOTORS."
};

export default function RootLayout({ children }: Readonly<{children: React.ReactNode}>) {
  return <html lang="en" data-scroll-behavior="smooth"><body>{children}</body></html>;
}
