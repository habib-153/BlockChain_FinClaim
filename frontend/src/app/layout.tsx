import type { Metadata } from "next";
import { AppDataProvider } from "@/components/providers/AppDataProvider";
import { SessionProvider } from "@/components/providers/SessionProvider";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: "FinClaim",
  description:
    "A permissioned, regulator-supervised receivable-claim registry for trade finance.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <SessionProvider>
          <AppDataProvider>
            {children}
            <Toaster position="top-right" />
          </AppDataProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
