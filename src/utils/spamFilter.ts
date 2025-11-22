// Senarai perkataan yang dilarang (Case insensitive)
// Boleh tambah lagi ikut keperluan
const BLACKLIST_WORDS = [
  "judi",
  "casino",
  "slot",
  "poker",
  "pinjaman",
  "loan",
  "along",
  "sex",
  "lucah",
  "porn",
  "xxx",
  "betting",
  "jackpot",
  "transfer duit",
  "mudah lulus"
];

// Fungsi untuk semak teks
export const isSpam = (text: string): boolean => {
  if (!text) return false;
  
  const lowerText = text.toLowerCase();
  
  // Cek jika ada mana-mana perkataan haram dalam teks
  return BLACKLIST_WORDS.some(word => lowerText.includes(word));
};

// Fungsi untuk dapatkan perkataan mana yang trigger (untuk debug/warning)
export const getDetectedSpamWord = (text: string): string | undefined => {
  if (!text) return undefined;
  const lowerText = text.toLowerCase();
  return BLACKLIST_WORDS.find(word => lowerText.includes(word));
};