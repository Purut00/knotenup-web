import { db, auth } from '../firebaseConfig';
import { collection, addDoc, serverTimestamp, } from 'firebase/firestore';
// 1. Tambah import ini di bahagian paling atas file
import { GeoPoint } from 'firebase/firestore'; 
// Pastikan anda dah letak fail bukit_clean.json dalam folder src/utils/
//import mapData from './bukit_clean.json';
import mapData from "./gunung_siap_negeri.json";
// --- DATA LISTS (Campuran Semua Kategori) ---

const tripTitles = [
  "Mendaki Gunung Kinabalu", "Camping Santai Janda Baik", "White Water Rafting Gopeng",
  "Hiking Bukit Tabur", "Scuba Diving Sipadan", "Kayaking Tasik Kenyir",
  "Glamping Cameron Highlands", "Ekspedisi Taman Negara", "Via Ferrata Kinabalu",
  "Mossy Forest Exploration", "Pulau Perhentian Snorkeling", "Gunung Tahan Challenge",
  "ATV Adventure Kemensah", "Paragliding Kuala Kubu Bharu", "Caving Gua Tempurung",
  "Rock Climbing Batu Caves", "Waterfall Abseiling Ulu Yam", "Star Gazing Kudat"
];

const locations = [
  "Sabah", "Pahang", "Perak", "Selangor", "Terengganu", "Kelantan", "Johor", "Kedah", "Pulau Pinang", "Sarawak"
];

const descriptions = [
  "Jom sertai kami untuk pengalaman yang tidak dapat dilupakan! Sesuai untuk beginner.",
  "Trip santai hujung minggu. Makanan disediakan. Bawa diri dan khemah sahaja.",
  "Cabaran fizikal dan mental. Hanya untuk yang berstamina tinggi.",
  "Nikmati keindahan alam semula jadi sambil belajar teknik survival asas.",
  "Pakej lengkap termasuk transport dari KL. Tempat terhad!"
];

const forumTopics = [
  "Kasut hiking terbaik bawah RM200?", "Port camping best untuk family?", "Review khemah Naturehike",
  "Tips elak pacat masa hujan", "Siapa pernah panjat G7? Share tips please.", "Lokasi diving best di Terengganu",
  "Gear wajib untuk beginner", "Perlukah permit untuk Bukit Gasing?", "Pengalaman sesat dalam hutan",
  "Cadangan stove camping yang ringan", "Hammock vs Tent: Mana lagi best?"
];

const forumCategories = ["Hiking", "Camping", "Equipment", "Diving", "General", "Climbing", "Tips"];

const serviceNames = [
  "Sewa Khemah Murah KL", "Guide Gunung Berlesen", "4x4 Transporter Cameron",
  "Chalet Tepi Sungai", "Equipment Rental Shah Alam", "Boat Service Perhentian",
  "Catering Outdoor Masakan Kampung", "Van Persiaran 10 Pax", "Jurufoto Outdoor Professional"
];

const serviceCategories = ["Rental", "Guide", "Transport", "Chalet", "Campsite", "Food", "Photographer"];

const spotNames = [
  "Bukit Broga", "Gunung Nuang", "Air Terjun Chiling", "Pantai Kerachut",
  "Gua Tempurung", "Bukit Tabur", "Gunung Angsi", "Lata Berembun", "Bukit Kutu"
];

const spotTypes = ["Hill", "Mountain", "Waterfall", "Beach", "Cave"];

// --- HELPER FUNCTIONS ---

const getRandom = (arr: any[]) => arr[Math.floor(Math.random() * arr.length)];

const getRandomDate = (startDaysFromNow: number, rangeDays: number) => {
  const date = new Date();
  date.setDate(date.getDate() + startDaysFromNow + Math.floor(Math.random() * rangeDays));
  return date.toISOString();
};

const getRandomImage = (keyword: string) => `https://source.unsplash.com/random/800x600/?${keyword},nature,outdoor&sig=${Math.floor(Math.random() * 1000)}`;

// --- MAIN SEEDER FUNCTIONS ---

