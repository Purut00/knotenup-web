// src/constants/homeData.ts

export const POPULAR_ACTIVITIES = [
  { key: 'hiking',       icon: 'fas fa-hiking',          color: '#48bb78' },
  { key: 'camping',      icon: 'fas fa-campground',      color: '#ed8936' },
  { key: 'climbing',     icon: 'fas fa-mountain',        color: '#718096' },
  { key: 'caving',       icon: 'fas fa-dungeon',         color: '#a0aec0' },
  { key: 'kayaking',     icon: 'fas fa-sailboat',        color: '#38b2ac' },
  { key: 'rafting',      icon: 'fas fa-water',           color: '#3182ce' },
  { key: 'fishing',      icon: 'fas fa-fish',            color: '#2b6cb0' },
  { key: 'paragliding',  icon: 'fas fa-paper-plane',     color: '#9f7aea' },
];

export const DEFAULT_BANNERS = {
  large: [
    { imageUrl: 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=800', linkUrl: '/trips', title: 'home.bannerExplore' },
    { imageUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800', linkUrl: '/forum', title: 'home.bannerCommunity' }
  ],
  small1: { imageUrl: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=500', linkUrl: '/trips' },
  small2: { imageUrl: 'https://images.unsplash.com/photo-1504851149312-7a075b496cc7?w=500', linkUrl: '/trips' }
};