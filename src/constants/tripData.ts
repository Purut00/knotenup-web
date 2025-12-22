// src/constants/tripData.ts

export const TRIP_CATEGORIES = [
  { key: 'hiking',      label: 'Hiking',      icon: 'fas fa-hiking' },
  { key: 'camping',     label: 'Camping',     icon: 'fas fa-campground' },
  { key: 'climbing',    label: 'Climbing',    icon: 'fas fa-mountain' },
  { key: 'caving',      label: 'Caving',      icon: 'fas fa-dungeon' },
  { key: 'kayaking',    label: 'Kayaking',    icon: 'fas fa-sailboat' },
  { key: 'rafting',     label: 'Rafting',     icon: 'fas fa-water' },
  { key: 'paragliding', label: 'Paragliding', icon: 'fas fa-paper-plane' },
  { key: 'fishing',     label: 'Fishing',     icon: 'fas fa-fish' },
];

export const LOCATIONS = [
  "Selangor",
  "Kuala Lumpur",
  "Pahang",
  "Perak",
  "Sabah",
  "Sarawak",
  "Penang",
  "Johor",
  "Terengganu"
];

export const DIFFICULTY_LEVELS = [
  { value: 'Easy',     label: 'Mudah' },
  { value: 'Moderate', label: 'Sederhana' },
  { value: 'Hard',     label: 'Sukar' }
];

export const DATE_FILTERS = [
  { value: 'week',  label: 'Minggu Ini' }, // Label boleh guna i18n key nanti
  { value: 'month', label: 'Bulan Depan' }
];