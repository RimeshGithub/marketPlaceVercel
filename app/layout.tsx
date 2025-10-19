import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import { Header } from "@/components/header"

const geistSans = Geist({
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "Marketplace - Buy and Sell Products",
  description: "A modern marketplace for buying and selling products",
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.className} antialiased`}>
        <Header />
        <div className="px-10 max-md:px-5 bg-gradient-to-b from-primary/10 to-background">{children}</div>
      </body>
    </html>
  )
}
