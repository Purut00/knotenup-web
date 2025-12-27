import { db } from '../firebaseConfig';
import { collection, writeBatch, doc } from 'firebase/firestore';

const MALAYSIAN_SPOTS = [
  // PAHANG
  { name: "Gunung Tahan", state: "Pahang", height: 2187, difficulty: "Hard", category: "Mountain", lat: 4.633, lng: 102.233, description: "Gunung tertinggi di Semenanjung Malaysia. Laluan mencabar melalui Kuala Tahan atau Merapoh." },
  { name: "Gunung Irau", state: "Pahang", height: 2110, difficulty: "Moderate", category: "Mountain", lat: 4.529, lng: 101.365, description: "Hutan mossy (lumut) yang sangat cantik, dikenali sebagai Mossy Forest." },
  { name: "Bukit Fraser", state: "Pahang", height: 1200, difficulty: "Easy", category: "Hill", lat: 3.71, lng: 101.73, description: "Destinasi percutian tanah tinggi dengan pelbagai trail santai seperti Pine Tree Trail." },

  // PERAK
  { name: "Gunung Korbu", state: "Perak", height: 2183, difficulty: "Hard", category: "Mountain", lat: 4.683, lng: 101.3, description: "Puncak kedua tertinggi di Semenanjung. Sebahagian daripada trans Titiwangsa V1/V2." },
  { name: "Gunung Yong Belar", state: "Perak", height: 2181, difficulty: "Hard", category: "Mountain", lat: 4.65, lng: 101.36, description: "Salah satu G7. Trek mencabar dengan pemandangan 3 negeri dari puncak." },
  { name: "Bukit Batu Putih", state: "Perak", height: 350, difficulty: "Easy", category: "Hill", lat: 4.2, lng: 100.56, description: "Terletak di Port Dickson, pemandangan laut yang sangat cantik dari puncak batu kapur." },

  // SELANGOR
  { name: "Bukit Broga", state: "Selangor", height: 400, difficulty: "Easy", category: "Hill", lat: 2.93, lng: 101.9, description: "Sangat popular untuk sunrise. Laluan lalang yang mudah dan pemandangan luas." },
  { name: "Gunung Nuang", state: "Selangor", height: 1493, difficulty: "Hard", category: "Mountain", lat: 3.26, lng: 101.9, description: "Gunung tertinggi di Selangor. Latihan ketahanan popular untuk pendaki." },
  { name: "Bukit Tabur West", state: "Selangor", height: 396, difficulty: "Moderate", category: "Hill", lat: 3.23, lng: 101.75, description: "Permatang kuarza terpanjang di dunia. Pemandangan empangan klang gate yang ikonik." },
  { name: "Bukit Gasing", state: "Selangor", height: 160, difficulty: "Easy", category: "Hill", lat: 3.09, lng: 101.65, description: "Hutan bandar yang popular di PJ, sesuai untuk latihan harian." },

  // JOHOR
  { name: "Gunung Ledang", state: "Johor", height: 1276, difficulty: "Hard", category: "Mountain", lat: 2.37, lng: 102.6, description: "Gunung lagenda Puteri Gunung Ledang. Trek teknikal berbatu (KFC trail)." },
  { name: "Gunung Bekok", state: "Johor", height: 953, difficulty: "Moderate", category: "Mountain", lat: 2.41, lng: 103.17, description: "Hutan simpan Labis, perlukan 4x4 untuk ke starting point. Pemandangan air terjun cantik." },
  { name: "Bukit Batu Pahat", state: "Johor", height: 200, difficulty: "Easy", category: "Hill", lat: 1.85, lng: 102.93, description: "Popular dikalangan penduduk tempatan untuk riadah petang." },

  // SABAH & SARAWAK
  { name: "Gunung Kinabalu", state: "Sabah", height: 4095, difficulty: "Hard", category: "Mountain", lat: 6.07, lng: 116.55, description: "Gunung tertinggi di Malaysia dan Asia Tenggara. Tapak Warisan Dunia UNESCO." },
  { name: "Gunung Trusmadi", state: "Sabah", height: 2642, difficulty: "Hard", category: "Mountain", lat: 5.55, lng: 116.51, description: "Kedua tertinggi di Malaysia. Flora dan fauna yang sangat unik (Pitcher Plant)." },
  { name: "Gunung Mulu", state: "Sarawak", height: 2376, difficulty: "Hard", category: "Mountain", lat: 4.04, lng: 114.93, description: "Terkenal dengan Mulu Pinnacles (Batu Kapur Tajam). Cabaran teknikal tinggi." },

  // N. SEMBILAN
  { name: "Gunung Datuk", state: "Negeri Sembilan", height: 884, difficulty: "Moderate", category: "Mountain", lat: 2.55, lng: 102.21, description: "Puncak batu besar yang menawarkan pemandangan 360 darjah Selat Melaka." },
  { name: "Gunung Angsi", state: "Negeri Sembilan", height: 825, difficulty: "Moderate", category: "Mountain", lat: 2.69, lng: 102.05, description: "Hutan rekreasi Ulu Bendul. Trek santai tapi mencabar stamina." },

  // OTHERS
  { name: "Gunung Jerai", state: "Kedah", height: 1217, difficulty: "Moderate", category: "Mountain", lat: 5.79, lng: 100.43, description: "Gunung bersejarah yang menjadi panduan pelayar purba. Boleh naik van atau hiking." },
  { name: "Bukit Bendera (Penang Hill)", state: "Pulau Pinang", height: 833, difficulty: "Easy", category: "Hill", lat: 5.42, lng: 100.27, description: "Tarikan pelancong utama, boleh hiking melalui Heritage Trail atau naik keretapi funikular." }
];

