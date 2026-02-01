import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./global.css"

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Sketchy",
  description: "A Real-time multiuser drawing app.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} antialiased`}>
        {children}
      </body>
    </html>
  );
}
