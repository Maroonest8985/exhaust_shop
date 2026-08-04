import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host") ?? "localhost:3000";
  const protocol = requestHeaders.get("x-forwarded-proto") ?? (host.includes("localhost") ? "http" : "https");
  const origin = `${protocol}://${host}`;

  return {
    metadataBase: new URL(origin),
    title: {
      default: "Taibosi Exhaust Korea | Precision Fit",
      template: "%s | Taibosi Exhaust Korea",
    },
    description: "차량 적합성, 재고 유형, 장착 상담을 한 번에 확인하는 프리미엄 배기 시스템 커머스 데모입니다.",
    icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
    openGraph: {
      title: "Taibosi Exhaust Korea",
      description: "Precision Fit, Confident Performance",
      type: "website",
      locale: "ko_KR",
      images: [{ url: `${origin}/og.png`, width: 1672, height: 941, alt: "Taibosi Exhaust Korea Precision Fit" }],
    },
    twitter: {
      card: "summary_large_image",
      title: "Taibosi Exhaust Korea",
      description: "Precision Fit, Confident Performance",
      images: [`${origin}/og.png`],
    },
  };
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
