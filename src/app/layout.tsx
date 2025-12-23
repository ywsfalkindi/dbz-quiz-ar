import type { Metadata, Viewport } from "next";
import { Cairo } from "next/font/google";
import "./globals.css";
import { getGameConfig } from "./actions/adminActions"; // سنحتاج دالة لجلب الإعدادات

const cairo = Cairo({
  subsets: ["arabic"],
  variable: "--font-cairo",
  display: 'swap',
});

export const metadata: Metadata = {
  title: "تحدي دراغون كويز Z",
  description: "أثبت أنك أقوى محارب في الكون في لعبة الأسئلة هذه!",
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: "DBZ Quiz",
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#050505',
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // جلب الإعدادات من السيرفر مباشرة لتطبيق الألوان
  const config = await getGameConfig();
  const primaryColor = config.theme?.primaryColor || '#F85B1A';
  
  return (
    <html lang="ar" dir="rtl">
      <head>
        {/* حقن الألوان الديناميكية هنا */}
        <style>{`
          :root {
            --primary-color: ${primaryColor};
            --secondary-color: ${config.theme?.secondaryColor || '#FFD600'};
          }
          .text-dbz-orange { color: var(--primary-color) !important; }
          .bg-dbz-orange { background-color: var(--primary-color) !important; }
        `}</style>
      </head>
      <body className={`${cairo.variable} font-sans antialiased bg-[#050505] overflow-hidden`}>
        {children}
      </body>
    </html>
  );
}