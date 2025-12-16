import "./globals.css";
import { CallProvider } from "@/context/CallContext";

export const metadata = {
  title: "SpeakFlow - Practice Speaking with Real People",
  description: "Connect with language partners worldwide for real-time speaking practice",
  icons: {
    icon: "🎙️",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-[#0f0f23] text-white antialiased">
        <CallProvider>{children}</CallProvider>
      </body>
    </html>
  );
}
