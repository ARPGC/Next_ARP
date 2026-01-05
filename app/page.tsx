import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import DashboardWidgets from "@/components/DashboardWidgets";
import { Recycle, CalendarCheck, Lightbulb, ArrowRight, Calendar } from "lucide-react";
import Link from "next/link";

export default async function Dashboard() {
  const supabase = createClient();

  // 1. Get User Session
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect("/login");

  const todayIST = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });

  // 2. Fetch All Data in Parallel
  const [userRes, impactRes, streakRes, checkinRes, eventsRes] = await Promise.all([
    supabase.from("users").select("*").eq("auth_user_id", session.user.id).single(),
    supabase.from("user_impact").select("*").eq("user_id", session.user.id).single(),
    supabase.from("user_streaks").select("*").eq("user_id", session.user.id).single(),
    supabase.from("daily_checkins").select("id").eq("user_id", session.user.id).eq("checkin_date", todayIST).limit(1),
    supabase.from("events").select("*").gte("start_at", new Date().toISOString()).order("start_at", { ascending: true }).limit(1)
  ]);

  const user = userRes.data;
  const impact = impactRes.data || { total_plastic_kg: 0, events_attended: 0 };
  const streak = streakRes.data?.current_streak || 0;
  
  // --- FIX IS HERE: Force boolean conversion ---
  const isCheckedIn = !!(checkinRes.data && checkinRes.data.length > 0);
  
  const nextEvent = eventsRes.data?.[0];

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
      
      {/* 1. Header Section */}
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-extrabold font-jakarta text-gray-900 dark:text-white">
            Hi, <span className="text-emerald-600">{user?.full_name?.split(" ")[0]}</span>! 👋
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1 font-medium">
            Ready to make an impact today?
          </p>
        </div>
        <Link href="/store" className="glass-card px-4 py-2 rounded-full flex items-center gap-2 hover:bg-gray-50 transition-colors">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-sm font-bold text-gray-900 dark:text-white">{user?.current_points} Pts</span>
        </Link>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* LEFT COLUMN: Actions & Widgets */}
        <div className="space-y-6">
          
          {/* Daily Check-in & AQI (Client Component) */}
          <DashboardWidgets 
             user={user} 
             streak={streak} 
             isCheckedIn={isCheckedIn} 
          />

          {/* Impact Stats */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Your Impact</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="glass-card p-5 flex flex-col items-center text-center hover:border-emerald-200 transition-colors">
                <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center mb-2">
                   <Recycle className="w-6 h-6 text-blue-500" />
                </div>
                <span className="text-2xl font-black text-gray-900 dark:text-white">{impact.total_plastic_kg}kg</span>
                <span className="text-xs text-gray-500 uppercase font-bold tracking-wider">Recycled</span>
              </div>
              <div className="glass-card p-5 flex flex-col items-center text-center hover:border-purple-200 transition-colors">
                <div className="w-12 h-12 rounded-full bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center mb-2">
                   <CalendarCheck className="w-6 h-6 text-purple-500" />
                </div>
                <span className="text-2xl font-black text-gray-900 dark:text-white">{impact.events_attended}</span>
                <span className="text-xs text-gray-500 uppercase font-bold tracking-wider">Events</span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Updates & Tips */}
        <div className="space-y-6">
          
          {/* Featured Event Card */}
          {nextEvent ? (
            <div className="glass-green-card p-6 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                 <Calendar className="w-32 h-32 transform rotate-12" />
              </div>
              <div className="relative z-10">
                 <div className="flex items-center gap-2 mb-3 text-emerald-100">
                    <Calendar className="w-5 h-5" />
                    <span className="text-xs font-bold uppercase tracking-widest">Upcoming</span>
                 </div>
                 <h3 className="text-xl font-bold mb-2 leading-tight">{nextEvent.title}</h3>
                 <p className="text-emerald-100/90 text-sm mb-6 line-clamp-2">
                    {nextEvent.description || "Join us for this amazing event!"}
                 </p>
                 <Link href="/events" className="inline-flex items-center bg-white/20 hover:bg-white/30 backdrop-blur-md text-white px-4 py-2 rounded-lg text-sm font-bold transition-all">
                    View Details <ArrowRight className="w-4 h-4 ml-2" />
                 </Link>
              </div>
            </div>
          ) : (
             <div className="glass-card p-6 flex items-center justify-center text-gray-400 italic">
                No upcoming events.
             </div>
          )}

          {/* Eco Tip */}
          <div className="glass-card p-6 border-l-4 border-l-blue-500">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex-shrink-0">
                <Lightbulb className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-bold text-lg mb-1 text-gray-900 dark:text-white">Did You Know?</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                  Switching to digital notes saves approximately <strong>2kg of paper</strong> per semester. You are already making a difference by using EcoCampus! 🌿
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
