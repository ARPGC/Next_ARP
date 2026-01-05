import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import StoreGrid from "@/components/StoreGrid";
import { Store as StoreIcon } from "lucide-react";

export default async function StorePage() {
  const supabase = createClient();

  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect("/login");

  // 1. Fetch User (for points balance)
  const { data: user } = await supabase
    .from("users")
    .select("*")
    .eq("auth_user_id", session.user.id)
    .single();

  // 2. Fetch Products (with Store info and Images)
  const { data: products } = await supabase
    .from("products")
    .select(`
      *,
      stores ( name, logo_url ),
      product_images ( image_url )
    `)
    .eq("is_active", true)
    .order("ecopoints_cost", { ascending: true });

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold font-jakarta text-gray-900 dark:text-white flex items-center gap-3">
            <StoreIcon className="w-8 h-8 text-emerald-600" />
            EcoStore
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Redeem your hard-earned points for exclusive rewards.
          </p>
        </div>
        
        {/* Points Display */}
        <div className="glass-card px-6 py-3 rounded-2xl flex flex-col items-end border-emerald-100 dark:border-emerald-900/30">
           <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Available Balance</span>
           <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{user?.current_points || 0} Pts</span>
        </div>
      </div>

      {/* Client Side Grid & Logic */}
      <StoreGrid 
        products={products || []} 
        userPoints={user?.current_points || 0}
        userId={user?.id}
      />
    </div>
  );
}
