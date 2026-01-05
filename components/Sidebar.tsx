"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  LayoutDashboard, User, Archive, History, Users, 
  Calendar, Aperture, Recycle, Camera, Store, Ticket, 
  Info, HelpCircle, KeyRound, LogOut 
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { getTickImageUrl } from "@/lib/utils";

export default function Sidebar({ user }: { user: any }) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh(); // Clear server cache
  };

  const menuItems = [
    { name: "Dashboard", icon: LayoutDashboard, href: "/" },
    { name: "Profile", icon: User, href: "/profile" },
    { name: "Orders", icon: Archive, href: "/orders" },
    { name: "History", icon: History, href: "/history" },
    { name: "Leaderboard", icon: Users, href: "/leaderboard" },
    { name: "Events", icon: Calendar, href: "/events" },
    { name: "GreenLens", icon: Aperture, href: "/green-lens" },
    { name: "Plastic Log", icon: Recycle, href: "/plastic-log" },
    { name: "Challenges", icon: Camera, href: "/challenges" },
    { name: "Store", icon: Store, href: "/store" },
    { name: "Redeem Code", icon: Ticket, href: "/redeem" },
  ];

  const bottomItems = [
    { name: "About Us", icon: Info, href: "/about" },
    { name: "Help & Support", icon: HelpCircle, href: "/help" },
    { name: "Change Password", icon: KeyRound, href: "/change-password" },
  ];

  const tickUrl = getTickImageUrl(user?.tick_type);

  return (
    <aside className="fixed left-0 top-0 h-full w-72 bg-white/80 dark:bg-gray-900/90 backdrop-blur-xl border-r border-gray-200 dark:border-gray-800 z-50 overflow-y-auto hidden lg:flex flex-col">
      {/* Profile Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-4 mb-2">
          <img 
            src={user?.profile_img_url || "https://placehold.co/80x80/EBFBEE/166534?text=..."} 
            className="w-14 h-14 rounded-full border-2 border-green-500 object-cover shadow-sm" 
            alt="Profile"
          />
          <div className="min-w-0">
            <h2 className="font-bold text-gray-900 dark:text-white truncate flex items-center gap-1">
              {user?.full_name?.split(' ')[0] || "Student"}
              {tickUrl && <img src={tickUrl} className="w-4 h-4" alt="tick" />}
            </h2>
            <p className="text-xs font-semibold text-green-600 dark:text-green-400">
              {user?.current_points || 0} EcoPoints
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-4 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400 font-bold"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
              }`}
            >
              <Icon className={`w-5 h-5 mr-3 ${isActive ? "stroke-[2.5px]" : ""}`} />
              {item.name}
            </Link>
          );
        })}

        <div className="my-4 border-t border-gray-200 dark:border-gray-800"></div>

        {bottomItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                }`}
              >
                <Icon className="w-5 h-5 mr-3" />
                {item.name}
              </Link>
            );
        })}
        
        <button 
          onClick={handleLogout}
          className="w-full flex items-center px-4 py-3 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors mt-2"
        >
          <LogOut className="w-5 h-5 mr-3" />
          Log Out
        </button>
      </nav>
      
      <div className="p-4 text-center">
        <p className="text-[10px] font-bold text-gray-300 dark:text-gray-600 uppercase tracking-widest">
          A BKBNC Green Initiative
        </p>
      </div>
    </aside>
  );
}
