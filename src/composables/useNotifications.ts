import { ref } from 'vue';
import { db } from '../firebaseConfig';
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  getDocs, 
  serverTimestamp,
  doc,
  updateDoc,
  Timestamp 
} from 'firebase/firestore';

export interface Notification {
  id: string;
  recipientId: string;
  message: string;
  type: 'info' | 'success' | 'warning';
  link?: string; // Link untuk redirect bila klik (contoh: /trip/123)
  isRead: boolean;
  createdAt: Timestamp;
}

export function useNotifications() {
  const notifications = ref<Notification[]>([]);
  const loading = ref(false);
  const unreadCount = ref(0);

  // Fungsi Create (Hanya panggil bila perlu hantar noti)
  const addNotification = async (recipientId: string, message: string, type: 'info'|'success'|'warning' = 'info', link = '') => {
    try {
      await addDoc(collection(db, 'notifications'), {
        recipientId,
        message,
        type,
        link,
        isRead: false,
        createdAt: serverTimestamp()
      });
    } catch (error) {
      console.error("Error sending notification:", error);
    }
  };

  // Fungsi Fetch (Hanya tarik 10 terkini untuk jimat quota)
  const fetchNotifications = async (userId: string) => {
    loading.value = true;
    try {
      const q = query(
        collection(db, 'notifications'),
        where('recipientId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(10) // PENTING: Limit read
      );

      const snapshot = await getDocs(q);
      notifications.value = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Notification[];

      // Kira unread secara manual dari 10 item ni (cukup untuk UX asas)
      unreadCount.value = notifications.value.filter(n => !n.isRead).length;

    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      loading.value = false;
    }
  };

  // Tandakan sudah baca
  const markAsRead = async (notificationId: string) => {
    try {
      const notifRef = doc(db, 'notifications', notificationId);
      await updateDoc(notifRef, { isRead: true });
      
      // Update local state
      const target = notifications.value.find(n => n.id === notificationId);
      if (target && !target.isRead) {
        target.isRead = true;
        unreadCount.value--;
      }
    } catch (error) {
      console.error("Error marking read:", error);
    }
  };

  return {
    notifications,
    loading,
    unreadCount,
    addNotification,
    fetchNotifications,
    markAsRead
  };
}