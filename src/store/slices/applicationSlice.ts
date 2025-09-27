import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Application } from '../../types';
import { db } from '../../config/firebase';
import { 
  collection, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  doc, 
  query, 
  where, 
  orderBy 
} from 'firebase/firestore';

interface ApplicationState {
  applications: Application[];
  currentApplication: Application | null;
  loading: boolean;
  error: string | null;
}

// Dummy data for demo
const dummyApplications: Application[] = [
  {
    id: '1',
    bursaryId: '1',
    studentId: 'demo-student-1',
    providerId: 'provider1',
    status: 'under_review',
    submittedAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-01-25'),
    studentInfo: {
      name: 'John Student',
      email: 'student@demo.com',
      institution: 'University of Cape Town',
      fieldOfStudy: 'Computer Science',
      level: 'undergraduate',
    },
    bursaryInfo: {
      title: 'Engineering Excellence Bursary',
      providerName: 'TechCorp Foundation',
      amount: 50000,
    },
    notes: 'Strong academic record and relevant experience',
  },
  {
    id: '2',
    bursaryId: '2',
    studentId: 'demo-student-1',
    providerId: 'provider2',
    status: 'accepted',
    submittedAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-02-01'),
    studentInfo: {
      name: 'John Student',
      email: 'student@demo.com',
      institution: 'University of Cape Town',
      fieldOfStudy: 'Computer Science',
      level: 'undergraduate',
    },
    bursaryInfo: {
      title: 'Medical Research Scholarship',
      providerName: 'HealthCare Foundation',
      amount: 75000,
    },
    notes: 'Excellent research proposal and academic performance',
  },
  {
    id: '3',
    bursaryId: '3',
    studentId: 'demo-student-1',
    providerId: 'provider3',
    status: 'submitted',
    submittedAt: new Date('2024-02-10'),
    updatedAt: new Date('2024-02-10'),
    studentInfo: {
      name: 'John Student',
      email: 'student@demo.com',
      institution: 'University of Cape Town',
      fieldOfStudy: 'Computer Science',
      level: 'undergraduate',
    },
    bursaryInfo: {
      title: 'Business Leadership Grant',
      providerName: 'Business Leaders Association',
      amount: 40000,
    },
  },
  {
    id: '4',
    bursaryId: '4',
    studentId: 'demo-student-1',
    providerId: 'provider4',
    status: 'rejected',
    submittedAt: new Date('2024-01-05'),
    updatedAt: new Date('2024-01-30'),
    studentInfo: {
      name: 'John Student',
      email: 'student@demo.com',
      institution: 'University of Cape Town',
      fieldOfStudy: 'Computer Science',
      level: 'undergraduate',
    },
    bursaryInfo: {
      title: 'Arts and Culture Bursary',
      providerName: 'Cultural Heritage Trust',
      amount: 30000,
    },
    notes: 'Field of study does not match requirements',
  },
  // Additional applications for demo
  {
    id: '5',
    bursaryId: '1',
    studentId: 'demo-student-2',
    providerId: 'provider1',
    status: 'submitted',
    submittedAt: new Date('2024-02-15'),
    updatedAt: new Date('2024-02-15'),
    studentInfo: {
      name: 'Sarah Johnson',
      email: 'sarah@demo.com',
      institution: 'University of the Witwatersrand',
      fieldOfStudy: 'Mechanical Engineering',
      level: 'undergraduate',
    },
    bursaryInfo: {
      title: 'Engineering Excellence Bursary',
      providerName: 'TechCorp Foundation',
      amount: 50000,
    },
  },
  {
    id: '6',
    bursaryId: '7',
    studentId: 'demo-student-3',
    providerId: 'provider1',
    status: 'under_review',
    submittedAt: new Date('2024-02-20'),
    updatedAt: new Date('2024-02-22'),
    studentInfo: {
      name: 'Michael Brown',
      email: 'mike@demo.com',
      institution: 'Stellenbosch University',
      fieldOfStudy: 'Computer Science',
      level: 'postgraduate',
    },
    bursaryInfo: {
      title: 'Tech Innovation Bursary',
      providerName: 'TechCorp Foundation',
      amount: 55000,
    },
    notes: 'Impressive tech project portfolio',
  },
  {
    id: '7',
    bursaryId: '2',
    studentId: 'demo-student-2',
    providerId: 'provider2',
    status: 'accepted',
    submittedAt: new Date('2024-01-30'),
    updatedAt: new Date('2024-02-05'),
    studentInfo: {
      name: 'Sarah Johnson',
      email: 'sarah@demo.com',
      institution: 'University of the Witwatersrand',
      fieldOfStudy: 'Mechanical Engineering',
      level: 'undergraduate',
    },
    bursaryInfo: {
      title: 'Medical Research Scholarship',
      providerName: 'HealthCare Foundation',
      amount: 75000,
    },
    notes: 'Outstanding research proposal in cardiology',
  },
  {
    id: '8',
    bursaryId: '8',
    studentId: 'demo-student-3',
    providerId: 'provider2',
    status: 'submitted',
    submittedAt: new Date('2024-02-25'),
    updatedAt: new Date('2024-02-25'),
    studentInfo: {
      name: 'Michael Brown',
      email: 'mike@demo.com',
      institution: 'Stellenbosch University',
      fieldOfStudy: 'Computer Science',
      level: 'postgraduate',
    },
    bursaryInfo: {
      title: 'Healthcare Access Grant',
      providerName: 'HealthCare Foundation',
      amount: 80000,
    },
  },
  {
    id: '9',
    bursaryId: '3',
    studentId: 'demo-student-1',
    providerId: 'provider3',
    status: 'under_review',
    submittedAt: new Date('2024-02-18'),
    updatedAt: new Date('2024-02-20'),
    studentInfo: {
      name: 'John Student',
      email: 'student@demo.com',
      institution: 'University of Cape Town',
      fieldOfStudy: 'Computer Science',
      level: 'undergraduate',
    },
    bursaryInfo: {
      title: 'Business Leadership Grant',
      providerName: 'Business Leaders Association',
      amount: 40000,
    },
    notes: 'Strong leadership experience in student organizations',
  },
  {
    id: '10',
    bursaryId: '9',
    studentId: 'demo-student-2',
    providerId: 'provider3',
    status: 'accepted',
    submittedAt: new Date('2024-02-12'),
    updatedAt: new Date('2024-02-18'),
    studentInfo: {
      name: 'Sarah Johnson',
      email: 'sarah@demo.com',
      institution: 'University of the Witwatersrand',
      fieldOfStudy: 'Mechanical Engineering',
      level: 'undergraduate',
    },
    bursaryInfo: {
      title: 'Entrepreneurship Development Fund',
      providerName: 'Business Leaders Association',
      amount: 35000,
    },
    notes: 'Innovative business plan with strong market potential',
  },
];

