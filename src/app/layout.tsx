import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import { AppStateProvider } from "@/context/AppStateContext";
import Header from "@/components/Layout/Header";
import Footer from "@/components/Layout/Footer";
import FloatingActions from "@/components/Layout/FloatingActions";
import AIAssistant from "@/components/AI/AIAssistant";
import AuthModalContainer from "@/components/Property/AuthModalContainer";
import Script from "next/script";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
  fallback: ["system-ui", "arial"],
});

export const metadata: Metadata = {
  title: "Zameen Gem | Premier Property Advisors",
  description: "Buy, Sell & Invest in DHA Bahawalpur, DHA Multan, DHA Lahore, DHA Islamabad, and Bahria Town Projects. Guided by CEO Waqas Ahmad Chaudhary.",
  keywords: ["DHA Bahawalpur", "DHA Multan", "DHA Lahore", "Zameen Gem", "Bahawalpur Real Estate", "Real Estate Pakistan", "Waqas Ahmad Chaudhary"],
  authors: [{ name: "Waqas Ahmad Chaudhary" }],
  openGraph: {
    type: "website",
    locale: "en_PK",
    url: "https://zameengem.com",
    title: "Zameen Gem - Trusted Property Partner",
    description: "Expert advice on DHA Bahawalpur and premier projects. Get interactive sector maps, calculators, and AI assistance.",
    siteName: "Zameen Gem",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full scroll-smooth" suppressHydrationWarning>
      <body className={`${outfit.variable} font-sans min-h-full flex flex-col antialiased`} suppressHydrationWarning>
        {process.env.NODE_ENV === "development" && (
          <Script
            id="suppress-hydration-errors"
            strategy="beforeInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                (function() {
                  const originalError = console.error;
                  console.error = function(...args) {
                    const msg = typeof args[0] === 'string' ? args[0] : '';
                    if (
                      msg.includes('Hydration failed') || 
                      msg.includes('hydration-error') || 
                      msg.includes('attributes of the server rendered HTML') ||
                      msg.includes('does not match parent')
                    ) {
                      const html = document.documentElement;
                      if (
                        html.classList.contains('urdu-nastaliq-enabled') || 
                        html.getAttribute('style')?.includes('--urdu')
                      ) {
                        return; // Suppress Urdu Nastaliq extension hydration errors
                      }
                    }
                    originalError.apply(console, args);
                  };
                })();
              `,
            }}
          />
        )}
        <AppStateProvider>
          <Header />
          <main className="flex-grow">
            {children}
          </main>
          <Footer />
          <FloatingActions />
          <AIAssistant />
          <AuthModalContainer />
        </AppStateProvider>
      </body>
    </html>
  );
}
