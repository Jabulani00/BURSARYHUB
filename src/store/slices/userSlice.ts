import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { User, StudentProfile, ProviderProfile, LoginForm, RegisterForm } from '../../types';
import { auth, db } from '../../config/firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut,
  User as FirebaseUser 
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

interface UserState {
  currentUser: User | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}

const initialState: UserState = {
  currentUser: null,
  loading: false,
  error: null,
  isAuthenticated: false,
};

// Async thunks
export const loginUser = createAsyncThunk(
  'user/login',
  async (credentials: LoginForm, { rejectWithValue }) => {
    try {
      // Demo credentials for testing
      const demoUsers: User[] = [
        {
          id: 'demo-student-1',
          email: 'student@demo.com',
          name: 'John Student',
          phone: '+27123456789',
          role: 'student',
          createdAt: new Date('2023-01-15'),
          updatedAt: new Date('2024-01-20'),
          profileData: {
            dateOfBirth: '2000-05-15',
            institution: 'University of Cape Town',
            fieldOfStudy: 'Computer Science',
            level: 'undergraduate',
            documents: {
              idCardUrl: 'https://example.com/id-card.pdf',
              matricCertUrl: 'https://example.com/matric.pdf',
              transcriptUrl: 'https://example.com/transcript.pdf',
              cvUrl: 'https://example.com/cv.pdf'
            }
          }
        },
        {
          id: 'demo-student-2',
          email: 'sarah@demo.com',
          name: 'Sarah Johnson',
          phone: '+27987654321',
          role: 'student',
          createdAt: new Date('2023-02-10'),
          updatedAt: new Date('2024-01-18'),
          profileData: {
            dateOfBirth: '1999-08-22',
            institution: 'University of the Witwatersrand',
            fieldOfStudy: 'Mechanical Engineering',
            level: 'undergraduate',
            documents: {
              idCardUrl: 'https://example.com/id-card.pdf',
              matricCertUrl: 'https://example.com/matric.pdf'
            }
          }
        },
        {
          id: 'demo-student-3',
          email: 'mike@demo.com',
          name: 'Michael Brown',
          phone: '+27555666777',
          role: 'student',
          createdAt: new Date('2023-03-05'),
          updatedAt: new Date('2024-01-22'),
          profileData: {
            dateOfBirth: '1998-12-03',
            institution: 'Stellenbosch University',
            fieldOfStudy: 'Computer Science',
            level: 'postgraduate',
            documents: {
              idCardUrl: 'https://example.com/id-card.pdf',
              transcriptUrl: 'https://example.com/transcript.pdf',
              cvUrl: 'https://example.com/cv.pdf'
            }
          }
        },
        {
          id: 'demo-provider-1',
          email: 'provider@demo.com',
          name: 'Sarah Provider',
          phone: '+1234567891',
          role: 'provider',
          createdAt: new Date(),
          updatedAt: new Date(),
          profileData: {
            organizationName: 'Tech Education Foundation',
            contactPerson: 'Sarah Provider',
            website: 'https://techedu.org',
            description: 'Supporting students in technology fields'
          }
        },
        {
          id: 'demo-admin-1',
          email: 'admin@demo.com',
          name: 'Admin User',
          phone: '+1234567892',
          role: 'admin',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      // Check demo credentials
      if (credentials.password === 'demo123') {
        const demoUser = demoUsers.find(user => user.email === credentials.email);
        if (demoUser) {
          return demoUser;
        }
        throw new Error('Invalid demo credentials');
      }

      // For demo purposes, only allow demo credentials
      throw new Error('Please use demo credentials:\n• student@demo.com (password: demo123)\n• sarah@demo.com (password: demo123)\n• mike@demo.com (password: demo123)\n• provider@demo.com (password: demo123)\n• admin@demo.com (password: demo123)');
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const registerUser = createAsyncThunk(
  'user/register',
  async (userData: RegisterForm & { role: 'student' | 'provider' }, { rejectWithValue }) => {
    try {
      // For demo purposes, simulate successful registration
      const newUser: User = {
        id: `demo-${userData.role}-${Date.now()}`,
        email: userData.email,
        name: userData.name,
        phone: userData.phone,
        role: userData.role,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      return newUser;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateUserProfile = createAsyncThunk(
  'user/updateProfile',
  async (profileData: StudentProfile | ProviderProfile, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { user: UserState };
      const userId = state.user.currentUser?.id;
      
      if (!userId) {
        throw new Error('User not authenticated');
      }

      const updatedUser = {
        ...state.user.currentUser,
        profileData,
        updatedAt: new Date(),
      };

      await updateDoc(doc(db, 'users', userId), {
        profileData,
        updatedAt: new Date(),
      });

      return updatedUser;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const logoutUser = createAsyncThunk(
  'user/logout',
  async (_, { rejectWithValue }) => {
    try {
      // For demo purposes, just return null (simulate logout)
      return null;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchUserProfile = createAsyncThunk(
  'user/fetchProfile',
  async (userId: string, { rejectWithValue }) => {
    try {
      // For demo purposes, return a mock user profile
      const mockUser: User = {
        id: userId,
        email: 'demo@example.com',
        name: 'Demo User',
        role: 'student',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      return mockUser;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentUser: (state, action: PayloadAction<User | null>) => {
      state.currentUser = action.payload;
      state.isAuthenticated = !!action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.currentUser = action.payload;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
      })
      // Register
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.currentUser = action.payload;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
      })
      // Update Profile
      .addCase(updateUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.currentUser = action.payload;
        state.error = null;
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Logout
      .addCase(logoutUser.fulfilled, (state) => {
        state.currentUser = null;
        state.isAuthenticated = false;
        state.loading = false;
        state.error = null;
      })
      // Fetch Profile
      .addCase(fetchUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.currentUser = action.payload;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, setCurrentUser } = userSlice.actions;
export default userSlice.reducer;
