import "./globals.css";
import { AuthProvider } from "../components/AuthProvider";
import { Analytics } from "@vercel/analytics/react";
import { Toaster } from "../components/ui/toaster";

export const metadata = {
  title: "Campus Services Management System",
  description: "Manage your campus services efficiently",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>{children}</AuthProvider>
        <Toaster />
        <Analytics />
      </body>
    </html>
  );
}