export async function seedSpots() {
  console.log("Starting seeding...");
  const batch = writeBatch(db);
  const spotsRef = collection(db, "spots");

  try {
    // Check existing to avoid duplicates (optional, but good practice)
    // For simplicity, we just add. Real prod might check name.

    let count = 0;
    for (const spot of MALAYSIAN_SPOTS) {
      // Create a new doc ref for every spot
      const newDocRef = doc(spotsRef);
      batch.set(newDocRef, {
        ...spot,
        name_lowercase: spot.name.toLowerCase(),
        createdAt: new Date(),
        updatedAt: new Date(),
        permit: "Unknown", // Default
        images: [], // Empty for now
        rating: 0,
        reviewCount: 0
      });
      count++;
    }

    await batch.commit();
    console.log(`Successfully seeded ${count} spots!`);
    return { success: true, count };
  } catch (error) {
    console.error("Seeding failed:", error);
    return { success: false, error };
  }
}

import MOUNTAIN_DATA from './gunung_siap_negeri.json';
import { GeoPoint } from 'firebase/firestore';

export async function seedRealSpots() {
  console.log("Starting real data seeding...");

  // Confirmation
  if (!confirm(`Are you sure you want to import ${MOUNTAIN_DATA.length} spots? This might take a while.`)) return;

  const BATCH_SIZE = 450; // Firestore limit is 500
  const chunks = [];

  // Break into chunks
  for (let i = 0; i < MOUNTAIN_DATA.length; i += BATCH_SIZE) {
    chunks.push(MOUNTAIN_DATA.slice(i, i + BATCH_SIZE));
  }

  let totalProcessed = 0;
  let totalBatches = chunks.length;

  console.log(`Processing ${totalBatches} batches...`);

  try {
    for (let i = 0; i < chunks.length; i++) {
      const batch = writeBatch(db);
      const chunk = chunks[i];
      if (!chunk) continue;

      chunk.forEach((item: any) => {
        const newDocRef = doc(collection(db, "spots"));

        // Parse Height
        let heightVal: number | null = item.ele ? parseInt(item.ele) : null;
        if (heightVal !== null && isNaN(heightVal)) heightVal = null;

        // Parse Lat/Lng
        const lat = parseFloat(item["@lat"]);
        const lng = parseFloat(item["@lon"]);

        // Basic validation
        if (!item.name || isNaN(lat) || isNaN(lng)) return;

        const spotData = {
          name: item.name,
          name_lowercase: item.name.toLowerCase().trim(),
          state: item.state || "Unknown",
          height: heightVal,
          location: new GeoPoint(lat, lng),
          latitude: lat.toString(), // Keep string version for form compatibility
          longitude: lng.toString(),

          // Defaults
          difficulty: "Moderate",
          permit: "Unknown",
          guideRequired: "Unknown",
          description: "Imported from Mountain Database",
          images: [],
          tips: "",
          parking: "",

          // Meta
          createdAt: new Date(),
          updatedAt: new Date(),
          contributorName: "Admin Seeder",
          contributorId: "system_admin",
          isSystemSeeded: true, // Marker for cleanup if needed

          rating: 0,
          reviewCount: 0
        };

        batch.set(newDocRef, spotData);
      });

      await batch.commit();
      totalProcessed += chunk.length;
      console.log(`Committed batch ${i + 1}/${totalBatches}`);
    }

    alert(`Successfully imported ${totalProcessed} spots!`);
    return { success: true, count: totalProcessed };

  } catch (error) {
    console.error("Seeding failed:", error);
    alert("Seeding failed. Check console.");
    return { success: false, error };
  }
}