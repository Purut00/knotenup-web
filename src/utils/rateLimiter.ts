const LIMIT_COUNT = 3;      // Maksimum 3 kali
const LIMIT_TIME = 60000;   // Dalam masa 1 minit (60,000ms)
const BLOCK_TIME = 300000;  // Kena ban 5 minit (300,000ms)

export const checkRateLimit = (actionName: string): { allowed: boolean; message?: string } => {
  const now = Date.now();
  const storageKey = `rate_limit_${actionName}`; // cth: rate_limit_comment
  
  // Ambil data lama dari LocalStorage
  const record = JSON.parse(localStorage.getItem(storageKey) || '{}');

  // 1. Cek jika sedang kena BLOK
  if (record.blockUntil && now < record.blockUntil) {
    const minutesLeft = Math.ceil((record.blockUntil - now) / 60000);
    return { 
      allowed: false, 
      message: `⛔ Spam dikesan! Sila tunggu ${minutesLeft} minit sebelum mencuba lagi.` 
    };
  }

  // 2. Jika masa "window" dah tamat (lebih 1 minit dari 1st post), reset balik
  if (!record.windowStart || now - record.windowStart > LIMIT_TIME) {
    const newData = { windowStart: now, count: 1, blockUntil: 0 };
    localStorage.setItem(storageKey, JSON.stringify(newData));
    return { allowed: true };
  }

  // 3. Jika masih dalam masa 1 minit, tambah count
  record.count++;

  // 4. Jika count melebih had -> JATUHKAN HUKUMAN
  if (record.count > LIMIT_COUNT) {
    record.blockUntil = now + BLOCK_TIME; // Set masa depan untuk unblock
    localStorage.setItem(storageKey, JSON.stringify(record));
    return { 
      allowed: false, 
      message: "⛔ Anda melakukan aktiviti terlalu pantas! Akaun dikunci sementara selama 5 minit." 
    };
  }

  // Simpan rekod terkini
  localStorage.setItem(storageKey, JSON.stringify(record));
  return { allowed: true };
};