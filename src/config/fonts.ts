import { Inter, Playfair_Display } from "next/font/google";

/** Body text. Exposed as --font-inter, mapped to Tailwind font-sans (see globals.css). */
export const fontSans = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

/** Headings / editorial accents. Exposed as --font-playfair, mapped to Tailwind font-display. */
export const fontDisplay = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});