// 1. SEED TRIPS (Pelbagai Kategori)
export const seedTrips = async (count: number = 5) => {
  if (!auth.currentUser) return alert("Sila login dahulu.");
  const user = auth.currentUser;
  
  console.log(`Menjana ${count} trip...`);

  for (let i = 0; i < count; i++) {
    const startDateStr = getRandomDate(1, 60);
    const endDateStr = getRandomDate(61, 5);
    const category = getRandom(["Hiking", "Camping", "Rafting", "Diving", "Climbing", "ATV", "Caving"]);
    
    // Kira durasi
    const start = new Date(startDateStr);
    const end = new Date(endDateStr);
    const diffDays = Math.ceil(Math.abs(end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)); 
    const duration = diffDays > 1 ? `${diffDays}H ${diffDays - 1}M` : "Day Trip";

    const data = {
      title: getRandom(tripTitles) + ` #${Math.floor(Math.random() * 999)}`,
      description: getRandom(descriptions),
      location: getRandom(locations),
      category: category,
      difficulty: getRandom(["Easy", "Moderate", "Hard"]),
      startDate: startDateStr,
      endDate: endDateStr,
      duration: duration,
      price: Math.floor(Math.random() * 450) + 30,
      maxSlots: Math.floor(Math.random() * 30) + 5,
      currentSlots: Math.floor(Math.random() * 5),
      status: 'open',
      images: [getRandomImage(category), getRandomImage('mountain'), getRandomImage('forest')],
      image: getRandomImage(category), // Main Image
      
      organizerId: user.uid,
      organizerName: user.displayName || 'Bot Organizer',
      organizerImage: user.photoURL || '',
      
      mandatory: "Headlamp, Kasut Sesuai, Ubat Peribadi",
      tips: "Datang awal, jangan buang sampah.",
      recommended: "Powerbank, Kamera, Jajan",
      includes: ["Permit", "Guide", "Basic First Aid", "Meals"],
      groupLink: "https://chat.whatsapp.com/mocklink",
      createdAt: serverTimestamp()
    };

    try { await addDoc(collection(db, "trips"), data); } catch (e) { console.error(e); }
  }
  alert(`✅ ${count} Trip berjaya dijana!`);
};

// 2. SEED FORUM POSTS
export const seedForumPosts = async (count: number = 5) => {
  if (!auth.currentUser) return alert("Sila login dahulu.");
  const user = auth.currentUser;

  console.log(`Menjana ${count} forum post...`);

  for (let i = 0; i < count; i++) {
    const cat = getRandom(forumCategories);
    const data = {
      title: getRandom(forumTopics),
      content: `Saya nak tanya pendapat kawan-kawan semua tentang topik ni. Ada sesiapa pengalaman? ${getRandom(descriptions)}`,
      category: cat,
      authorId: user.uid,
      author: user.displayName || 'Anon User',
      authorAvatar: user.photoURL || '',
      votes: Math.floor(Math.random() * 50),
      commentCount: Math.floor(Math.random() * 20),
      createdAt: serverTimestamp(),
      image: Math.random() > 0.7 ? getRandomImage(cat) : null // 30% chance ada gambar
    };

    try { await addDoc(collection(db, "forum_posts"), data); } catch (e) { console.error(e); }
  }
  alert(`✅ ${count} Topik Forum berjaya dijana!`);
};

// 3. SEED SERVICES
export const seedServices = async (count: number = 5) => {
  if (!auth.currentUser) return alert("Sila login dahulu.");
  const user = auth.currentUser;

  console.log(`Menjana ${count} servis...`);

  for (let i = 0; i < count; i++) {
    const cat = getRandom(serviceCategories);
    const data = {
      name: getRandom(serviceNames) + ` ${Math.floor(Math.random() * 100)}`,
      category: cat,
      state: getRandom(locations),
      location: "Kawasan Sekitar " + getRandom(locations),
      description: "Kami menyediakan perkhidmatan terbaik dengan harga berpatutan. Hubungi kami segera!",
      whatsapp: "0123456789",
      ownerId: user.uid,
      ownerName: user.displayName || 'Service Provider',
      ownerAvatar: user.photoURL || '',
      image: getRandomImage(cat),
      images: [getRandomImage(cat), getRandomImage('gear')],
      createdAt: serverTimestamp(),
      details: {
        price: Math.floor(Math.random() * 200) + 20,
        priceType: getRandom(['pax', 'group', 'day', 'trip']),
        priceDisplay: `RM${Math.floor(Math.random() * 100)} / pax`,
        facilities: ["Toilet", "Parking", "Surau"],
        checkIn: "14:00",
        checkOut: "12:00"
      }
    };

    try { await addDoc(collection(db, "services"), data); } catch (e) { console.error(e); }
  }
  alert(`✅ ${count} Servis berjaya dijana!`);
};

