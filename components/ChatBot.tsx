"use client";

import { useState, useRef, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { MessageCircle, X, Send, Loader2, Sparkles, Bot } from "lucide-react";

interface Message {
  role: 'user' | 'bot';
  content: string;
}

export default function ChatBot({ user }: { user: any }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'bot', content: `Hi ${user.full_name.split(' ')[0]}! I'm EcoBuddy. Ask me about events, recycling tips, or your points!` }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  // Context Data for the AI
  const [contextData, setContextData] = useState<string>("");

  const supabase = createClient();

  // 1. Fetch Context when Chat Opens (RAG - Retrieval Augmented Generation)
  useEffect(() => {
    if (isOpen && !contextData) {
      const fetchContext = async () => {
        const [events, products] = await Promise.all([
          supabase.from('events').select('title, start_at').gte('start_at', new Date().toISOString()).limit(3),
          supabase.from('products').select('name, ecopoints_cost').limit(3)
        ]);
        
        const contextString = `
          User: ${user.full_name}, Points: ${user.current_points}.
          Upcoming Events: ${events.data?.map(e => e.title).join(', ') || 'None'}.
          Store Items: ${products.data?.map(p => `${p.name} (${p.ecopoints_cost}pts)`).join(', ') || 'None'}.
        `;
        setContextData(contextString);
      };
      fetchContext();
    }
  }, [isOpen, user, contextData, supabase]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setLoading(true);

    try {
      // Call Supabase Edge Function
      const { data, error } = await supabase.functions.invoke('chat-ai', {
        body: { 
          query: userMsg,
          context: contextData // Pass live app data to the AI
        }
      });

      if (error) throw error;

      const botReply = data?.answer || "I'm having trouble connecting to the green network right now. Try again later!";
      
      setMessages(prev => [...prev, { role: 'bot', content: botReply }]);

    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { role: 'bot', content: "Sorry, I'm offline at the moment. 🍂" }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* 1. FLOATING TOGGLE BUTTON */}
      <button 
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-24 right-4 lg:bottom-8 lg:right-8 z-50 w-14 h-14 bg-gradient-to-br from-emerald-500 to-green-600 rounded-full shadow-xl flex items-center justify-center text-white transition-transform hover:scale-110 active:scale-95 ${isOpen ? 'hidden' : 'flex'}`}
      >
        <MessageCircle className="w-7 h-7" />
        <span className="absolute -top-1 -right-1 flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
        </span>
      </button>

      {/* 2. CHAT WINDOW */}
      <div className={`fixed z-50 transition-all duration-300 ease-in-out ${
        isOpen 
          ? "bottom-0 right-0 w-full h-[85vh] sm:bottom-24 sm:right-8 sm:w-[380px] sm:h-[500px] opacity-100 scale-100" 
          : "bottom-0 right-0 w-0 h-0 opacity-0 scale-90 pointer-events-none"
      }`}>
        <div className="bg-white dark:bg-gray-900 w-full h-full sm:rounded-2xl shadow-2xl flex flex-col border border-gray-200 dark:border-gray-800 overflow-hidden">
          
          {/* Header */}
          <div className="bg-emerald-600 p-4 flex justify-between items-center text-white">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-sm">EcoBuddy</h3>
                <p className="text-[10px] text-emerald-100 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-green-300 rounded-full animate-pulse"></span> Online
                </p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-white/20 rounded-lg transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages Area */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-950">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm shadow-sm ${
                  msg.role === 'user' 
                    ? 'bg-emerald-600 text-white rounded-tr-none' 
                    : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-100 dark:border-gray-700 rounded-tl-none'
                }`}>
                  {msg.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white dark:bg-gray-800 rounded-2xl rounded-tl-none px-4 py-3 shadow-sm border border-gray-100 dark:border-gray-700">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce"></span>
                    <span className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce [animation-delay:-.3s]"></span>
                    <span className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce [animation-delay:-.5s]"></span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input Area */}
          <form onSubmit={handleSend} className="p-3 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800">
            <div className="relative">
              <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about events, points..." 
                className="w-full pl-4 pr-12 py-3 bg-gray-100 dark:bg-gray-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
              />
              <button 
                type="submit" 
                disabled={!input.trim() || loading}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </button>
            </div>
            <div className="text-center mt-2">
               <span className="text-[10px] text-gray-400 flex items-center justify-center gap-1">
                 <Sparkles className="w-3 h-3" /> Powered by Gemini
               </span>
            </div>
          </form>

        </div>
      </div>
    </>
  );
}
