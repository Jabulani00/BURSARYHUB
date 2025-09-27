import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Bursary, BursaryForm, BursaryFilters } from '../../types';
import { db } from '../../config/firebase';
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
  limit 
} from 'firebase/firestore';

interface BursaryState {
  bursaries: Bursary[];
  currentBursary: Bursary | null;
  loading: boolean;
  error: string | null;
  filters: BursaryFilters;
  hasMore: boolean;
  lastDoc: any;
}

// Dummy data for demo
const dummyBursaries: Bursary[] = [
  {
    id: '1',
    title: 'Engineering Excellence Bursary',
    description: 'A comprehensive bursary program for outstanding engineering students pursuing undergraduate or postgraduate studies in various engineering disciplines.',
    amount: 50000,
    fieldOfStudy: ['Engineering'],
    level: 'both',
    requirements: 'Minimum 70% average, South African citizen, financial need',
    deadline: new Date('2024-12-31'),
    providerId: 'provider1',
    providerName: 'TechCorp Foundation',
    isActive: true,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
  },
  {
    id: '2',
    title: 'Medical Research Scholarship',
    description: 'Supporting future medical professionals with a focus on research and innovation in healthcare.',
    amount: 75000,
    fieldOfStudy: ['Medicine'],
    level: 'postgraduate',
    requirements: 'Medical degree, research proposal, academic excellence',
    deadline: new Date('2024-11-30'),
    providerId: 'provider2',
    providerName: 'HealthCare Foundation',
    isActive: true,
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-02-01'),
  },
  {
    id: '3',
    title: 'Business Leadership Grant',
    description: 'Empowering the next generation of business leaders through comprehensive financial support and mentorship.',
    amount: 40000,
    fieldOfStudy: ['Business'],
    level: 'undergraduate',
    requirements: 'Business studies, leadership potential, community involvement',
    deadline: new Date('2024-10-15'),
    providerId: 'provider3',
    providerName: 'Business Leaders Association',
    isActive: true,
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-01-20'),
  },
  {
    id: '4',
    title: 'Arts and Culture Bursary',
    description: 'Supporting creative minds in the arts, including visual arts, performing arts, and cultural studies.',
    amount: 30000,
    fieldOfStudy: ['Arts'],
    level: 'both',
    requirements: 'Portfolio submission, creative excellence, financial need',
    deadline: new Date('2024-09-30'),
    providerId: 'provider4',
    providerName: 'Cultural Heritage Trust',
    isActive: true,
    createdAt: new Date('2024-03-01'),
    updatedAt: new Date('2024-03-01'),
  },
  {
    id: '5',
    title: 'Science Innovation Award',
    description: 'Encouraging scientific research and innovation across various scientific disciplines.',
    amount: 60000,
    fieldOfStudy: ['Science'],
    level: 'postgraduate',
    requirements: 'Science degree, research proposal, innovation focus',
    deadline: new Date('2024-08-31'),
    providerId: 'provider5',
    providerName: 'Science Foundation SA',
    isActive: true,
    createdAt: new Date('2024-02-15'),
    updatedAt: new Date('2024-02-15'),
  },
  {
    id: '6',
    title: 'Legal Studies Scholarship',
    description: 'Supporting aspiring lawyers and legal professionals in their academic journey.',
    amount: 45000,
    fieldOfStudy: ['Law'],
    level: 'both',
    requirements: 'Law studies, academic excellence, commitment to justice',
    deadline: new Date('2024-07-31'),
    providerId: 'provider6',
    providerName: 'Legal Professionals Society',
    isActive: true,
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-10'),
  },
  // Provider-specific bursaries for demo
  {
    id: '7',
    title: 'Tech Innovation Bursary',
    description: 'Supporting students in computer science and technology fields with a focus on innovation and entrepreneurship.',
    amount: 55000,
    fieldOfStudy: ['Engineering'],
    level: 'both',
    requirements: 'Computer science/IT studies, innovative project proposal',
    deadline: new Date('2024-06-30'),
    providerId: 'provider1',
    providerName: 'TechCorp Foundation',
    isActive: true,
    createdAt: new Date('2024-02-20'),
    updatedAt: new Date('2024-02-20'),
  },
  {
    id: '8',
    title: 'Healthcare Access Grant',
    description: 'Making healthcare education accessible to students from disadvantaged backgrounds.',
    amount: 80000,
    fieldOfStudy: ['Medicine'],
    level: 'undergraduate',
    requirements: 'Medical studies, financial need, community service commitment',
    deadline: new Date('2024-05-15'),
    providerId: 'provider2',
    providerName: 'HealthCare Foundation',
    isActive: true,
    createdAt: new Date('2024-01-25'),
    updatedAt: new Date('2024-01-25'),
  },
  {
    id: '9',
    title: 'Entrepreneurship Development Fund',
    description: 'Nurturing the next generation of entrepreneurs and business innovators.',
    amount: 35000,
    fieldOfStudy: ['Business'],
    level: 'both',
    requirements: 'Business studies, business plan submission, entrepreneurial mindset',
    deadline: new Date('2024-04-30'),
    providerId: 'provider3',
    providerName: 'Business Leaders Association',
    isActive: true,
    createdAt: new Date('2024-03-10'),
    updatedAt: new Date('2024-03-10'),
  },
];

