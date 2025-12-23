import { collection, addDoc, GeoPoint, serverTimestamp } from "firebase/firestore";
import { db, auth } from "../firebaseConfig";
import mapData from "./gunung_siap_negeri.json"; // Pastikan path ini betul

// Helper function (kekal sama)
const cleanText = (text: any) => {
  if (!text) return "";
  const str = String(text);
  return str.replace(/<[^>]*>?/gm, ' ').replace(/ /g, ' ').replace(/\s+/g, ' ').trim();
};

export const seedRealSpots = async () => {
  if (!auth.currentUser) return alert("Sila login sebagai admin.");
  
  // Detect Format Data
  const places = Array.isArray(mapData) ? mapData : ((mapData as any).features || []);
  
  if(!confirm(`Adakah anda pasti nak import ${places.length} data bukit?`)) return;

  console.log(`Mula memproses ${places.length} data...`);
  let count = 0;

  for (const item of places) {
    try {
      const itemProps = (item.properties || item || {}) as any;

      // --- 1. LOGIC NEGERI (Kekal) ---
      const detectedState = itemProps.state || itemProps.admin1 || itemProps.State || "Malaysia";

      // --- 2. LOGIC KOORDINAT (Kekal) ---
      let lng = 0;
      let lat = 0;

      if (item.geometry && item.geometry.coordinates) {
         lng = item.geometry.coordinates[0];
         lat = item.geometry.coordinates[1];
      } else {
         lat = parseFloat(item['@lat'] || item.lat || 0);
         lng = parseFloat(item['@lon'] || item.lon || item.lng || 0);
      }
      
      const name = (itemProps.name || itemProps.Name || "Unknown Spot") + "";

      // --- 3. LOGIC HEIGHT / ELEVATION (UPDATED) ---
      let height = 0;
      let rawDesc = "";

      // A. Cuba ambil terus dari data JSON (key: 'ele' atau 'elevation')
      if (itemProps.ele) {
        height = parseInt(itemProps.ele, 10);
      } else if (itemProps.elevation) {
        height = parseInt(itemProps.elevation, 10);
      } else if (itemProps.height) { // Kadang-kadang key dia 'height'
        height = parseInt(itemProps.height, 10);
      }

      // Prepare description text
      if (itemProps.description) {
        if (typeof itemProps.description === 'object' && itemProps.description.value) {
           rawDesc = String(itemProps.description.value || ""); 
        } 
        else if (typeof itemProps.description === 'string') {
           rawDesc = String(itemProps.description || "");
        }
      }

      // B. Kalau Height masih 0, baru guna Regex cari dalam text (Fallback)
      if (height === 0) {
          const heightMatch = rawDesc.match(/Height\s*\(m\)\s*(\d+)/i);
          if (heightMatch && heightMatch[1]) {
            height = parseInt(heightMatch[1], 10);
          } else {
            const nameMatch = name.match(/(\d+)\s*m/i);
            if (nameMatch && nameMatch[1]) height = parseInt(nameMatch[1], 10);
          }
      }

      const cleanDesc = cleanText(rawDesc);

      // --- 4. MASUK DATABASE (UPDATED PERMIT) ---
      await addDoc(collection(db, "spots"), {
        name: name,
        location: new GeoPoint(lat, lng),
        height: Number(height), // Akan jadi nombor ketinggian atau 0
        category: "Mountain", 
        
        state: detectedState, 
        
        difficulty: height > 1000 ? "Hard" : "Moderate",
        description: cleanDesc || `Lokasi hiking di ${detectedState}: ${name}`,
        
        // UPDATE BARU: Tambah Permit 'Tiada Data'
        permit: "Tiada Data", 
        
        images: [],
        features: [],
        contributorId: auth.currentUser?.uid || "admin",
        createdAt: serverTimestamp(),
        isVisible: true
      });

      count++;
      // Check console log untuk tengok Elevation masuk ke tak
      console.log(`[OK] ${name} | State: ${detectedState} | H: ${height}m`); 
      
    } catch (e) {
      console.error("Gagal import item:", item, e);
    }
  }
  
  alert(`✅ Siap! ${count} bukit berjaya diimport dengan Permit: 'Tiada Data'.`);
};