import type { Metadata } from "next";

import localFont from "next/font/local";
import { ReactNode } from "react";
import "./globals.css";

const pretendard = localFont({
  src: "../node_modules/pretendard/dist/web/variable/woff2/PretendardVariable.woff2",
  variable: "--font-pretendard",
  weight: "45 920",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://yeonju-number-baseball.vercel.app"),
  title: "숫자야구",
  description:
    "0~9 숫자 중 4개를 골라 스트라이크와 볼로 숫자를 맞추는 추리 게임",
  openGraph: {
    title: "숫자야구",
    description:
      "0~9 숫자 중 4개를 골라 스트라이크와 볼로 숫자를 맞추는 추리 게임",
    type: "website",
    siteName: "숫자야구",
  },
  twitter: {
    card: "summary_large_image",
    title: "숫자야구",
    description:
      "0~9 숫자 중 4개를 골라 스트라이크와 볼로 숫자를 맞추는 추리 게임",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className={`${pretendard.variable} antialiased`}>{children}</body>
    </html>
  );
}
