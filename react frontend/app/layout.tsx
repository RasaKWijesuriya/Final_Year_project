import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "VBKit Vibration Prediction System",
  description:
    "VBKit is a  system that accurately predicts vibration status based on sensor data",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <main className="p-12 space-y-6">{children}</main>
        <Toaster />
      </body>
    </html>
  );
}
