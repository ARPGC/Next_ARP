import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import PlasticLogger from "@/components/PlasticLogger";
import { Recycle } from "lucide-react";

export default async function PlasticLogPage() {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect("/login");

  // 1. Fetch Impact Stats
  const { data: impact } = await supabase
    .from("user_impact")
    .select("total_plastic_kg")
    .eq("user_id", session.user.id)
    .single();

  // 2. Fetch Recycling History (Limit to 20 for speed)
  const { data: history } = await supabase
    .from("points_ledger")
    .select("*")
    .eq("user_id", session.user.id)
    .eq("source_type", "plastic")
    .order("created_at", { ascending: false })
    .limit(20);

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6 pb-24">
      <header>
        <h1 className="text-3xl font-extrabold font-jakarta text-gray-900 dark:text-white flex items-center gap-3">
          <Recycle className="w-8 h-8 text-emerald-600" />
          Plastic Log
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Track your recycling habits and reduce your carbon footprint.
        </p>
      </header>

      {/* Client Component */}
      <PlasticLogger 
        initialImpact={impact?.total_plastic_kg || 0}
        history={history || []}
        userId={session.user.id}
      />
    </div>
  );
}
