import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import MobileNav from "@/components/MobileNav";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-jakarta" });

export const metadata: Metadata = {
  title: "EcoCampus",
  description: "A BKBNC Green Club Initiative",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  
  // 1. Check Session securely on the server
  const { data: { session } } = await supabase.auth.getSession();
  let userProfile = null;

  if (session) {
    // 2. Fetch User Profile for Sidebar
    const { data } = await supabase
      .from("users")
      .select("*")
      .eq("auth_user_id", session.user.id)
      .single();
    userProfile = data;
  }

  return (
    <html lang="en" className={`${inter.variable} ${jakarta.variable}`}>
      <body className="bg-gray-50 dark:bg-gray-900 font-sans text-gray-900 dark:text-gray-100 antialiased">
        <div className="flex min-h-screen">
          {/* Conditional Sidebar: Only show if logged in */}
          {session && userProfile && <Sidebar user={userProfile} />}
          
          <main className={`flex-1 w-full ${session ? 'lg:ml-72 pb-24 lg:pb-0' : ''}`}>
             {children}
          </main>
          
          {/* Conditional Mobile Nav: Only show if logged in */}
          {session && <MobileNav />}
        </div>
      </body>
    </html>
  );
}
