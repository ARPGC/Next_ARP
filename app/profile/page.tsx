import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import ProfileView from "@/components/ProfileView";
import { User as UserIcon } from "lucide-react";

export default async function ProfilePage() {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect("/login");

  // 1. Fetch User Profile
  const { data: user } = await supabase
    .from("users")
    .select("*")
    .eq("auth_user_id", session.user.id)
    .single();

  // 2. Fetch Recent History (Points Ledger)
  const { data: history } = await supabase
    .from("points_ledger")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(20);

  // 3. Calculate "Next Level" Progress
  // Simple logic: Level up every 1000 points
  const currentLevel = Math.floor(user.lifetime_points / 1000) + 1;
  const pointsForNextLevel = currentLevel * 1000;
  const progress = ((user.lifetime_points % 1000) / 1000) * 100;

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6 pb-24">
      <header>
        <h1 className="text-3xl font-extrabold font-jakarta text-gray-900 dark:text-white flex items-center gap-3">
          <UserIcon className="w-8 h-8 text-emerald-600" />
          My Profile
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Manage your green identity and view history.
        </p>
      </header>

      {/* Client Component for Interactions (Upload, QR, Tabs) */}
      <ProfileView 
        user={user} 
        history={history || []} 
        levelData={{ currentLevel, pointsForNextLevel, progress }}
      />
    </div>
  );
}
