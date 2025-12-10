import {onDocumentCreated} from "firebase-functions/v2/firestore";
import * as admin from "firebase-admin";
import * as logger from "firebase-functions/logger";

// Initialize App sekali sahaja
if (admin.apps.length === 0) {
  admin.initializeApp();
}
const db = admin.firestore();

// ==========================================
// FUNCTION 1: POST BARU (Topik)
// Ganjaran: +10 XP, +1 Post Count
// Ciri: Ada Anti-Spam (Cooldown 60 saat)
// ==========================================
export const checkForumSpam = onDocumentCreated(
  "forum_posts/{postId}",
  async (event) => {
    const snapshot = event.data;
    if (!snapshot) return;

    const postData = snapshot.data();
    const userId = postData.authorId;

    if (!userId) {
      logger.warn(`Post ${event.params.postId} tiada authorId.`);
      return;
    }

    const userRef = db.collection("users").doc(userId);

    try {
      const userDoc = await userRef.get();

      // Bypass error TypeScript 'any'
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const userData = userDoc.data() as any;

      // Semak masa post terakhir untuk Anti-Spam
      const now = new Date();
      const lastPostTime = userData?.lastPostTime?.toDate();

      if (lastPostTime) {
        const diff = (now.getTime() - lastPostTime.getTime()) / 1000;

        if (diff < 60) {
          await snapshot.ref.delete();
          logger.info(`SPAM: User ${userId} laju sangat. Post dipadam.`);
          return;
        }
      }

      // Update User: Masa, Jumlah Post dan XP
      await userRef.update({
        lastPostTime: admin.firestore.FieldValue.serverTimestamp(),
        postCount: admin.firestore.FieldValue.increment(1),
        xp: admin.firestore.FieldValue.increment(10),
      });

      logger.info(`Post Reward: User ${userId} (+10 XP).`);
    } catch (error) {
      logger.error("Error dalam checkForumSpam:", error);
    }
  }
);

// ==========================================
// FUNCTION 2: KOMEN BARU (Reply)
// Ganjaran: +2 XP sahaja
// Ciri: Simple, tiada semakan spam berat
// ==========================================
export const onNewComment = onDocumentCreated(
  "forum_posts/{postId}/comments/{commentId}",
  async (event) => {
    const snapshot = event.data;
    if (!snapshot) return;

    const commentData = snapshot.data();
    const userId = commentData.authorId;

    // Pastikan komen ada authorId
    if (!userId) return;

    const userRef = db.collection("users").doc(userId);

    try {
      // Terus update XP tanpa perlu baca data user dulu (Jimat Read)
      await userRef.update({
        xp: admin.firestore.FieldValue.increment(2),
      });

      logger.info(`Comment Reward: User ${userId} (+2 XP).`);
    } catch (error) {
      // Error biasa: User doc mungkin tak wujud
      logger.error(`Gagal bagi point komen ke user ${userId}:`, error);
    }
  }
);
