import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import EventCard from "@/components/EventCard";
import { Calendar, MapPin } from "lucide-react";

export default async function EventsPage() {
  const supabase = createClient();

  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect("/login");

  // 1. Fetch Upcoming Events
  const { data: events } = await supabase
    .from("events")
    .select("*")
    .gte("start_at", new Date().toISOString()) // Only future events
    .order("start_at", { ascending: true });

  // 2. Fetch User's Attendance (to see what they already RSVP'd to)
  const { data: attendance } = await supabase
    .from("event_attendance")
    .select("event_id, status")
    .eq("user_id", session.user.id);

  // Create a Set for fast lookup: "Is user going to Event X?"
  const attendanceMap = new Set(attendance?.map(a => a.event_id));

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold font-jakarta text-gray-900 dark:text-white flex items-center gap-3">
          <Calendar className="w-8 h-8 text-emerald-600" />
          Campus Events
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Join the movement. Participate in upcoming green initiatives.
        </p>
      </div>

      {/* Events List */}
      <div className="space-y-6">
        {events && events.length > 0 ? (
          events.map((event) => (
            <EventCard 
              key={event.id} 
              event={event} 
              isAttending={attendanceMap.has(event.id)}
              userId={session.user.id}
            />
          ))
        ) : (
          <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-3xl border border-dashed border-gray-300 dark:border-gray-700">
            <div className="w-16 h-16 bg-gray-50 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">No upcoming events</h3>
            <p className="text-gray-500 text-sm">Check back later for new activities.</p>
          </div>
        )}
      </div>
    </div>
  );
}