// 4. SEED SPOTS
export const seedRealSpots = async () => {
  if (!auth.currentUser) return alert("Sila login sebagai admin.");
  
  // UBAH SINI 1: Pastikan code boleh baca format Array (dari Python) atau Features (GeoJSON)
  // Kalau data awak format '[{...}, {...}]', dia akan guna direct 'mapData'
  const places = Array.isArray(mapData) ? mapData : ((mapData as any).features || []);
  
  if(!confirm(`Adakah anda pasti nak import ${places.length} data bukit?`)) return;

  console.log(`Mula memproses ${places.length} data...`);
  let count = 0;

  for (const item of places) {
    try {
      // UBAH SINI 2: Setup variable props supaya boleh baca data dari Python (Flat) atau GeoJSON
      // Kalau GeoJSON, data ada dalam .properties. Kalau Flat, data ada dalam item tu sendiri.
      const itemProps = (item.properties || item || {}) as any;

      // UBAH SINI 3: LOGIC AMBIL NEGERI
      // Cari column 'state', 'admin1', atau 'State'. Kalau tak jumpa baru pakai "Malaysia"
      const detectedState = itemProps.state || itemProps.admin1 || itemProps.State || "Malaysia";

      // 1. AMBIL KOORDINAT 
      // Kita kena check dua tempat sebab format Python & GeoJSON beza
      let lng = 0;
      let lat = 0;

      if (item.geometry && item.geometry.coordinates) {
         // Ini kalau format GeoJSON
         lng = item.geometry.coordinates[0];
         lat = item.geometry.coordinates[1];
      } else {
         // Ini kalau format Python (Flat JSON)
         // Python selalunya guna key '@lat' atau 'lat'
         lat = parseFloat(item['@lat'] || item.lat || 0);
         lng = parseFloat(item['@lon'] || item.lon || item.lng || 0);
      }
      
      // 2. NAMA
      const name = (itemProps.name || itemProps.Name || "Unknown Spot") + "";

      // 3. DESCRIPTION & HEIGHT (Kekal macam code asal awak)
      let rawDesc = "";
      let height = 0;

      if (itemProps.description) {
        if (typeof itemProps.description === 'object' && itemProps.description.value) {
           rawDesc = String(itemProps.description.value || ""); 
        } 
        else if (typeof itemProps.description === 'string') {
           rawDesc = String(itemProps.description || "");
        }
      }

      const heightMatch = rawDesc.match(/Height\s*\(m\)\s*(\d+)/i);
      if (heightMatch && heightMatch[1]) {
        height = parseInt(heightMatch[1], 10);
      } else {
        const nameMatch = name.match(/(\d+)\s*m/i);
        if (nameMatch && nameMatch[1]) height = parseInt(nameMatch[1], 10);
      }

      const cleanDesc = rawDesc
        .replace(/<[^>]*>?/gm, ' ') 
        .replace(/ /g, ' ')
        .replace(/\s+/g, ' ') 
        .trim();

      // 4. MASUK DATABASE
      await addDoc(collection(db, "spots"), {
        name: name,
        location: new GeoPoint(lat, lng),
        height: Number(height),
        category: "Mountain", 
        
        // UBAH SINI 4: Jangan hardcode "Malaysia". Guna variable tadi.
        state: detectedState, 
        
        difficulty: height > 1000 ? "Hard" : "Moderate",
        description: cleanDesc || `Lokasi hiking di ${detectedState}: ${name}`, // Update description sikit
        images: [],
        features: [],
        contributorId: auth.currentUser?.uid || "admin",
        createdAt: serverTimestamp(),
        isVisible: true
      });

      count++;
      console.log(`[OK] ${name} (${detectedState})`); // Console log boleh nampak negeri
      
    } catch (e) {
      console.error("Gagal import item:", item, e);
    }
  }
  
  alert(`✅ Siap! ${count} bukit berjaya diimport.`);
};