import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "业绩预增跟踪器",
  description: "自动跟踪连续预增股票并发送邮件通知",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
