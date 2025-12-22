// src/types/index.ts

import { Timestamp } from 'firebase/firestore';

export interface Trip {
  id: string;
  title: string;
  startDate: string; // ISO String stored in DB
  endDate?: string;
  location: string;
  category: string;
  difficulty: 'Easy' | 'Moderate' | 'Hard' | string;
  price?: number;
  status: string;
  organizerId?: string;
  createdAt?: Timestamp;
  // Field tambahan untuk UI jika perlu
  [key: string]: any; 
}

export interface ForumPost {
  id: string;
  title: string;
  content: string;
  authorId: string;
  authorName: string;
  authorPhoto?: string;
  category: string;
  likes: number;
  commentCount: number;
  createdAt: Timestamp;
  // Field UI tambahan
  timeAgo?: string; 
  [key: string]: any;
}

export interface Service {
  id: string;
  name: string;
  category: string;
  state: string; // Negeri
  location: string;
  image?: string;
  ownerId: string;
  ownerName: string;
  ownerAvatar?: string;
  whatsapp: string;
  expiryDate?: Timestamp;
  createdAt: Timestamp;
  details?: {
    price?: number;
    priceDisplay?: string;
    priceType?: string; // e.g., "per pax", "per hari"
    [key: string]: any;
  };
  // Field tambahan lain
  [key: string]: any;
}

export interface Spot {
  id: string;
  name: string;
  state: string;
  category: string;     // e.g. "Mountain", "Waterfall"
  difficulty: string;   // e.g. "Easy", "Hard"
  height?: number;
  permit: string;       // e.g. "Yes", "No"
  image?: string;
  location?: string;    // Coordinate or specific place name
  description?: string;
  createdAt: Timestamp;
  // Field tambahan
  [key: string]: any;
}

export interface UserProfile {
  id: string;
  name: string;
  bio: string;
  avatar: string;
  role: 'user' | 'organizer' | 'admin';
  organizerStatus?: string;
  // Media sosial (Flat structure ikut DB asal)
  whatsapp?: string;
  facebook?: string;
  instagram?: string;
  tiktok?: string;
  youtube?: string;
  // Organizer Info
  organizerDetails?: {
    orgName?: string;
    ssm?: string;
    license?: string;
  };
  [key: string]: any; // Fallback
}

// Interface untuk Data Peribadi (Private Subcollection)
export interface UserPrivateData {
  bloodType: string;
  allergies: string;
  emergencyContact: string;
  email?: string;
  phone?: string;
}

// Interface untuk Trip (Ringkas untuk Profile)
export interface TripSummary {
  id: string;
  title: string;
  startDate: string; // ISO string
  location: string;
  destination?: string; // Handle legacy field
  organizerId: string;
  commentCount?: number;
}

export interface BannerSlide {
  imageUrl: string;
  linkUrl: string;
  title?: string;
}