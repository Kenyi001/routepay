import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Web3Provider } from "@/context/Web3Context";
import { LanguageProvider } from "@/context/LanguageContext";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "RoutePay — Smart Logistics Escrow with Tangem NFC",
  description:
    "Cross-border freight escrow protocol on Avalanche with physical Tangem NFC tap release and Pollar QR on-ramp.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans">
        <Web3Provider>
          <LanguageProvider>
            {children}
          </LanguageProvider>
        </Web3Provider>
      </body>
    </html>
  );
}
