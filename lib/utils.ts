import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// --- CSS MERGER (Standard in Next.js) ---
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- DATE FORMATTER (Ported from your utils.js) ---
export const formatDate = (dateString: string | null | undefined) => {
  if (!dateString) return '...';
  return new Date(dateString).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: 'Asia/Kolkata'
  });
};

// --- IMAGE HELPERS ---
export const getPlaceholderImage = (size = '400x300', text = 'EcoCampus') => {
  return `https://placehold.co/${size}/EBFBEE/166534?text=${encodeURIComponent(text)}&font=inter`;
};

export const getTickImageUrl = (tickType: string | null) => {
  if (!tickType) return null;
  const map: Record<string, string> = {
    blue: 'https://i.ibb.co/kgJpMCHr/blue.png',
    silver: 'https://i.ibb.co/gLJLF9Z2/silver.png',
    gold: 'https://i.ibb.co/Q2C7MrM/gold.png',
    black: 'https://i.ibb.co/zVNSNzrK/black.png',
    green: 'https://i.ibb.co/SXGL4Nq0/green.png'
  };
  return map[tickType.toLowerCase()] || null;
};

export const getUserInitials = (fullName: string | null) => {
  if (!fullName) return '..';
  return fullName.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
};

// --- CLOUDINARY UPLOAD (Ported) ---
export const uploadToCloudinary = async (file: File) => {
  const CLOUD_NAME = 'dnia8lb2q'; // From your state.js
  const UPLOAD_PRESET = 'EcoBirla_avatars'; // From your state.js
  const API_URL = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`;

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', UPLOAD_PRESET);

  try {
    const res = await fetch(API_URL, { method: 'POST', body: formData });
    const data = await res.json();
    if (data.error) throw new Error(data.error.message);
    return data.secure_url;
  } catch (err: any) {
    console.error("Cloudinary Upload Error:", err);
    throw err;
  }
};
