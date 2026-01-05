"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Flame, MapPin, Wind, Cloud, AlertTriangle, Loader2, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { formatDate } from "@/lib/utils";

interface DashboardWidgetsProps {
  user: any;
  streak: number;
  isCheckedIn: boolean;
}

export default function DashboardWidgets({ user, streak, isCheckedIn }: DashboardWidgetsProps) {
  const [checkingIn, setCheckingIn] = useState(false);
  const [hasCheckedIn, setHasCheckedIn] = useState(isCheckedIn);
  const [currentStreak, setCurrentStreak] = useState(streak);
  const [aqi, setAqi] = useState<any>(null);
  const [aqiLoading, setAqiLoading] = useState(true);
  
  const supabase = createClient();
  const router = useRouter();

  // --- DAILY CHECK-IN LOGIC ---
  const handleCheckIn = async () => {
    if (hasCheckedIn || checkingIn) return;
    setCheckingIn(true);

    try {
      const todayIST = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
      
      const { error } = await supabase.from('daily_checkins').insert({
        user_id: user.id,
        points_awarded: 10,
        checkin_date: todayIST
      });

      if (error) throw error;

      // Optimistic Update
      setHasCheckedIn(true);
      setCurrentStreak(prev => prev + 1);
      
      // Refresh server data in background
      router.refresh(); 

    } catch (err) {
      console.error("Check-in failed", err);
      alert("Failed to check in. Please try again.");
    } finally {
      setCheckingIn(false);
    }
  };

  // --- AQI LOGIC ---
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            const res = await fetch(`https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${latitude}&longitude=${longitude}&current=us_aqi`);
            const data = await res.json();
            
            // Get City Name
            const locRes = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`);
            const locData = await locRes.json();

            setAqi({
              value: data.current.us_aqi,
              city: locData.locality || locData.city || "Campus Area"
            });
          } catch (e) {
            console.error("AQI Error", e);
          } finally {
            setAqiLoading(false);
          }
        },
        (err) => {
          console.warn("Location denied", err);
          setAqiLoading(false);
        }
      );
    } else {
      setAqiLoading(false);
    }
  }, []);

  const getAqiStatus = (val: number) => {
    if (val <= 50) return { label: "Good", color: "text-green-600", bg: "from-green-100 to-emerald-50", icon: Wind };
    if (val <= 100) return { label: "Moderate", color: "text-yellow-600", bg: "from-yellow-100 to-orange-50", icon: Cloud };
    return { label: "Unhealthy", color: "text-red-600", bg: "from-red-100 to-rose-50", icon: AlertTriangle };
  };

  return (
    <div className="space-y-6">
      {/* CHECK-IN CARD */}
      <button 
        onClick={handleCheckIn}
        disabled={hasCheckedIn || checkingIn}
        className={`w-full relative overflow-hidden rounded-2xl p-6 text-left transition-all shadow-lg group ${
          hasCheckedIn 
            ? "bg-white border-2 border-green-500 cursor-default" 
            : "bg-gradient-to-r from-yellow-400 to-orange-500 hover:scale-[1.02] active:scale-95"
        }`}
      >
        {hasCheckedIn ? (
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-green-700">Great Job!</h3>
              <p className="text-gray-500 text-sm">You've checked in today.</p>
            </div>
            <div className="flex flex-col items-end">
               <span className="text-xs font-bold text-gray-400 uppercase">Streak</span>
               <div className="flex items-center text-orange-500">
                 <Flame className="w-6 h-6 fill-orange-500" />
                 <span className="text-3xl font-black">{currentStreak}</span>
               </div>
            </div>
          </div>
        ) : (
          <>
             <div className="relative z-10 text-white">
                <h3 className="text-xl font-bold mb-1 flex items-center gap-2">
                  {checkingIn ? <Loader2 className="animate-spin w-5 h-5" /> : "Daily Check-in"}
                </h3>
                <p className="text-white/90 text-sm">Tap to collect +10 points</p>
             </div>
             <div className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 p-3 rounded-full backdrop-blur-sm text-white">
                <Flame className="w-8 h-8" />
             </div>
          </>
        )}
      </button>

      {/* AQI CARD */}
      {aqi && (
        <div className={`relative overflow-hidden rounded-2xl p-5 border shadow-sm bg-gradient-to-br animate-in fade-in ${getAqiStatus(aqi.value).bg}`}>
           <div className="flex justify-between items-start">
              <div>
                 <div className="flex items-center gap-1 mb-1 opacity-60 text-black">
                    <MapPin className="w-3 h-3" />
                    <span className="text-xs font-bold uppercase tracking-wider">{aqi.city}</span>
                 </div>
                 <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black text-gray-900">{aqi.value}</span>
                    <span className={`text-lg font-bold ${getAqiStatus(aqi.value).color}`}>
                      ({getAqiStatus(aqi.value).label})
                    </span>
                 </div>
              </div>
              <div className="w-10 h-10 rounded-full bg-white/40 flex items-center justify-center">
                 {(() => {
                    const Icon = getAqiStatus(aqi.value).icon;
                    return <Icon className="w-5 h-5 text-gray-700" />;
                 })()}
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
