import { db } from '../firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import type { User } from 'firebase/auth';

export interface UserProfileBasic {
    name: string;
    avatar: string;
}

/**
 * Gets the effective user profile to use for content creation.
 * Prioritizes Firestore profile data (if edited), falls back to Firebase Auth data.
 * as per user requirement: "ikut detail yg telah diisi di profile page. jika profile tak diedit lagi. guna profile yg diimport dari emel."
 */
export const getEffectiveUserProfile = async (currentUser: User): Promise<UserProfileBasic> => {
    if (!currentUser) {
        throw new Error("No authenticated user");
    }

    const defaultProfile = {
        name: currentUser.displayName || 'Anonymous',
        avatar: currentUser.photoURL || ''
    };

    try {
        const userDocRef = doc(db, "users", currentUser.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
            const data = userDocSnap.data();
            return {
                name: data.name || defaultProfile.name,
                avatar: data.avatar || defaultProfile.avatar
            };
        }
    } catch (error) {
        console.warn("Failed to fetch user profile from Firestore, falling back to Auth defaults.", error);
    }

    return defaultProfile;
};
