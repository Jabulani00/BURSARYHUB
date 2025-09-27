import { 
  collection, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  doc, 
  query, 
  where, 
  orderBy,
  Timestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { Application } from '../types';

export class ApplicationService {
  // Submit a new application
  static async submitApplication(applicationData: {
    bursaryId: string;
    studentId: string;
    providerId: string;
    studentInfo: Application['studentInfo'];
    bursaryInfo: Application['bursaryInfo'];
  }): Promise<Application> {
    try {
      const newApplication = {
        ...applicationData,
        status: 'submitted' as const,
        submittedAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      const docRef = await addDoc(collection(db, 'applications'), newApplication);
      
      return {
        id: docRef.id,
        ...newApplication,
        submittedAt: newApplication.submittedAt.toDate(),
        updatedAt: newApplication.updatedAt.toDate(),
      } as Application;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  // Get application by ID
  static async getApplicationById(applicationId: string): Promise<Application | null> {
    try {
      const docRef = doc(db, 'applications', applicationId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          ...data,
          submittedAt: data.submittedAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as Application;
      }
      return null;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  // Get applications by student
  static async getApplicationsByStudent(studentId: string): Promise<Application[]> {
    try {
      const q = query(
        collection(db, 'applications'),
        where('studentId', '==', studentId),
        orderBy('submittedAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const applications: Application[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        applications.push({
          id: doc.id,
          ...data,
          submittedAt: data.submittedAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as Application);
      });

      return applications;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  // Get applications by bursary
  static async getApplicationsByBursary(bursaryId: string): Promise<Application[]> {
    try {
      const q = query(
        collection(db, 'applications'),
        where('bursaryId', '==', bursaryId),
        orderBy('submittedAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const applications: Application[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        applications.push({
          id: doc.id,
          ...data,
          submittedAt: data.submittedAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as Application);
      });

      return applications;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  // Get applications by provider
  static async getApplicationsByProvider(providerId: string): Promise<Application[]> {
    try {
      const q = query(
        collection(db, 'applications'),
        where('providerId', '==', providerId),
        orderBy('submittedAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const applications: Application[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        applications.push({
          id: doc.id,
          ...data,
          submittedAt: data.submittedAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as Application);
      });

      return applications;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  // Update application status
  static async updateApplicationStatus(
    applicationId: string, 
    status: Application['status'], 
    notes?: string
  ): Promise<void> {
    try {
      const docRef = doc(db, 'applications', applicationId);
      const updateData: any = {
        status,
        updatedAt: Timestamp.now(),
      };

      if (notes) {
        updateData.notes = notes;
      }

      await updateDoc(docRef, updateData);
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  // Get applications by status
  static async getApplicationsByStatus(status: Application['status']): Promise<Application[]> {
    try {
      const q = query(
        collection(db, 'applications'),
        where('status', '==', status),
        orderBy('submittedAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const applications: Application[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        applications.push({
          id: doc.id,
          ...data,
          submittedAt: data.submittedAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as Application);
      });

      return applications;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  // Check if student has already applied to bursary
  static async hasStudentApplied(studentId: string, bursaryId: string): Promise<boolean> {
    try {
      const q = query(
        collection(db, 'applications'),
        where('studentId', '==', studentId),
        where('bursaryId', '==', bursaryId)
      );

      const querySnapshot = await getDocs(q);
      return !querySnapshot.empty;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  // Get application statistics
  static async getApplicationStats(): Promise<{
    total: number;
    submitted: number;
    underReview: number;
    accepted: number;
    rejected: number;
  }> {
    try {
      const allApplications = await getDocs(collection(db, 'applications'));
      
      let total = 0;
      let submitted = 0;
      let underReview = 0;
      let accepted = 0;
      let rejected = 0;

      allApplications.forEach((doc) => {
        const data = doc.data();
        total++;
        
        switch (data.status) {
          case 'submitted':
            submitted++;
            break;
          case 'under_review':
            underReview++;
            break;
          case 'accepted':
            accepted++;
            break;
          case 'rejected':
            rejected++;
            break;
        }
      });

      return {
        total,
        submitted,
        underReview,
        accepted,
        rejected,
      };
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  // Get applications by date range
  static async getApplicationsByDateRange(startDate: Date, endDate: Date): Promise<Application[]> {
    try {
      const startTimestamp = Timestamp.fromDate(startDate);
      const endTimestamp = Timestamp.fromDate(endDate);
      
      const q = query(
        collection(db, 'applications'),
        where('submittedAt', '>=', startTimestamp),
        where('submittedAt', '<=', endTimestamp),
        orderBy('submittedAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const applications: Application[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        applications.push({
          id: doc.id,
          ...data,
          submittedAt: data.submittedAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as Application);
      });

      return applications;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  // Delete application
  static async deleteApplication(applicationId: string): Promise<void> {
    try {
      await doc(db, 'applications', applicationId);
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  // Get recent applications
  static async getRecentApplications(limit: number = 10): Promise<Application[]> {
    try {
      const q = query(
        collection(db, 'applications'),
        orderBy('submittedAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const applications: Application[] = [];

      querySnapshot.forEach((doc, index) => {
        if (index < limit) {
          const data = doc.data();
          applications.push({
            id: doc.id,
            ...data,
            submittedAt: data.submittedAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date(),
          } as Application);
        }
      });

      return applications;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }
}
