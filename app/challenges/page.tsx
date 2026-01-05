import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import ChallengeFeed from "@/components/ChallengeFeed";
import { Camera } from "lucide-react";

export default async function ChallengesPage() {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect("/login");

  const todayIST = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });

  // 1. Fetch Active Challenges
  const { data: challenges } = await supabase
    .from("challenges")
    .select("*")
    .eq("is_active", true);

  // 2. Fetch Today's Quiz
  const { data: quizzes } = await supabase
    .from("daily_quizzes")
    .select("*")
    .eq("available_date", todayIST)
    .limit(1);

  // 3. Fetch User's Submissions (To disable completed buttons)
  const { data: submissions } = await supabase
    .from("challenge_submissions")
    .select("challenge_id, status")
    .eq("user_id", session.user.id);

  const { data: quizSubmissions } = await supabase
    .from("quiz_submissions")
    .select("quiz_id, is_correct")
    .eq("user_id", session.user.id);

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <header>
        <h1 className="text-3xl font-extrabold font-jakarta text-gray-900 dark:text-white flex items-center gap-3">
          <Camera className="w-8 h-8 text-emerald-600" />
          EcoActions
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Complete daily tasks, upload proof, and earn big points.
        </p>
      </header>

      {/* Client Logic for Camera & Quiz */}
      <ChallengeFeed 
        challenges={challenges || []}
        dailyQuiz={quizzes?.[0] || null}
        submissions={submissions || []}
        quizSubmissions={quizSubmissions || []}
        userId={session.user.id}
      />
    </div>
  );
}