const initialState: ApplicationState = {
  applications: dummyApplications,
  currentApplication: null,
  loading: false,
  error: null,
};

// Async thunks
export const submitApplication = createAsyncThunk(
  'applications/submitApplication',
  async (applicationData: {
    bursaryId: string;
    studentId: string;
    providerId: string;
    studentInfo: Application['studentInfo'];
    bursaryInfo: Application['bursaryInfo'];
  }, { rejectWithValue }) => {
    try {
      const newApplication = {
        ...applicationData,
        status: 'submitted' as const,
        submittedAt: new Date(),
        updatedAt: new Date(),
      };

      const docRef = await addDoc(collection(db, 'applications'), newApplication);
      
      return {
        id: docRef.id,
        ...newApplication,
      } as Application;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchStudentApplications = createAsyncThunk(
  'applications/fetchStudentApplications',
  async (studentId: string, { getState, rejectWithValue }) => {
    try {
      // Try Firebase first
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
      // If Firebase fails, return dummy data for the student
      console.warn('Firebase query failed, using dummy data:', error.message);
      
      const studentApplications = dummyApplications.filter(app => app.studentId === studentId);
      return studentApplications;
    }
  }
);

export const fetchBursaryApplications = createAsyncThunk(
  'applications/fetchBursaryApplications',
  async (bursaryId: string, { rejectWithValue }) => {
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
      return rejectWithValue(error.message);
    }
  }
);

export const fetchApplicationById = createAsyncThunk(
  'applications/fetchApplicationById',
  async (applicationId: string, { getState, rejectWithValue }) => {
    try {
      // First check if application exists in local state (dummy data)
      const state = getState() as { applications: ApplicationState };
      const localApplication = state.applications.applications.find(app => app.id === applicationId);
      
      if (localApplication) {
        return localApplication;
      }
      
      // If not found locally, try Firebase
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
      throw new Error('Application not found');
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateApplicationStatus = createAsyncThunk(
  'applications/updateApplicationStatus',
  async ({ 
    applicationId, 
    status, 
    notes 
  }: { 
    applicationId: string; 
    status: Application['status']; 
    notes?: string; 
  }, { rejectWithValue }) => {
    try {
      const docRef = doc(db, 'applications', applicationId);
      const updateData: any = {
        status,
        updatedAt: new Date(),
      };

      if (notes) {
        updateData.notes = notes;
      }

      await updateDoc(docRef, updateData);
      
      return {
        id: applicationId,
        status,
        notes,
        updatedAt: new Date(),
      };
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchProviderApplications = createAsyncThunk(
  'applications/fetchProviderApplications',
  async (providerId: string, { rejectWithValue }) => {
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
      return rejectWithValue(error.message);
    }
  }
);

const applicationSlice = createSlice({
  name: 'applications',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentApplication: (state) => {
      state.currentApplication = null;
    },
    resetApplications: (state) => {
      state.applications = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Submit Application
      .addCase(submitApplication.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(submitApplication.fulfilled, (state, action) => {
        state.loading = false;
        state.applications.unshift(action.payload);
        state.error = null;
      })
      .addCase(submitApplication.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch Student Applications
      .addCase(fetchStudentApplications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStudentApplications.fulfilled, (state, action) => {
        state.loading = false;
        state.applications = action.payload;
        state.error = null;
      })
      .addCase(fetchStudentApplications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch Bursary Applications
      .addCase(fetchBursaryApplications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBursaryApplications.fulfilled, (state, action) => {
        state.loading = false;
        state.applications = action.payload;
        state.error = null;
      })
      .addCase(fetchBursaryApplications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch Application by ID
      .addCase(fetchApplicationById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchApplicationById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentApplication = action.payload;
        state.error = null;
      })
      .addCase(fetchApplicationById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Update Application Status
      .addCase(updateApplicationStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateApplicationStatus.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.applications.findIndex(a => a.id === action.payload.id);
        if (index !== -1) {
          state.applications[index] = {
            ...state.applications[index],
            status: action.payload.status,
            notes: action.payload.notes,
            updatedAt: action.payload.updatedAt,
          };
        }
        if (state.currentApplication?.id === action.payload.id) {
          state.currentApplication = {
            ...state.currentApplication,
            status: action.payload.status,
            notes: action.payload.notes,
            updatedAt: action.payload.updatedAt,
          };
        }
        state.error = null;
      })
      .addCase(updateApplicationStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch Provider Applications
      .addCase(fetchProviderApplications.fulfilled, (state, action) => {
        state.applications = action.payload;
      });
  },
});

export const { clearError, clearCurrentApplication, resetApplications } = applicationSlice.actions;
export default applicationSlice.reducer;
