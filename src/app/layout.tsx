import type { Metadata } from "next";
import { Tajawal, Playfair_Display } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";

const tajawal = Tajawal({
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "500", "700", "900"],
  variable: "--font-tajawal",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800", "900"],
  style: ["normal", "italic"],
  variable: "--font-playfair",
  display: "swap",
});

export const metadata: Metadata = {
  title: "لوحة تحكم Ladies Glows",
  description: "لوحة تحكم خاصة بصاحبة متجر Ladies Glows",
  icons: { icon: "/logo.png" },
  robots: { index: false, follow: false },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" className={`${tajawal.variable} ${playfair.variable}`}>
      <body className="font-body min-h-screen bg-brand-50 antialiased">
        {children}
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 3000,
            style: {
              background: "#ffffff",
              color: "#3d1a5c",
              border: "1px solid #f3edff",
              borderRadius: "16px",
              padding: "12px 18px",
              fontFamily: "var(--font-tajawal)",
              boxShadow: "0 10px 30px -10px rgba(147,51,234,0.35)",
            },
            success: { iconTheme: { primary: "#9333ea", secondary: "#fff" } },
            error: { iconTheme: { primary: "#ec4899", secondary: "#fff" } },
          }}
        />
      </body>
    </html>
  );
}
