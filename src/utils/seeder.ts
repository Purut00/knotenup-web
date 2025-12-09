import { db, auth } from '../firebaseConfig';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

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
export const seedSpots = async (count: number = 5) => {
  if (!auth.currentUser) return alert("Sila login dahulu.");
  const user = auth.currentUser;

  console.log(`Menjana ${count} spot...`);

  for (let i = 0; i < count; i++) {
    const type = getRandom(spotTypes);
    const data = {
      name: getRandom(spotNames) + ` (Laluan ${Math.floor(Math.random() * 5) + 1})`,
      category: type, // Eg: Hill, Waterfall
      state: getRandom(locations),
      height: Math.floor(Math.random() * 2000) + 300, // 300m - 2300m
      difficulty: getRandom(["Easy", "Moderate", "Hard", "Extreme"]),
      permit: getRandom(["Perlu (Pejabat Hutan)", "Perlu (Polis)", "Tidak Perlu"]),
      guideRequired: getRandom(["Yes", "No", "Optional"]),
      via: "Pintu Rimba Utama",
      description: "Trek yang mencabar tetapi pemandangan di puncak sangat berbaloi. Sesuai untuk latihan stamina.",
      tips: "Hati-hati banyak pacat selepas hujan.",
      parking: "Parking disediakan RM5.",
      checkpointDetail: "CP1 (Sungai) -> CP2 (Batu Besar) -> Puncak",
      mapsLink: "https://maps.google.com",
      image: getRandomImage('nature'),
      images: [getRandomImage('nature'), getRandomImage('view')],
      contributorId: user.uid,
      contributorName: user.displayName || 'Contributor',
      createdAt: serverTimestamp()
    };

    try { await addDoc(collection(db, "spots"), data); } catch (e) { console.error(e); }
  }
  alert(`✅ ${count} Spot berjaya dijana!`);
};