const initialState: BursaryState = {
  bursaries: dummyBursaries,
  currentBursary: null,
  loading: false,
  error: null,
  filters: {},
  hasMore: true,
  lastDoc: null,
};

// Async thunks
export const fetchBursaries = createAsyncThunk(
  'bursaries/fetchBursaries',
  async (filters: BursaryFilters = {}, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { bursaries: BursaryState };
      const { lastDoc, bursaries: existingBursaries } = state.bursaries;
      
      // If we already have bursaries and no pagination, return existing data
      if (existingBursaries.length > 0 && !lastDoc) {
        let filteredBursaries = [...existingBursaries];
        
        // Apply filters to existing data
        if (filters.fieldOfStudy && filters.fieldOfStudy.length > 0) {
          filteredBursaries = filteredBursaries.filter(bursary =>
            bursary.fieldOfStudy.some(field => filters.fieldOfStudy!.includes(field))
          );
        }
        
        if (filters.level && filters.level !== 'both') {
          filteredBursaries = filteredBursaries.filter(bursary => bursary.level === filters.level);
        }
        
        return {
          bursaries: filteredBursaries,
          lastDoc: null,
          hasMore: false,
        };
      }
      
      // Try Firebase for new data
      let q = query(
        collection(db, 'bursaries'),
        where('isActive', '==', true),
        orderBy('createdAt', 'desc'),
        limit(20)
      );

      // Apply filters
      if (filters.fieldOfStudy && filters.fieldOfStudy.length > 0) {
        q = query(q, where('fieldOfStudy', 'array-contains-any', filters.fieldOfStudy));
      }

      if (filters.level && filters.level !== 'both') {
        q = query(q, where('level', '==', filters.level));
      }

      if (lastDoc) {
        q = query(q, where('createdAt', '<', lastDoc));
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
        hasMore: querySnapshot.docs.length === 20,
      };
    } catch (error: any) {
      // If Firebase fails, return dummy data
      console.warn('Firebase query failed, using dummy data:', error.message);
      
      let filteredBursaries = [...dummyBursaries];
      
      // Apply filters to dummy data
      if (filters.fieldOfStudy && filters.fieldOfStudy.length > 0) {
        filteredBursaries = filteredBursaries.filter(bursary =>
          bursary.fieldOfStudy.some(field => filters.fieldOfStudy!.includes(field))
        );
      }
      
      if (filters.level && filters.level !== 'both') {
        filteredBursaries = filteredBursaries.filter(bursary => bursary.level === filters.level);
      }
      
      return {
        bursaries: filteredBursaries,
        lastDoc: null,
        hasMore: false,
      };
    }
  }
);

