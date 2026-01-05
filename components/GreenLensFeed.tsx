"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowDown, Leaf, Award, Sun, Droplets, ArrowRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

// --- STORY DATA (Ported from gallery.js) ---
const STORIES = [
  {
    id: 'story-hero',
    isHero: true,
    bgHex: '#ffffff',
    darkBgHex: '#111827',
  },
  {
    id: 'story-founder',
    title: 'A Tribute to Our Founder’s Vision',
    subtitle: 'Heritage & Values',
    description: 'The sustainable journey of our campus is deeply rooted in the values of Shri Basant Kumar Birla. His belief in holistic education, social responsibility, and harmony with nature continues to inspire every initiative on campus.',
    image: 'https://i.ibb.co/vvCZM79R/DSC-4208-1.jpg',
    bgHex: '#004d29', // Deep Green
    accentColor: 'bg-emerald-500',
    textClass: 'text-emerald-50',
    isDark: true
  },
  {
    id: 'story-green-cover',
    title: 'Green Lush Campus',
    subtitle: 'Biodiversity',
    description: 'Our campus is home to over 500 species of flora, acting as a green lung for the city. From ancient banyan trees to medicinal herb gardens, we preserve nature in its purest form.',
    image: 'https://images.unsplash.com/photo-1596356453261-0d265ae2520a?q=80&w=2070&auto=format&fit=crop',
    bgHex: '#064e3b', // Emerald 900
    accentColor: 'bg-green-500',
    textClass: 'text-green-50',
    isDark: true
  },
  {
    id: 'story-water',
    title: 'Water Conservation',
    subtitle: 'Resource Management',
    description: 'With 4 major rainwater harvesting pits and a dedicated sewage treatment plant, we recycle 100% of water used for gardening and maintenance.',
    image: 'https://images.unsplash.com/photo-1546955736-22a0a256d0d2?q=80&w=2070&auto=format&fit=crop',
    bgHex: '#1e3a8a', // Blue 900
    accentColor: 'bg-blue-500',
    textClass: 'text-blue-50',
    isDark: true
  },
  {
    id: 'story-solar',
    title: 'Solar Powered Future',
    subtitle: 'Renewable Energy',
    description: 'Our rooftops are adorned with 50kW solar panels, reducing our carbon footprint by 40 tons annually. We are moving towards a net-zero energy campus.',
    image: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?q=80&w=2072&auto=format&fit=crop',
    bgHex: '#78350f', // Amber 900
    accentColor: 'bg-yellow-500',
    textClass: 'text-amber-50',
    isDark: true
  },
  {
    id: 'story-cta',
    isCTA: true,
    bgHex: '#ffffff',
    darkBgHex: '#000000',
  }
];

export default function GreenLensFeed() {
  const [activeBg, setActiveBg] = useState(STORIES[0].bgHex);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Find the story associated with this section
            const storyId = entry.target.getAttribute('data-id');
            const story = STORIES.find(s => s.id === storyId);
            if (story) {
               // Handle Dark Mode logic if needed, for now using direct hex
               setActiveBg(story.bgHex);
            }
          }
        });
      },
      { threshold: 0.5 } // Trigger when 50% of the card is visible
    );

    const sections = document.querySelectorAll('.gallery-section');
    sections.forEach((s) => observer.observe(s));

    return () => observer.disconnect();
  }, []);

  return (
    <div 
      ref={containerRef}
      className="transition-colors duration-1000 ease-in-out min-h-screen"
      style={{ backgroundColor: activeBg }}
    >
      <div className="max-w-md mx-auto relative">
        
        {/* --- 1. HERO SECTION --- */}
        <section 
          className="gallery-section min-h-screen flex flex-col items-center justify-center p-8 text-center" 
          data-id="story-hero"
        >
          <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mb-6 animate-float">
            <Leaf className="w-12 h-12 text-emerald-600" />
          </div>
          <h1 className="text-5xl font-extrabold text-gray-900 mb-4 tracking-tight">GreenLens</h1>
          <p className="text-xl text-gray-500 mb-12">
            Experience the sustainable journey of our campus through an immersive story.
          </p>
          <div className="animate-bounce">
            <ArrowDown className="w-8 h-8 text-gray-400" />
          </div>
        </section>

        {/* --- 2. DYNAMIC STORIES --- */}
        {STORIES.map((story) => {
          if (story.isHero || story.isCTA) return null;

          return (
            <section 
              key={story.id}
              className="gallery-section min-h-screen flex items-center justify-center p-6"
              data-id={story.id}
            >
              <div className="bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-[2.5rem] shadow-2xl overflow-hidden relative w-full">
                
                {/* Image */}
                <div className="relative h-64 w-full rounded-2xl overflow-hidden mb-6 shadow-lg transform rotate-2 hover:rotate-0 transition-transform duration-500">
                   <img 
                     src={story.image} 
                     alt={story.title} 
                     className="w-full h-full object-cover"
                   />
                   <div className={`absolute top-4 right-4 ${story.accentColor} text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm`}>
                     {story.subtitle}
                   </div>
                </div>

                {/* Content */}
                <div className={story.textClass}>
                  <h2 className="text-3xl font-bold mb-4 leading-tight">{story.title}</h2>
                  <p className="opacity-90 leading-relaxed text-lg font-medium">
                    {story.description}
                  </p>
                </div>

                {/* Decorative Elements */}
                <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/5 rounded-full blur-3xl"></div>
              </div>
            </section>
          );
        })}

        {/* --- 3. CTA SECTION --- */}
        <section 
          className="gallery-section min-h-[70vh] flex flex-col items-center justify-center p-8 text-center" 
          data-id="story-cta"
        >
          <h2 className="text-4xl font-bold text-gray-900 mb-6">Be Part of the Story</h2>
          <p className="text-gray-500 mb-8 max-w-xs mx-auto">
            Your actions today define our campus tomorrow. Start making a difference now.
          </p>
          
          <div className="flex flex-col gap-4 w-full">
            <Link href="/challenges" className="w-full bg-emerald-600 text-white font-bold py-4 rounded-xl shadow-xl hover:bg-emerald-700 transition-transform hover:scale-105 flex items-center justify-center gap-2">
               Start a Challenge <ArrowRight className="w-5 h-5" />
            </Link>
            <Link href="/store" className="w-full bg-white text-gray-900 font-bold py-4 rounded-xl shadow-md border border-gray-200 hover:bg-gray-50 transition-colors">
               Visit EcoStore
            </Link>
          </div>
        </section>

      </div>
    </div>
  );
}
