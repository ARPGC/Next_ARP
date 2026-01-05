import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import LeaderboardTabs from "@/components/LeaderboardTabs";
import { Trophy } from "lucide-react";

export default async function LeaderboardPage() {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect("/login");

  // 1. Fetch Top 50 Students (Ordered by Lifetime Points)
  const { data: students } = await supabase
    .from("users")
    .select("id, full_name, course, lifetime_points, profile_img_url, tick_type")
    .order("lifetime_points", { ascending: false })
    .limit(50);

  // 2. Calculate Department Stats (Real-time aggregation)
  // We manually group the data here since we don't have a backend aggregation function yet
  const deptMap: Record<string, { total: number; count: number }> = {};
  
  // Note: For a real production app with thousands of users, do this in SQL.
  const { data: allUsers } = await supabase.from("users").select("course, lifetime_points");
  
  if (allUsers) {
    allUsers.forEach(u => {
      const dept = u.course || "General";
      if (!deptMap[dept]) deptMap[dept] = { total: 0, count: 0 };
      deptMap[dept].total += (u.lifetime_points || 0);
      deptMap[dept].count += 1;
    });
  }

  const deptStats = Object.entries(deptMap).map(([name, stat]) => ({
    name,
    points: Math.round(stat.total / stat.count), // Average points
    count: stat.count
  })).sort((a, b) => b.points - a.points);

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6 pb-24">
      
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-extrabold font-jakarta text-gray-900 dark:text-white flex items-center justify-center gap-3">
          <Trophy className="w-8 h-8 text-yellow-500 fill-yellow-500" />
          Leaderboard
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          Celebrating our top eco-warriors.
        </p>
      </div>

      {/* Client Component for Podium & Tabs */}
      <LeaderboardTabs 
        students={students || []} 
        departments={deptStats}
        currentUserId={session.user.id}
      />
    </div>
  );
}
