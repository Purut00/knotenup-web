// src/utils/dateUtils.ts

// Fungsi untuk format tarikh (contoh: "25 Dec")
export const formatDate = (dateString: string, locale: string = 'en'): string => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString(locale, {
    day: 'numeric',
    month: 'short'
  });
};

// Fungsi "Time Ago" (contoh: "2 jam lepas")
export const getTimeAgo = (timestamp: any, t: (key: string) => string): string => {
  if (!timestamp) return t('time.justNow');
  
  const date = timestamp.seconds ? new Date(timestamp.seconds * 1000) : new Date();
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return `${seconds}${t('time.s')}`; // saat
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}${t('time.m')}`; // minit
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}${t('time.h')}`; // jam
  return `${Math.floor(hours / 24)}${t('time.d')}`; // hari
};