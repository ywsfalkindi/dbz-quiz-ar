import type { Metadata, Viewport } from "next";
import { Cairo } from "next/font/google";
import "./globals.css";

const cairo = Cairo({
  subsets: ["arabic"],
  variable: "--font-cairo",
  display: 'swap',
});

// إعدادات التطبيق والمتصفح
export const metadata: Metadata = {
  title: "تحدي دراغون كويز Z",
  description: "أثبت أنك أقوى محارب في الكون في لعبة الأسئلة هذه!",
  manifest: '/manifest.json', // ربط ملف الـ PWA
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: "DBZ Quiz",
  },
};

// منع التكبير والتصغير العشوائي في الموبايل
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#050505',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <body className={`${cairo.variable} font-sans antialiased bg-[#050505] overflow-hidden`}>
        {children}
      </body>
    </html>
  );
}