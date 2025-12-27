/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import { onDocumentCreated } from "firebase-functions/v2/firestore";
import * as logger from "firebase-functions/logger";
import { initializeApp } from "firebase-admin/app";
import { getFirestore, Timestamp } from "firebase-admin/firestore";

initializeApp();
const db = getFirestore();

// List of forbidden words (Case-insensitive)
const BANNED_WORDS = [
  "casino", "gambling", "poker", "viagra", "cryptocurrency",
  "bitcoin", "free money", "scam", "nude", "xxx"
];

// Utility: Sanitize HTML (Basic strip tags)
const stripHtml = (text: string): string => {
  return text.replace(/<[^>]*>?/gm, "");
};

// Cloud Function (V2): Check Forum Post on Create
export const checkForumPost = onDocumentCreated(
  {
    document: "forum_posts/{postId}",
    region: "asia-southeast1"
  },
  async (event) => {
    const snap = event.data;
    if (!snap) return; // Deleted event?

    const data = snap.data();
    const postId = event.params.postId;
    const { title, content, authorId } = data;

    // 1. SANITIZATION (Strip HTML)
    const cleanTitle = stripHtml(title || "");
    const cleanContent = stripHtml(content || "");

    let isModified = false;
    if (cleanTitle !== title || cleanContent !== content) {
      logger.info(`Sanitizing HTML for post ${postId}`);
      await snap.ref.update({ title: cleanTitle, content: cleanContent });
      isModified = true;
    }

    // 2. SPAM FILTER (Banned Words)
    const combinedText = (cleanTitle + " " + cleanContent).toLowerCase();
    const hasSpam = BANNED_WORDS.some((word) => combinedText.includes(word));

    if (hasSpam) {
      logger.warn(`Spam detected in post ${postId} by user ${authorId}. Deleting.`);
      await snap.ref.delete();
      return; // Stop execution
    }

    // 3. RATE LIMITING (Max 3 posts per minute)
    // Check user's posts in the last 60 seconds
    const oneMinuteAgo = Timestamp.fromMillis(Date.now() - 60 * 1000);

    const recentPostsSnapshot = await db.collection("forum_posts")
      .where("authorId", "==", authorId)
      .where("createdAt", ">", oneMinuteAgo)
      .get();

    // The current post is likely included in the count depending on timing/indexes,
    // but typically cloud functions fire slightly after.
    // If we have > 3 recent posts (including potentially this one if query catches it, or others),
    // let's be strict. If the query returns 3 OR MORE documents created in last minute,
    // we assume this NEW one is the 4th+ or abuse.
    // (Note: This query needs a composite index `authorId + createdAt`. Cloud Functions logs will warn if missing.)

    if (recentPostsSnapshot.size > 3) {
      logger.warn(`Rate limit exceeded for user ${authorId}. Deleting post ${postId}.`);
      await snap.ref.delete();
      // Optional: Add warning to user (Requires a 'notifications' collection or similar mechanism)
    }

    // If all checks pass, and we purely sanitized, we are good.
    if (isModified) {
      logger.info(`Post ${postId} passed checks (Sanitized).`);
    } else {
      logger.info(`Post ${postId} passed checks.`);
    }
  }
);
