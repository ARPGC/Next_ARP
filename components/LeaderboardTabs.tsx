"use client";

import { useState } from "react";
import { Users, Building2, Crown } from "lucide-react";
import { getTickImageUrl } from "@/lib/utils";

interface Student {
  id: string;
  full_name: string;
  course: string | null;
  lifetime_points: number;
  profile_img_url: string | null;
  tick_type: string | null;
}

interface Department {
  name: string;
  points: number; // Average
  count: number;
}

export default function LeaderboardTabs({ students, departments, currentUserId }: { students: Student[], departments: Department[], currentUserId: string }) {
  const [tab, setTab] = useState<'students' | 'departments'>('students');

  // Extract Top 3 for Podium
  const top3 = students.slice(0, 3);
  const rest = students.slice(3);

  const getRankBadge = (rank: number) => {
    if (rank === 1) return "🥇";
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";
    return `#${rank}`;
  };

  return (
    <div className="space-y-8">
      
      {/* Toggle */}
      <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
        <button 
          onClick={() => setTab('students')}
          className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${
            tab === 'students' ? 'bg-white shadow-sm text-emerald-600' : 'text-gray-500'
          }`}
        >
          <Users className="w-4 h-4" /> Students
        </button>
        <button 
          onClick={() => setTab('departments')}
          className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${
            tab === 'departments' ? 'bg-white shadow-sm text-emerald-600' : 'text-gray-500'
          }`}
        >
          <Building2 className="w-4 h-4" /> Departments
        </button>
      </div>

      {tab === 'students' ? (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          {/* PODIUM (Uses CSS from globals.css) */}
          <div className="podium-wrapper">
             {/* 2nd Place */}
             {top3[1] && <PodiumItem student={top3[1]} rank={2} color="silver" />}
             
             {/* 1st Place */}
             {top3[0] && <PodiumItem student={top3[0]} rank={1} color="gold" />}
             
             {/* 3rd Place */}
             {top3[2] && <PodiumItem student={top3[2]} rank={3} color="bronze" />}
          </div>

          {/* THE LIST (Rest of the students) */}
          <div className="space-y-3">
            {rest.map((student, idx) => {
              const isMe = student.id === currentUserId;
              const tickUrl = getTickImageUrl(student.tick_type);

              return (
                <div 
                  key={student.id} 
                  className={`flex items-center gap-4 p-4 rounded-2xl border transition-all ${
                    isMe 
                      ? 'bg-emerald-50 border-emerald-500 shadow-md transform scale-[1.02]' 
                      : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700'
                  }`}
                >
                  <span className="font-bold text-gray-400 w-6 text-center text-sm">
                    {idx + 4}
                  </span>
                  
                  <img 
                    src={student.profile_img_url || "https://placehold.co/100x100"} 
                    className="w-10 h-10 rounded-full object-cover border border-gray-200"
                    alt={student.full_name}
                  />
                  
                  <div className="flex-1">
                    <h4 className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-1">
                      {student.full_name}
                      {tickUrl && <img src={tickUrl} className="w-3 h-3" alt="verified" />}
                      {isMe && <span className="text-[10px] bg-emerald-200 text-emerald-800 px-1.5 rounded ml-2">YOU</span>}
                    </h4>
                    <p className="text-xs text-gray-500">{student.course || "Student"}</p>
                  </div>

                  <div className="text-right">
                    <span className="block font-black text-emerald-600 dark:text-emerald-400">
                      {student.lifetime_points}
                    </span>
                    <span className="text-[10px] font-bold text-gray-400 uppercase">Pts</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* DEPARTMENT VIEW */
        <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
          {departments.map((dept, idx) => (
            <div key={dept.name} className="glass-card p-5 flex items-center gap-4">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-lg ${
                idx === 0 ? 'bg-yellow-100 text-yellow-600' : 'bg-gray-100 text-gray-500'
              }`}>
                {idx + 1}
              </div>
              <div className="flex-1">
                 <h3 className="font-bold text-lg">{dept.name}</h3>
                 <p className="text-xs text-gray-500">{dept.count} Active Students</p>
              </div>
              <div className="text-right">
                 <span className="block font-black text-xl text-emerald-600">{dept.points}</span>
                 <span className="text-[10px] font-bold text-gray-400 uppercase">Avg Pts</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Sub-Component for Podium
function PodiumItem({ student, rank, color }: { student: Student, rank: number, color: string }) {
  return (
    <div className={`champ relative flex flex-col justify-end items-center pb-4 w-1/3 max-w-[100px] bg-white dark:bg-gray-800 shadow-xl rounded-t-2xl z-${rank === 1 ? '20' : '10'} ${rank === 1 ? 'h-[200px]' : rank === 2 ? 'h-[160px]' : 'h-[130px]'}`}>
      <div className={`badge ${color} absolute -top-6 w-12 h-12 rounded-full border-4 border-white shadow-md flex items-center justify-center overflow-hidden bg-gray-100`}>
        <img src={student.profile_img_url || "https://placehold.co/100x100"} className="w-full h-full object-cover" />
      </div>
      
      <div className="text-center px-1">
        <div className="w-6 h-6 rounded-full bg-gray-900 text-white flex items-center justify-center text-xs font-bold mx-auto mb-1">
          {rank}
        </div>
        <p className="font-bold text-xs truncate w-full px-1">{student.full_name.split(' ')[0]}</p>
        <p className="text-[10px] font-bold text-emerald-600">{student.lifetime_points} pts</p>
      </div>
    </div>
  );
}
