"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, Camera, Calendar, Store } from "lucide-react";

export default function MobileNav() {
  const pathname = usePathname();
  
  // Hide Mobile Nav on login page or if specific routes need full screen
  if (pathname === '/login') return null;

  const navItems = [
    { icon: LayoutDashboard, label: "Home", href: "/" },
    { icon: Users, label: "Rank", href: "/leaderboard" },
    { icon: Camera, label: "Action", href: "/challenges" },
    { icon: Calendar, label: "Events", href: "/events" },
    { icon: Store, label: "Store", href: "/store" },
  ];

  return (
    <div className="fixed bottom-0 left-0 w-full glass-bottom-bar border-t border-gray-200/50 dark:border-gray-800 lg:hidden z-50 pb-safe">
      <div className="flex justify-between items-end px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link 
              key={item.href} 
              href={item.href}
              className={`flex-1 flex flex-col items-center py-3 transition-colors ${
                isActive 
                  ? 'text-emerald-600 dark:text-emerald-400' 
                  : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'
              }`}
            >
              <Icon className={`w-6 h-6 mb-1 ${isActive ? 'stroke-[2.5px] -translate-y-1 transition-transform' : ''}`} />
              <span className="text-[10px] font-bold tracking-wide">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
