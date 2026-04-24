import type { Metadata } from "next";
import { Outfit, Playfair_Display } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-sans",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-serif",
});

export const metadata: Metadata = {
  title: "Vendôme Beauty & Spa",
  description: "An exclusive experience of beauty and wellness.",
  icons: {
    icon: "/ico.png",
    apple: "/ico.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Vendôme Beauty",
  },
};

import { LanguageProvider } from "@/lib/LanguageContext";
import { ApolloWrapper } from "@/components/ApolloWrapper";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${outfit.variable} ${playfair.variable}`}>
        <ApolloWrapper>
          <LanguageProvider>
            {children}
          </LanguageProvider>
        </ApolloWrapper>
      </body>
    </html>
  );
}
