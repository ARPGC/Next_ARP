"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Plus, Recycle, History, Scale, ArrowRight, Loader2 } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { useRouter } from "next/navigation";

interface Props {
  initialImpact: number;
  history: any[];
  userId: string;
}

// Configuration for recycling items
const ITEMS = [
  { id: 'bottle', name: 'Plastic Bottle', weight: 0.02, points: 5, icon: '🍾' },
  { id: 'bag', name: 'Plastic Bag', weight: 0.005, points: 2, icon: '🛍️' },
  { id: 'wrapper', name: 'Food Wrapper', weight: 0.001, points: 1, icon: '🍬' },
  { id: 'container', name: 'Container', weight: 0.05, points: 10, icon: '🥡' },
];

export default function PlasticLogger({ initialImpact, history, userId }: Props) {
  const [selectedItem, setSelectedItem] = useState(ITEMS[0]);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [totalImpact, setTotalImpact] = useState(initialImpact);
  
  const supabase = createClient();
  const router = useRouter();

  const handleLog = async () => {
    if (loading || quantity < 1) return;
    setLoading(true);

    try {
      const weightDelta = selectedItem.weight * quantity;
      const pointsDelta = selectedItem.points * quantity;
      
      // 1. Update Impact Table (Weight)
      // Note: We use an RPC or manual update. For simplicity, we fetch-and-update or assume existence.
      // Ideally, use a Supabase RPC function `increment_impact` for safety. 
      // Here we will do a direct update for the MVP.
      const { error: impactError } = await supabase
        .from("user_impact")
        .upsert({ 
          user_id: userId, 
          total_plastic_kg: totalImpact + weightDelta 
        });

      if (impactError) throw impactError;

      // 2. Add Points to Ledger
      const { error: ledgerError } = await supabase.from("points_ledger").insert({
        user_id: userId,
        source_type: "plastic",
        source_id: selectedItem.id, // Storing 'bottle' etc as ID reference
        points_delta: pointsDelta,
        description: `Recycled ${quantity}x ${selectedItem.name}`
      });

      if (ledgerError) throw ledgerError;

      // 3. UI Updates
      setTotalImpact(prev => prev + weightDelta);
      alert(`Success! Logged ${quantity} ${selectedItem.name}(s) and earned ${pointsDelta} points.`);
      setQuantity(1);
      router.refresh();

    } catch (err) {
      console.error(err);
      alert("Failed to log recycling. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      
      {/* 1. IMPACT SUMMARY CARD */}
      <div className="glass-green-card p-6 flex items-center justify-between">
         <div>
            <p className="text-emerald-100 font-bold text-sm uppercase tracking-wider mb-1">Lifetime Recycled</p>
            <h2 className="text-4xl font-black text-white flex items-baseline gap-2">
               {totalImpact.toFixed(3)} <span className="text-lg font-medium opacity-80">kg</span>
            </h2>
         </div>
         <div className="bg-white/20 p-4 rounded-full backdrop-blur-sm">
            <Scale className="w-8 h-8 text-white" />
         </div>
      </div>

      {/* 2. LOGGING FORM */}
      <div className="glass-card p-6">
        <h3 className="font-bold text-lg mb-4 text-gray-900 dark:text-white">Log New Item</h3>
        
        {/* Item Selection */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {ITEMS.map(item => (
            <button
              key={item.id}
              onClick={() => setSelectedItem(item)}
              className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${
                selectedItem.id === item.id 
                  ? "border-emerald-500 bg-emerald-50 text-emerald-800 ring-1 ring-emerald-500" 
                  : "border-gray-200 hover:border-emerald-300 dark:border-gray-700"
              }`}
            >
              <span className="text-2xl">{item.icon}</span>
              <span className="text-xs font-bold">{item.name}</span>
            </button>
          ))}
        </div>

        {/* Quantity & Action */}
        <div className="flex items-end gap-4">
          <div className="flex-1">
             <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Quantity</label>
             <div className="flex items-center gap-4 bg-gray-50 dark:bg-gray-800 rounded-xl p-2 border border-gray-200 dark:border-gray-700">
                <button 
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="w-10 h-10 rounded-lg bg-white dark:bg-gray-700 shadow-sm flex items-center justify-center font-bold text-gray-600 hover:text-emerald-600"
                >
                  -
                </button>
                <span className="flex-1 text-center font-black text-xl text-gray-900 dark:text-white">{quantity}</span>
                <button 
                  onClick={() => setQuantity(q => q + 1)}
                  className="w-10 h-10 rounded-lg bg-white dark:bg-gray-700 shadow-sm flex items-center justify-center font-bold text-gray-600 hover:text-emerald-600"
                >
                  +
                </button>
             </div>
          </div>
          
          <button 
            onClick={handleLog}
            disabled={loading}
            className="h-[66px] px-8 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-lg shadow-emerald-500/30 flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 className="animate-spin" /> : <ArrowRight />}
          </button>
        </div>

        {/* Prediction info */}
        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-between text-sm">
           <span className="text-blue-800 dark:text-blue-300 font-medium">Estimated Impact:</span>
           <span className="font-bold text-blue-600">
              +{(selectedItem.weight * quantity).toFixed(3)} kg &nbsp;/&nbsp; +{selectedItem.points * quantity} pts
           </span>
        </div>
      </div>

      {/* 3. HISTORY LIST */}
      <div>
         <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-gray-900 dark:text-white">
            <History className="w-5 h-5" /> Recent Logs
         </h3>
         <div className="space-y-3">
            {history.length > 0 ? (
               history.map((log) => (
                  <div key={log.id} className="glass-card p-4 flex justify-between items-center">
                     <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                           <Recycle className="w-5 h-5 text-emerald-600" />
                        </div>
                        <div>
                           <p className="font-bold text-sm text-gray-900 dark:text-white">{log.description}</p>
                           <p className="text-xs text-gray-500">{formatDate(log.created_at)}</p>
                        </div>
                     </div>
                     <span className="font-black text-emerald-600">+{log.points_delta}</span>
                  </div>
               ))
            ) : (
               <div className="text-center py-8 text-gray-400 italic">No recycling history yet. Start today!</div>
            )}
         </div>
      </div>

    </div>
  );
}
