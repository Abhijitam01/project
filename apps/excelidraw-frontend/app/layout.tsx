import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./global.css"
import { ThemeProvider } from "@/components/theme-provider"
import { ThemeToggle } from "@/components/ThemeToggle"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Sketchy",
  description: "A Real-time multiuser drawing app.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} antialiased`}>
        <ThemeProvider>
          <ThemeToggle />
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
