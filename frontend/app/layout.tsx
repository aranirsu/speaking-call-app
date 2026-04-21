import "./globals.css";
import { CallProvider } from "@/context/CallContext";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "SpeakFlow - Practice Speaking with Real People",
  description: "Connect with language partners worldwide for real-time speaking practice",
  icons: {
    icon: "/favicon.ico",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#FAFAFA",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="bg-background">
      <body className={`${inter.className} min-h-screen bg-background text-foreground antialiased`}>
        <CallProvider>{children}</CallProvider>
      </body>
    </html>
  );
}
