import { 
  collection, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  where, 
  orderBy,
  limit,
  startAfter,
  Timestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { Bursary, BursaryForm, BursaryFilters } from '../types';

export class BursaryService {
  // Create a new bursary
  static async createBursary(bursaryData: BursaryForm & { providerId: string; providerName: string }): Promise<Bursary> {
    try {
      const newBursary = {
        ...bursaryData,
        isActive: true,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        deadline: Timestamp.fromDate(new Date(bursaryData.deadline)),
      };

      const docRef = await addDoc(collection(db, 'bursaries'), newBursary);
      
      return {
        id: docRef.id,
        ...newBursary,
        createdAt: newBursary.createdAt.toDate(),
        updatedAt: newBursary.updatedAt.toDate(),
        deadline: newBursary.deadline.toDate(),
      } as Bursary;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  // Get bursary by ID
  static async getBursaryById(bursaryId: string): Promise<Bursary | null> {
    try {
      const docRef = doc(db, 'bursaries', bursaryId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          deadline: data.deadline?.toDate() || new Date(),
        } as Bursary;
      }
      return null;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  // Get all bursaries with filters and pagination
  static async getBursaries(
    filters: BursaryFilters = {}, 
    lastDoc?: any, 
    pageSize: number = 20
  ): Promise<{ bursaries: Bursary[]; lastDoc: any; hasMore: boolean }> {
    try {
      let q = query(
        collection(db, 'bursaries'),
        where('isActive', '==', true),
        orderBy('createdAt', 'desc'),
        limit(pageSize)
      );

      // Apply filters
      if (filters.fieldOfStudy && filters.fieldOfStudy.length > 0) {
        q = query(q, where('fieldOfStudy', 'array-contains-any', filters.fieldOfStudy));
      }

      if (filters.level && filters.level !== 'both') {
        q = query(q, where('level', '==', filters.level));
      }

      if (lastDoc) {
        q = query(q, startAfter(lastDoc));
      }

      const querySnapshot = await getDocs(q);
      const bursaries: Bursary[] = [];
      let newLastDoc = null;

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        bursaries.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          deadline: data.deadline?.toDate() || new Date(),
        } as Bursary);
        newLastDoc = doc;
      });

      return {
        bursaries,
        lastDoc: newLastDoc,
        hasMore: querySnapshot.docs.length === pageSize,
      };
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  // Get bursaries by provider
  static async getBursariesByProvider(providerId: string): Promise<Bursary[]> {
    try {
      const q = query(
        collection(db, 'bursaries'),
        where('providerId', '==', providerId),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const bursaries: Bursary[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        bursaries.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          deadline: data.deadline?.toDate() || new Date(),
        } as Bursary);
      });

      return bursaries;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  // Update bursary
  static async updateBursary(bursaryId: string, updateData: Partial<BursaryForm>): Promise<void> {
    try {
      const docRef = doc(db, 'bursaries', bursaryId);
      const updatePayload: any = {
        ...updateData,
        updatedAt: Timestamp.now(),
      };

      if (updateData.deadline) {
        updatePayload.deadline = Timestamp.fromDate(new Date(updateData.deadline));
      }

      await updateDoc(docRef, updatePayload);
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  // Delete bursary
  static async deleteBursary(bursaryId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'bursaries', bursaryId));
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  // Toggle bursary active status
  static async toggleBursaryStatus(bursaryId: string, isActive: boolean): Promise<void> {
    try {
      const docRef = doc(db, 'bursaries', bursaryId);
      await updateDoc(docRef, {
        isActive,
        updatedAt: Timestamp.now(),
      });
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  // Search bursaries
  static async searchBursaries(searchTerm: string, filters: BursaryFilters = {}): Promise<Bursary[]> {
    try {
      // Note: Firestore doesn't support full-text search natively
      // For production, consider using Algolia or Elasticsearch
      let q = query(
        collection(db, 'bursaries'),
        where('isActive', '==', true),
        orderBy('title')
      );

      const querySnapshot = await getDocs(q);
      const bursaries: Bursary[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const bursary = {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          deadline: data.deadline?.toDate() || new Date(),
        } as Bursary;

        // Simple text search
        if (searchTerm) {
          const searchLower = searchTerm.toLowerCase();
          const matches = 
            bursary.title.toLowerCase().includes(searchLower) ||
            bursary.description.toLowerCase().includes(searchLower) ||
            bursary.providerName.toLowerCase().includes(searchLower) ||
            bursary.fieldOfStudy.some(field => field.toLowerCase().includes(searchLower));

          if (matches) {
            bursaries.push(bursary);
          }
        } else {
          bursaries.push(bursary);
        }
      });

      return bursaries;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  // Get expired bursaries
  static async getExpiredBursaries(): Promise<Bursary[]> {
    try {
      const now = Timestamp.now();
      const q = query(
        collection(db, 'bursaries'),
        where('deadline', '<', now),
        where('isActive', '==', true)
      );

      const querySnapshot = await getDocs(q);
      const bursaries: Bursary[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        bursaries.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          deadline: data.deadline?.toDate() || new Date(),
        } as Bursary);
      });

      return bursaries;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  // Get bursary statistics
  static async getBursaryStats(): Promise<{
    total: number;
    active: number;
    expired: number;
    totalApplications: number;
  }> {
    try {
      const allBursaries = await getDocs(collection(db, 'bursaries'));
      const now = new Date();
      
      let total = 0;
      let active = 0;
      let expired = 0;

      allBursaries.forEach((doc) => {
        const data = doc.data();
        total++;
        
        if (data.isActive) {
          const deadline = data.deadline?.toDate() || new Date();
          if (deadline > now) {
            active++;
          } else {
            expired++;
          }
        }
      });

      // Get total applications count
      const applicationsSnapshot = await getDocs(collection(db, 'applications'));
      const totalApplications = applicationsSnapshot.size;

      return {
        total,
        active,
        expired,
        totalApplications,
      };
    } catch (error: any) {
      throw new Error(error.message);
    }
  }
}
