import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import MobileNav from "@/components/MobileNav";
import ChatBot from "@/components/ChatBot"; 
import { createClient } from "@/lib/supabase/server";

// Load Fonts
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

  // 2. If logged in, fetch the full User Profile (for Sidebar/Chatbot)
  if (session) {
    const { data } = await supabase
      .from("users")
      .select("*")
      .eq("auth_user_id", session.user.id)
      .single();
    userProfile = data;
  }

  return (
    <html lang="en" className={`${inter.variable} ${jakarta.variable}`}>
      <body className="bg-gray-50 dark:bg-gray-900 font-sans text-gray-900 dark:text-gray-100 antialiased selection:bg-emerald-100 selection:text-emerald-900">
        <div className="flex min-h-screen">
          
          {/* A. Sidebar (Desktop Only - Left Side) */}
          {session && userProfile && <Sidebar user={userProfile} />}
          
          {/* B. Main Content Area */}
          <main className={`flex-1 w-full transition-all duration-300 ${
            session ? 'lg:ml-72 pb-24 lg:pb-0' : ''
          }`}>
             {children}
          </main>
          
          {/* C. Mobile Navigation (Mobile Only - Bottom Fixed) */}
          {session && <MobileNav />}
          
          {/* D. AI Chatbot (Floating - All Devices) */}
          {session && userProfile && <ChatBot user={userProfile} />}
          
        </div>
      </body>
    </html>
  );
}
