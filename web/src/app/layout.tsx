import type { Metadata } from "next";
import { Archivo, Big_Shoulders, Martian_Mono } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Providers } from "./providers";

const archivo = Archivo({ subsets: ["latin"], variable: "--font-archivo" });
const bigShoulders = Big_Shoulders({
  subsets: ["latin"],
  variable: "--font-big-shoulders",
});
const martianMono = Martian_Mono({
  subsets: ["latin"],
  variable: "--font-martian-mono",
});

export const metadata: Metadata = {
  title: "adjacent — Monad DeFi Copilot",
  description:
    "See every DeFi position across the Monad ecosystem and understand every risk in plain English.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn(
        "dark h-full antialiased",
        archivo.variable,
        bigShoulders.variable,
        martianMono.variable,
      )}
    >
      <body className="min-h-dvh bg-background font-sans text-foreground">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
