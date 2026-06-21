import type { Metadata } from "next";
import { Cormorant_Garamond, Inter, Syne } from "next/font/google";
import { Header } from "../components/Header";
import { LoadingScreen } from "../components/LoadingScreen";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-cormorant",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const syne = Syne({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-syne",
});

export const metadata: Metadata = {
  title: "permia | Portfolio",
  description: "A visual atmosphere of journeys in life",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${cormorant.variable} ${inter.variable} ${syne.variable} font-base antialiased bg-[#EFF2ED] text-[#111111] overflow-hidden w-screen h-screen`}
      >
        <LoadingScreen />
        <Header />
        {children}
      </body>
    </html>
  );
}
