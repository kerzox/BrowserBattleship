import type { Metadata } from "next";
import { IBM_Plex_Sans, IBM_Plex_Mono, Fira_Code } from "next/font/google";
import "./globals.css";

const ibm = IBM_Plex_Sans({
  weight: ["400", "500", "600", "700"],
  variable: "--font-ibm",
  subsets: ["latin"],
});

const ibmMono = IBM_Plex_Mono({
  weight: ["400", "500", "600", "700"],
  variable: "--font-ibm-mono",
  subsets: ["latin"],
});

const firaCode = Fira_Code({
  variable: "--font-fira-code",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Browser Battleship",
  description: "A browser-based battleship game",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en'>
      <body
        className={`${ibm.variable} ${firaCode.variable} ${ibmMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
