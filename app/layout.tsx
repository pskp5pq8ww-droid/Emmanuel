import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Emmanuel Rojas | Client Portal",
  description: "Premium client portal for Emmanuel Rojas Studio.",
  icons: { icon: "/assets/favicon.png" },
  openGraph: {
    title: "Emmanuel Rojas | Client Portal",
    description: "Premium client portal for Emmanuel Rojas Studio.",
    images: ["/assets/og-preview.png"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
