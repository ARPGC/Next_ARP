"use client";

import { useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { Camera, Upload, CheckCircle, X, Loader2, HelpCircle } from "lucide-react";
import { uploadToCloudinary } from "@/lib/utils"; // We added this earlier
import { useRouter } from "next/navigation";
import Image from "next/image";

interface Props {
  challenges: any[];
  dailyQuiz: any;
  submissions: any[];
  quizSubmissions: any[];
  userId: string;
}

export default function ChallengeFeed({ challenges, dailyQuiz, submissions, quizSubmissions, userId }: Props) {
  const [activeChallenge, setActiveChallenge] = useState<any>(null);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  
  // Quiz State
  const [quizAnswered, setQuizAnswered] = useState(
    quizSubmissions.some(s => s.quiz_id === dailyQuiz?.id)
  );
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [quizResult, setQuizResult] = useState<boolean | null>(
    quizSubmissions.find(s => s.quiz_id === dailyQuiz?.id)?.is_correct ?? null
  );

  const videoRef = useRef<HTMLVideoElement>(null);
  const router = useRouter();
  const supabase = createClient();

  // Helper: Check if challenge is done
  const isChallengeDone = (id: string) => submissions.some(s => s.challenge_id === id);

  // --- CAMERA LOGIC ---
  const startCamera = async (challenge: any) => {
    setActiveChallenge(challenge);
    setCameraOpen(true);
    setCapturedImage(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "environment" } 
      });
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (err) {
      alert("Camera access denied or not available.");
      setCameraOpen(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
    setCameraOpen(false);
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement("canvas");
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext("2d");
      ctx?.drawImage(videoRef.current, 0, 0);
      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], "challenge.jpg", { type: "image/jpeg" });
          handleUpload(file);
        }
      }, "image/jpeg", 0.8);
      stopCamera();
    }
  };

  const handleUpload = async (file: File) => {
    setUploading(true);
    try {
      // 1. Upload to Cloudinary
      const url = await uploadToCloudinary(file);
      setCapturedImage(url);

      // 2. Save to DB
      await supabase.from("challenge_submissions").insert({
        challenge_id: activeChallenge.id,
        user_id: userId,
        submission_url: url,
        status: "pending"
      });

      // 3. Award Points (Instant Gratification)
      await supabase.from("points_ledger").insert({
        user_id: userId,
        source_type: "challenge",
        source_id: activeChallenge.id,
        points_delta: activeChallenge.points_reward,
        description: `Completed: ${activeChallenge.title}`
      });

      router.refresh();
      alert(`Success! You earned ${activeChallenge.points_reward} points!`);
      setActiveChallenge(null);
    } catch (err) {
      console.error(err);
      alert("Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  // --- QUIZ LOGIC ---
  const handleQuizSubmit = async () => {
    if (selectedOption === null || !dailyQuiz || quizAnswered) return;
    
    const isCorrect = selectedOption === dailyQuiz.correct_option_index;
    setQuizResult(isCorrect);
    setQuizAnswered(true);

    // Save to DB
    await supabase.from("quiz_submissions").insert({
      quiz_id: dailyQuiz.id,
      user_id: userId,
      is_correct: isCorrect
    });

    if (isCorrect) {
      await supabase.from("points_ledger").insert({
        user_id: userId,
        source_type: "quiz",
        source_id: dailyQuiz.id,
        points_delta: dailyQuiz.points_reward,
        description: "Daily Quiz Win"
      });
      router.refresh();
    }
  };

  return (
    <div className="space-y-8 pb-20">
      
      {/* 1. DAILY QUIZ SECTION */}
      {dailyQuiz && (
        <div className="glass-card p-6 border-l-4 border-l-purple-500 relative overflow-hidden">
          <div className="flex items-center gap-2 mb-4">
            <HelpCircle className="w-6 h-6 text-purple-600" />
            <h2 className="font-bold text-lg">Daily Quiz</h2>
            <span className="ml-auto text-xs font-bold bg-purple-100 text-purple-700 px-2 py-1 rounded-md">
              +{dailyQuiz.points_reward} Pts
            </span>
          </div>
          
          <p className="font-medium text-gray-800 dark:text-gray-200 mb-4">{dailyQuiz.question}</p>

          <div className="space-y-2">
            {dailyQuiz.options.map((opt: string, idx: number) => {
              // Styling Logic for Results
              let btnClass = "border-gray-200 hover:bg-gray-50";
              if (quizAnswered) {
                if (idx === dailyQuiz.correct_option_index) btnClass = "bg-green-100 border-green-500 text-green-800";
                else if (idx === selectedOption && !quizResult) btnClass = "bg-red-100 border-red-500 text-red-800";
                else btnClass = "opacity-50";
              } else if (selectedOption === idx) {
                btnClass = "border-purple-500 bg-purple-50 text-purple-700";
              }

              return (
                <button
                  key={idx}
                  disabled={quizAnswered}
                  onClick={() => setSelectedOption(idx)}
                  className={`w-full text-left p-3 rounded-xl border text-sm font-medium transition-all ${btnClass}`}
                >
                  {opt}
                </button>
              );
            })}
          </div>

          {!quizAnswered && (
            <button 
              onClick={handleQuizSubmit}
              disabled={selectedOption === null}
              className="mt-4 w-full bg-purple-600 text-white py-2 rounded-xl font-bold text-sm disabled:opacity-50"
            >
              Submit Answer
            </button>
          )}

          {quizAnswered && (
             <div className={`mt-4 text-center text-sm font-bold ${quizResult ? 'text-green-600' : 'text-red-500'}`}>
                {quizResult ? "Correct! Points added." : "Oops! Better luck tomorrow."}
             </div>
          )}
        </div>
      )}

      {/* 2. CHALLENGES LIST */}
      <h3 className="font-bold text-xl text-gray-900 dark:text-white">Active Challenges</h3>
      
      <div className="space-y-4">
        {challenges.map(challenge => {
          const isDone = isChallengeDone(challenge.id);
          return (
            <div key={challenge.id} className="glass-card p-5 flex flex-col sm:flex-row items-start gap-4">
              <div className="bg-emerald-100 dark:bg-emerald-900/30 p-3 rounded-full">
                <Camera className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <h4 className="font-bold text-gray-900 dark:text-white">{challenge.title}</h4>
                  <span className="text-xs font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">
                    +{challenge.points_reward} Pts
                  </span>
                </div>
                <p className="text-sm text-gray-500 mt-1 mb-4">{challenge.description}</p>
                
                {isDone ? (
                  <button disabled className="w-full bg-gray-100 text-gray-400 font-bold py-2 rounded-xl flex items-center justify-center gap-2 cursor-not-allowed">
                    <CheckCircle className="w-4 h-4" /> Completed
                  </button>
                ) : (
                  <button 
                    onClick={() => startCamera(challenge)}
                    className="w-full bg-emerald-600 text-white font-bold py-2 rounded-xl flex items-center justify-center gap-2 hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-500/20"
                  >
                    <Camera className="w-4 h-4" /> Upload Proof
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. FULL SCREEN CAMERA MODAL */}
      {cameraOpen && (
        <div className="fixed inset-0 z-[100] bg-black flex flex-col">
          <div className="flex justify-between items-center p-4">
            <span className="text-white font-bold">Take Photo</span>
            <button onClick={stopCamera} className="p-2 bg-white/20 rounded-full text-white">
               <X className="w-6 h-6" />
            </button>
          </div>
          
          <div className="flex-1 relative bg-black flex items-center justify-center overflow-hidden">
             <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
          </div>

          <div className="p-8 bg-black flex justify-center">
             <button 
               onClick={capturePhoto}
               className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center hover:scale-110 transition-transform bg-white/20"
             >
               <div className="w-16 h-16 bg-white rounded-full"></div>
             </button>
          </div>
        </div>
      )}

      {/* 4. UPLOADING OVERLAY */}
      {uploading && (
        <div className="fixed inset-0 z-[110] bg-black/80 flex flex-col items-center justify-center text-white">
           <Loader2 className="w-12 h-12 animate-spin mb-4 text-emerald-500" />
           <p className="font-bold text-lg">Uploading Proof...</p>
           <p className="text-sm text-gray-400">Verifying location & image</p>
        </div>
      )}
    </div>
  );
}
