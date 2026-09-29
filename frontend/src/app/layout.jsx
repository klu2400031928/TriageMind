import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";

export const metadata = {
  title: "TriageMind — AI SOC Alert Intelligence with Hindsight Memory",
  description: "Autonomous SOC alert triage agent powered by persistent Hindsight organizational memory.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#0b0f17] text-gray-100 min-h-screen antialiased">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
