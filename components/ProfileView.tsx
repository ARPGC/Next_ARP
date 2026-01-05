"use client";

import { useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { Camera, QrCode, History, LogOut, Loader2, UploadCloud } from "lucide-react";
import { formatDate, uploadToCloudinary, getTickImageUrl } from "@/lib/utils";
import { useRouter } from "next/navigation";

interface ProfileProps {
  user: any;
  history: any[];
  levelData: {
    currentLevel: number;
    pointsForNextLevel: number;
    progress: number;
  };
}

export default function ProfileView({ user, history, levelData }: ProfileProps) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const supabase = createClient();

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];

    try {
      setUploading(true);
      // 1. Upload to Cloudinary
      const url = await uploadToCloudinary(file);

      // 2. Update Supabase
      const { error } = await supabase
        .from("users")
        .update({ profile_img_url: url })
        .eq("id", user.id);

      if (error) throw error;

      router.refresh();
      alert("Profile picture updated!");
    } catch (err) {
      console.error(err);
      alert("Failed to update profile picture.");
    } finally {
      setUploading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const tickUrl = getTickImageUrl(user.tick_type);

  return (
    <div className="space-y-6">
      
      {/* 1. IDENTITY CARD */}
      <div className="glass-card p-6 relative overflow-hidden">
        <div className="flex flex-col items-center text-center relative z-10">
          
          {/* Profile Image & Upload */}
          <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
            <div className="w-24 h-24 rounded-full border-4 border-emerald-100 dark:border-emerald-900 overflow-hidden shadow-lg relative">
               <img 
                 src={user.profile_img_url || "https://placehold.co/150x150"} 
                 className="w-full h-full object-cover" 
                 alt="Profile"
               />
               {uploading && (
                 <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                   <Loader2 className="w-8 h-8 text-white animate-spin" />
                 </div>
               )}
            </div>
            <div className="absolute bottom-0 right-0 bg-emerald-500 text-white p-2 rounded-full shadow-md group-hover:scale-110 transition-transform">
               <Camera className="w-4 h-4" />
            </div>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*"
              onChange={handleFileSelect}
            />
          </div>

          {/* Name & Details */}
          <h2 className="text-2xl font-bold mt-4 flex items-center gap-2 text-gray-900 dark:text-white">
            {user.full_name}
            {tickUrl && <img src={tickUrl} className="w-5 h-5" alt="Verified" />}
          </h2>
          <p className="text-emerald-600 font-bold">{user.course || "Student"}</p>
          <p className="text-xs text-gray-400 font-mono mt-1">ID: {user.student_id}</p>

          {/* QR Code (Real API) */}
          <div className="mt-6 bg-white p-3 rounded-xl shadow-inner border border-gray-200">
            <img 
              src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${user.student_id}`}
              className="w-32 h-32 opacity-90"
              alt="My QR"
            />
            <p className="text-[10px] uppercase font-bold text-gray-400 mt-2 tracking-widest">Scan at Events</p>
          </div>
        </div>

        {/* Background Blob */}
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl"></div>
      </div>

      {/* 2. LEVEL PROGRESS */}
      <div className="glass-card p-6">
        <div className="flex justify-between items-end mb-2">
          <div>
            <span className="text-xs font-bold text-gray-400 uppercase">Current Level</span>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Level {levelData.currentLevel}</h3>
          </div>
          <span className="text-sm font-bold text-emerald-600">
            {user.lifetime_points} / {levelData.pointsForNextLevel} pts
          </span>
        </div>
        <div className="w-full h-3 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
           <div 
             className="h-full bg-gradient-to-r from-emerald-500 to-green-400 transition-all duration-1000"
             style={{ width: `${levelData.progress}%` }}
           ></div>
        </div>
        <p className="text-xs text-gray-400 mt-2">
          Earn {levelData.pointsForNextLevel - user.lifetime_points} more points to reach Level {levelData.currentLevel + 1}!
        </p>
      </div>

      {/* 3. HISTORY LIST */}
      <div>
        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
          <History className="w-5 h-5" /> Recent Activity
        </h3>
        <div className="space-y-3">
          {history.length > 0 ? (
            history.map((item) => (
              <div key={item.id} className="glass-card p-4 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    item.points_delta > 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                  }`}>
                    <span className="font-bold text-lg">{item.points_delta > 0 ? '+' : '-'}</span>
                  </div>
                  <div>
                    <p className="font-bold text-sm text-gray-900 dark:text-white">{item.description}</p>
                    <p className="text-xs text-gray-500">{formatDate(item.created_at)}</p>
                  </div>
                </div>
                <span className={`font-black ${item.points_delta > 0 ? 'text-green-600' : 'text-red-500'}`}>
                  {item.points_delta}
                </span>
              </div>
            ))
          ) : (
            <div className="text-center text-gray-400 py-8 text-sm">No recent activity</div>
          )}
        </div>
      </div>
      
      <button 
        onClick={handleLogout}
        className="w-full py-4 rounded-xl font-bold text-red-600 bg-red-50 hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
      >
        <LogOut className="w-5 h-5" /> Log Out
      </button>

    </div>
  );
}
