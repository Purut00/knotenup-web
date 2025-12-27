import { db } from '../firebaseConfig';
import { collection, getDocs, updateDoc } from 'firebase/firestore';

export const fixOldDataMessages = async () => {
    // Only run this manually when needed
    if (!confirm("Fix old data (Trip Requests)? This might be heavy.")) return;

    try {
        const snap = await getDocs(collection(db, "trip_requests"));
        let count = 0;
        const updates = snap.docs.map(async (d) => {
            const data = d.data();
            if (!data.category) {
                await updateDoc(d.ref, { category: 'Hiking' });
                count++;
            }
        });
        await Promise.all(updates);
        alert(`Fix done. Updated ${count} records.`);
    } catch (e) {
        console.error("Migration error:", e);
        alert("Migration failed.");
    }
};
