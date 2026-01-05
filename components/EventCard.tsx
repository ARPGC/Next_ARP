"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Calendar, MapPin, User, CheckCircle2, Loader2 } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { useRouter } from "next/navigation";

interface EventProps {
  event: any;
  isAttending: boolean;
  userId: string;
}

export default function EventCard({ event, isAttending, userId }: EventProps) {
  const [attending, setAttending] = useState(isAttending);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();
  const router = useRouter();

  const handleRSVP = async () => {
    if (loading) return;
    setLoading(true);

    try {
      if (attending) {
        // Un-RSVP
        await supabase
          .from("event_attendance")
          .delete()
          .eq("event_id", event.id)
          .eq("user_id", userId);
        setAttending(false);
      } else {
        // RSVP
        await supabase
          .from("event_attendance")
          .insert({
            event_id: event.id,
            user_id: userId,
            status: "registered"
          });
        setAttending(true);
      }
      router.refresh(); // Refresh server data
    } catch (err) {
      console.error("RSVP failed", err);
      alert("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card overflow-hidden flex flex-col md:flex-row group transition-all hover:shadow-lg">
      
      {/* Date Badge (Mobile) */}
      <div className="md:hidden bg-emerald-50 text-emerald-700 px-4 py-2 font-bold text-sm flex items-center gap-2 border-b border-emerald-100">
        <Calendar className="w-4 h-4" />
        {formatDate(event.start_at)}
      </div>

      {/* Image Section */}
      <div className="relative h-48 md:h-auto md:w-1/3 overflow-hidden">
        <img 
          src={event.poster_url || "https://placehold.co/600x400/EBFBEE/166534?text=EcoEvent"} 
          alt={event.title}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent md:bg-gradient-to-r"></div>
        
        <div className="absolute bottom-3 left-3 md:top-3 md:left-3 md:bottom-auto">
           <span className="bg-emerald-500 text-white text-xs font-bold px-2 py-1 rounded-md shadow-sm">
             +{event.points_reward} Pts
           </span>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-6 md:w-2/3 flex flex-col justify-between">
        <div>
          <div className="hidden md:flex items-center gap-2 text-emerald-600 font-bold text-sm mb-2">
             <Calendar className="w-4 h-4" />
             {formatDate(event.start_at)}
          </div>
          
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-emerald-600 transition-colors">
            {event.title}
          </h3>
          
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-4 line-clamp-2">
            {event.description || "Join the green club for this exciting event!"}
          </p>

          <div className="flex flex-col sm:flex-row gap-3 text-sm text-gray-600 dark:text-gray-300 mb-6">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-gray-400" />
              {event.location || "Campus Ground"}
            </div>
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-gray-400" />
              {event.organizer || "Green Club"}
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex items-center justify-between border-t border-gray-100 dark:border-gray-700 pt-4 mt-auto">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
            {attending ? "You are going!" : "Registration Open"}
          </span>
          
          <button 
            onClick={handleRSVP}
            disabled={loading}
            className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 shadow-lg ${
              attending 
                ? "bg-white border-2 border-emerald-500 text-emerald-600 hover:bg-red-50 hover:border-red-500 hover:text-red-500" 
                : "bg-emerald-600 text-white hover:bg-emerald-700 active:scale-95"
            }`}
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : attending ? (
              <>
                <CheckCircle2 className="w-4 h-4" /> Going
              </>
            ) : (
              "RSVP Now"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
