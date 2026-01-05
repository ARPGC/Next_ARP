"use client";

import { useState } from "react";
import { Search, ShoppingBag, Loader2, CheckCircle, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface Product {
  id: string;
  name: string;
  description: string;
  ecopoints_cost: number;
  stores: { name: string; logo_url: string | null } | null;
  product_images: { image_url: string | null }[];
}

export default function StoreGrid({ products, userPoints, userId }: { products: any[], userPoints: number, userId: string }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [buying, setBuying] = useState(false);
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);
  
  const supabase = createClient();
  const router = useRouter();

  // Filter Logic
  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.stores?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // --- BUY LOGIC ---
  const handlePurchase = async () => {
    if (!selectedProduct || buying) return;
    setBuying(true);

    try {
      // 1. Create Order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: userId,
          store_id: selectedProduct.stores ? null : null, // Simplified for now
          total_points: selectedProduct.ecopoints_cost,
          status: 'confirmed'
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // 2. Deduct Points (via Ledger)
      const { error: ledgerError } = await supabase
        .from('points_ledger')
        .insert({
          user_id: userId,
          source_type: 'store_purchase',
          source_id: order.id,
          points_delta: -selectedProduct.ecopoints_cost,
          description: `Purchased ${selectedProduct.name}`
        });

      if (ledgerError) throw ledgerError;

      // 3. Success!
      setPurchaseSuccess(true);
      router.refresh(); // Update points in header

    } catch (err) {
      console.error(err);
      alert("Transaction failed. Please try again.");
      setBuying(false);
    }
  };

  const closeModal = () => {
    setSelectedProduct(null);
    setPurchaseSuccess(false);
    setBuying(false);
  };

  return (
    <div>
      {/* Search Bar */}
      <div className="relative mb-8">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input 
          type="text" 
          placeholder="Search rewards..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-4 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
        />
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((product) => {
          const canAfford = userPoints >= product.ecopoints_cost;
          const image = product.product_images?.[0]?.image_url || "https://placehold.co/400x300/EBFBEE/166534?text=EcoReward";

          return (
            <div key={product.id} className="glass-card group hover:shadow-lg transition-all duration-300 flex flex-col h-full">
              {/* Image Area */}
              <div className="relative h-48 w-full overflow-hidden border-b border-gray-100 dark:border-gray-800">
                <img 
                  src={image} 
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                {!canAfford && (
                   <div className="absolute inset-0 bg-gray-900/60 flex items-center justify-center backdrop-blur-[2px]">
                      <span className="bg-gray-800 text-white px-3 py-1 rounded-full text-xs font-bold border border-gray-700">
                        Need {product.ecopoints_cost - userPoints} more pts
                      </span>
                   </div>
                )}
                <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider text-gray-600 shadow-sm">
                  {product.stores?.name || "EcoCampus"}
                </div>
              </div>

              {/* Content */}
              <div className="p-5 flex-1 flex flex-col">
                <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-1">{product.name}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-4 flex-1">
                  {product.description || "Limited time eco-friendly reward."}
                </p>
                
                <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100 dark:border-gray-700">
                  <div className="text-emerald-600 dark:text-emerald-400 font-black text-xl">
                    {product.ecopoints_cost} <span className="text-xs font-bold uppercase text-gray-400">Pts</span>
                  </div>
                  <button 
                    onClick={() => setSelectedProduct(product)}
                    disabled={!canAfford}
                    className={`px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${
                      canAfford 
                        ? "bg-gray-900 text-white hover:bg-emerald-600" 
                        : "bg-gray-100 text-gray-400 cursor-not-allowed"
                    }`}
                  >
                    Redeem
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* --- REDEEM MODAL --- */}
      {selectedProduct && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-gray-900 w-full max-w-md rounded-3xl overflow-hidden shadow-2xl relative">
            
            <button onClick={closeModal} className="absolute top-4 right-4 p-2 bg-gray-100 dark:bg-gray-800 rounded-full text-gray-500 hover:bg-gray-200">
              <X className="w-5 h-5" />
            </button>

            {!purchaseSuccess ? (
              <div className="p-8">
                <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <ShoppingBag className="w-8 h-8 text-emerald-600" />
                </div>
                <h2 className="text-2xl font-bold text-center mb-2">Confirm Redemption</h2>
                <p className="text-center text-gray-500 mb-8">
                  Are you sure you want to redeem <strong>{selectedProduct.name}</strong> for <span className="text-emerald-600 font-bold">{selectedProduct.ecopoints_cost} points</span>?
                </p>
                
                <div className="flex gap-3">
                  <button onClick={closeModal} className="flex-1 py-3.5 rounded-xl font-bold border border-gray-200 text-gray-600 hover:bg-gray-50">
                    Cancel
                  </button>
                  <button 
                    onClick={handlePurchase} 
                    disabled={buying}
                    className="flex-1 py-3.5 rounded-xl font-bold bg-emerald-500 text-white hover:bg-emerald-600 flex items-center justify-center gap-2"
                  >
                    {buying && <Loader2 className="w-5 h-5 animate-spin" />}
                    {buying ? "Processing..." : "Confirm"}
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center bg-emerald-600 text-white">
                 <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
                    <CheckCircle className="w-10 h-10 text-white" />
                 </div>
                 <h2 className="text-2xl font-bold mb-2">Redemption Successful!</h2>
                 <p className="text-emerald-100 mb-8 text-sm">
                   Please show this QR code at the counter to claim your reward.
                 </p>
                 
                 <div className="bg-white p-4 rounded-xl inline-block shadow-lg mb-6">
                    {/* Generates a Real QR Code for the specific user/product combo */}
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=REDEEM-${userId}-${selectedProduct.id}`} 
                      alt="QR Code" 
                      className="w-40 h-40 mix-blend-multiply" 
                    />
                 </div>
                 
                 <button onClick={closeModal} className="w-full py-3.5 bg-white text-emerald-700 font-bold rounded-xl hover:bg-emerald-50 transition-colors">
                    Done
                 </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
