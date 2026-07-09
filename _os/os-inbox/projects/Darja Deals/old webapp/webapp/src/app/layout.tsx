import type { Metadata } from "next";
import { Poppins, Lora, IBM_Plex_Sans_Arabic } from "next/font/google";
import "./globals.css";
import { LayoutWrapper } from "@/components/core/layout/LayoutWrapper";
import { FloatingSupportMenu } from "@/components/core/ui/floating-support-menu";
import { ToastProvider } from "@/components/core/ui/toast";
import { ThemeProvider } from "@/components/core/ui/theme-provider";
import { KeyboardShortcuts } from "@/components/core/ui/keyboard-shortcuts";
import { TooltipProvider } from "@/components/core/ui/tooltip";

// Anthropic Brand Typography
const poppins = Poppins({
  subsets: ["latin"],
  variable: "--font-poppins",
  weight: ["400", "500", "600", "700"],
});

const lora = Lora({
  subsets: ["latin"],
  variable: "--font-lora",
  weight: ["400", "500", "600", "700"],
});

const ibmPlexArabic = IBM_Plex_Sans_Arabic({
  variable: "--font-ibm-plex-arabic",
  subsets: ["arabic"],
  weight: ["100", "200", "300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "E-coma (E-commerce Administrator app)",
  description: "E-coma (E-commerce Administrator app) - Your All-in-One Business Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${poppins.variable} ${lora.variable} ${ibmPlexArabic.variable} antialiased`}>
        <ThemeProvider defaultTheme="system" storageKey="ecoma-theme">
          <ToastProvider>
            <TooltipProvider>
              <LayoutWrapper>
                {/* Silver Metallic Background Overlay */}
                <div
                  className="fixed inset-0 z-[-1] pointer-events-none opacity-40 dark:opacity-60 mix-blend-overlay bg-cover bg-center bg-no-repeat bg-fixed"
                  style={{ backgroundImage: "url('/images/backgrounds/silver-texture.png')" }}
                />
                {children}
              </LayoutWrapper>

              {/* Floating Support Menu - Global (Removed in favor of FloatingHelpWidget) */}
              {/* <FloatingSupportMenu
              whatsappNumber="212600000000"
              messengerUsername="riglify"
              telegramUsername="riglify_support"
            /> */}

              {/* Keyboard Shortcuts Modal - Press ? to open */}
              <KeyboardShortcuts />
            </TooltipProvider>
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
