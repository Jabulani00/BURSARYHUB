import { 
  collection, 
  addDoc, 
  getDocs, 
  updateDoc, 
  doc, 
  query, 
  where, 
  orderBy,
  limit,
  Timestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { Notification } from '../types';

export class NotificationService {
  // Send notification to a user
  static async sendNotification(
    userId: string,
    title: string,
    message: string,
    type: Notification['type'] = 'info',
    actionUrl?: string
  ): Promise<Notification> {
    try {
      const notification: Omit<Notification, 'id'> = {
        userId,
        title,
        message,
        type,
        isRead: false,
        createdAt: new Date(),
        actionUrl,
      };

      const docRef = await addDoc(collection(db, 'notifications'), {
        ...notification,
        createdAt: Timestamp.now(),
      });

      return {
        id: docRef.id,
        ...notification,
      };
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  // Get notifications for a user
  static async getUserNotifications(
    userId: string, 
    limitCount: number = 50
  ): Promise<Notification[]> {
    try {
      const q = query(
        collection(db, 'notifications'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );

      const querySnapshot = await getDocs(q);
      const notifications: Notification[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        notifications.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
        } as Notification);
      });

      return notifications;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  // Mark notification as read
  static async markNotificationAsRead(notificationId: string): Promise<void> {
    try {
      const docRef = doc(db, 'notifications', notificationId);
      await updateDoc(docRef, {
        isRead: true,
      });
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  // Mark all notifications as read for a user
  static async markAllNotificationsAsRead(userId: string): Promise<void> {
    try {
      const q = query(
        collection(db, 'notifications'),
        where('userId', '==', userId),
        where('isRead', '==', false)
      );

      const querySnapshot = await getDocs(q);
      const updatePromises = querySnapshot.docs.map(doc => 
        updateDoc(doc.ref, { isRead: true })
      );

      await Promise.all(updatePromises);
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  // Get unread notification count
  static async getUnreadNotificationCount(userId: string): Promise<number> {
    try {
      const q = query(
        collection(db, 'notifications'),
        where('userId', '==', userId),
        where('isRead', '==', false)
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.size;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  // Send application status update notification
  static async sendApplicationStatusNotification(
    userId: string,
    bursaryTitle: string,
    status: 'accepted' | 'rejected' | 'under_review',
    applicationId: string
  ): Promise<Notification> {
    const statusMessages = {
      accepted: `Congratulations! Your application for "${bursaryTitle}" has been accepted.`,
      rejected: `Your application for "${bursaryTitle}" was not successful this time.`,
      under_review: `Your application for "${bursaryTitle}" is now under review.`,
    };

    const statusTypes = {
      accepted: 'success' as const,
      rejected: 'error' as const,
      under_review: 'info' as const,
    };

    return this.sendNotification(
      userId,
      'Application Status Update',
      statusMessages[status],
      statusTypes[status],
      `/applications/${applicationId}`
    );
  }

  // Send bursary deadline reminder
  static async sendBursaryDeadlineReminder(
    userId: string,
    bursaryTitle: string,
    daysLeft: number,
    bursaryId: string
  ): Promise<Notification> {
    const message = daysLeft === 1 
      ? `Reminder: "${bursaryTitle}" application deadline is tomorrow!`
      : `Reminder: "${bursaryTitle}" application deadline is in ${daysLeft} days.`;

    return this.sendNotification(
      userId,
      'Bursary Deadline Reminder',
      message,
      'warning',
      `/bursaries/${bursaryId}`
    );
  }

  // Send new bursary notification
  static async sendNewBursaryNotification(
    userId: string,
    bursaryTitle: string,
    providerName: string,
    bursaryId: string
  ): Promise<Notification> {
    return this.sendNotification(
      userId,
      'New Bursary Available',
      `A new bursary "${bursaryTitle}" from ${providerName} is now available.`,
      'info',
      `/bursaries/${bursaryId}`
    );
  }

  // Send system announcement
  static async sendSystemAnnouncement(
    title: string,
    message: string,
    targetUsers?: string[]
  ): Promise<void> {
    try {
      if (targetUsers) {
        // Send to specific users
        const promises = targetUsers.map(userId => 
          this.sendNotification(userId, title, message, 'info')
        );
        await Promise.all(promises);
      } else {
        // Send to all users (this would require a Cloud Function in production)
        // For now, we'll just log it
        console.log('System announcement:', { title, message });
      }
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  // Delete notification
  static async deleteNotification(notificationId: string): Promise<void> {
    try {
      await doc(db, 'notifications', notificationId);
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  // Get notification by ID
  static async getNotificationById(notificationId: string): Promise<Notification | null> {
    try {
      const docRef = doc(db, 'notifications', notificationId);
      const docSnap = await getDocs(query(collection(db, 'notifications'), where('__name__', '==', notificationId)));
      
      if (!docSnap.empty) {
        const data = docSnap.docs[0].data();
        return {
          id: docSnap.docs[0].id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
        } as Notification;
      }
      return null;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  // Clean up old notifications (older than 30 days)
  static async cleanupOldNotifications(): Promise<void> {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const q = query(
        collection(db, 'notifications'),
        where('createdAt', '<', Timestamp.fromDate(thirtyDaysAgo))
      );

      const querySnapshot = await getDocs(q);
      const deletePromises = querySnapshot.docs.map(doc => 
        doc.ref.delete()
      );

      await Promise.all(deletePromises);
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  // Get notification statistics
  static async getNotificationStats(): Promise<{
    total: number;
    unread: number;
    byType: Record<string, number>;
  }> {
    try {
      const allNotifications = await getDocs(collection(db, 'notifications'));
      
      let total = 0;
      let unread = 0;
      const byType: Record<string, number> = {};

      allNotifications.forEach((doc) => {
        const data = doc.data();
        total++;
        
        if (!data.isRead) {
          unread++;
        }
        
        const type = data.type || 'info';
        byType[type] = (byType[type] || 0) + 1;
      });

      return {
        total,
        unread,
        byType,
      };
    } catch (error: any) {
      throw new Error(error.message);
    }
  }
}
