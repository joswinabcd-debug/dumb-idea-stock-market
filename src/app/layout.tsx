import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AppContextProvider } from "../context/AppContext";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import FakeMarketTicker from "../components/FakeMarketTicker";
import FunEffects from "../components/FunEffects";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Dumb Idea Exchange",
  description: "The venture capital stock exchange for ideas that should have stayed in the shower.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`dark ${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-neutral-950 text-neutral-100 transition-colors duration-300">
        <AppContextProvider>
          <FunEffects />
          <Navbar />
          <FakeMarketTicker />
          <main className="flex-grow">{children}</main>
          <Footer />
        </AppContextProvider>
      </body>
    </html>
  );
}