export const fetchBursaryById = createAsyncThunk(
  'bursaries/fetchBursaryById',
  async (bursaryId: string, { getState, rejectWithValue }) => {
    try {
      // First check if bursary exists in local state (dummy data)
      const state = getState() as { bursaries: BursaryState };
      const localBursary = state.bursaries.bursaries.find(b => b.id === bursaryId);
      
      if (localBursary) {
        return localBursary;
      }
      
      // If not found locally, try Firebase
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
      throw new Error('Bursary not found');
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const createBursary = createAsyncThunk(
  'bursaries/createBursary',
  async (bursaryData: BursaryForm & { providerId: string; providerName: string }, { rejectWithValue }) => {
    try {
      const newBursary = {
        ...bursaryData,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        deadline: new Date(bursaryData.deadline),
      };

      const docRef = await addDoc(collection(db, 'bursaries'), newBursary);
      
      return {
        id: docRef.id,
        ...newBursary,
      } as Bursary;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateBursary = createAsyncThunk(
  'bursaries/updateBursary',
  async ({ id, ...updateData }: Partial<Bursary> & { id: string }, { rejectWithValue }) => {
    try {
      const docRef = doc(db, 'bursaries', id);
      const updatePayload = {
        ...updateData,
        updatedAt: new Date(),
      };

      if (updateData.deadline) {
        updatePayload.deadline = new Date(updateData.deadline);
      }

      await updateDoc(docRef, updatePayload);
      
      return {
        id,
        ...updateData,
        updatedAt: new Date(),
      } as Bursary;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteBursary = createAsyncThunk(
  'bursaries/deleteBursary',
  async (bursaryId: string, { rejectWithValue }) => {
    try {
      await deleteDoc(doc(db, 'bursaries', bursaryId));
      return bursaryId;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchProviderBursaries = createAsyncThunk(
  'bursaries/fetchProviderBursaries',
  async (providerId: string, { rejectWithValue }) => {
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
      return rejectWithValue(error.message);
    }
  }
);

const bursarySlice = createSlice({
  name: 'bursaries',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setFilters: (state, action: PayloadAction<BursaryFilters>) => {
      state.filters = action.payload;
      state.bursaries = [];
      state.lastDoc = null;
      state.hasMore = true;
    },
    clearCurrentBursary: (state) => {
      state.currentBursary = null;
    },
    resetBursaries: (state) => {
      state.bursaries = [];
      state.lastDoc = null;
      state.hasMore = true;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Bursaries
      .addCase(fetchBursaries.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBursaries.fulfilled, (state, action) => {
        state.loading = false;
        state.bursaries = [...state.bursaries, ...action.payload.bursaries];
        state.lastDoc = action.payload.lastDoc;
        state.hasMore = action.payload.hasMore;
        state.error = null;
      })
      .addCase(fetchBursaries.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch Bursary by ID
      .addCase(fetchBursaryById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBursaryById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentBursary = action.payload;
        state.error = null;
      })
      .addCase(fetchBursaryById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Create Bursary
      .addCase(createBursary.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createBursary.fulfilled, (state, action) => {
        state.loading = false;
        state.bursaries.unshift(action.payload);
        state.error = null;
      })
      .addCase(createBursary.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Update Bursary
      .addCase(updateBursary.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateBursary.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.bursaries.findIndex(b => b.id === action.payload.id);
        if (index !== -1) {
          state.bursaries[index] = action.payload;
        }
        if (state.currentBursary?.id === action.payload.id) {
          state.currentBursary = action.payload;
        }
        state.error = null;
      })
      .addCase(updateBursary.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Delete Bursary
      .addCase(deleteBursary.fulfilled, (state, action) => {
        state.bursaries = state.bursaries.filter(b => b.id !== action.payload);
        if (state.currentBursary?.id === action.payload) {
          state.currentBursary = null;
        }
      })
      // Fetch Provider Bursaries
      .addCase(fetchProviderBursaries.fulfilled, (state, action) => {
        state.bursaries = action.payload;
      });
  },
});

export const { clearError, setFilters, clearCurrentBursary, resetBursaries } = bursarySlice.actions;
export default bursarySlice.reducer;
