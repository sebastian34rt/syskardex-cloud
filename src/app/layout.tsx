import type { Metadata, Viewport } from "next";
import "./globals.css";
import { InventoryProvider } from "@/lib/inventory-context";
import { AuthProvider } from "@/lib/firebase/auth-context";
import { Toaster } from "sonner";
import { PwaRegister } from "@/components/pwa-register";

export const viewport: Viewport = {
  themeColor: "#09090b",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  title: "SysKardex • Rendimiento y Seguridad",
  description: "Control de inventario de computadoras y tickets públicos.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "SysKardex",
  },
  formatDetection: {
    telephone: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="light">
      <body className="bg-slate-50 text-slate-900 antialiased selection:bg-indigo-600 selection:text-white min-h-[100dvh]">
        <AuthProvider>
          <InventoryProvider>
            <PwaRegister />
            <div className="relative z-10 flex min-h-[100dvh] flex-col">
              {children}
            </div>
            <Toaster 
              position="bottom-right" 
              theme="light" 
              richColors 
              closeButton 
              toastOptions={{
                style: {
                  background: "#ffffff",
                  border: "1px solid #e2e8f0",
                  color: "#0f172a",
                  borderRadius: "14px",
                  boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.08)",
                },
              }}
            />
          </InventoryProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
