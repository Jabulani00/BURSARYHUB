import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  User as FirebaseUser 
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { User, StudentProfile, ProviderProfile } from '../types';

export class AuthService {
  // Demo credentials for testing
  private static demoUsers: User[] = [
    {
      id: 'demo-student-1',
      email: 'student@demo.com',
      name: 'John Student',
      phone: '+1234567890',
      role: 'student',
      createdAt: new Date(),
      updatedAt: new Date(),
      profileData: {
        dateOfBirth: '2000-01-01',
        institution: 'University of Technology',
        fieldOfStudy: 'Computer Science',
        level: 'undergraduate',
        documents: {}
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

  // Sign in with email and password
  static async signIn(email: string, password: string): Promise<User> {
    try {
      // Check demo credentials first
      if (password === 'demo123') {
        const demoUser = this.demoUsers.find(user => user.email === email);
        if (demoUser) {
          return demoUser;
        }
        throw new Error('Invalid demo credentials');
      }

      // For demo purposes, only allow demo credentials
      throw new Error('Please use demo credentials: student@demo.com, provider@demo.com, or admin@demo.com with password: demo123');
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  // Register new user
  static async register(
    email: string, 
    password: string, 
    name: string, 
    role: 'student' | 'provider' | 'admin',
    phone?: string
  ): Promise<User> {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update Firebase Auth profile
      await updateProfile(userCredential.user, {
        displayName: name,
      });

      // Create user document in Firestore
      const newUser: User = {
        id: userCredential.user.uid,
        email,
        name,
        phone,
        role,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await setDoc(doc(db, 'users', userCredential.user.uid), newUser);
      return newUser;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  // Sign out current user
  static async signOut(): Promise<void> {
    try {
      await signOut(auth);
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  // Reset password
  static async resetPassword(email: string): Promise<void> {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  // Update user profile
  static async updateUserProfile(
    userId: string, 
    profileData: StudentProfile | ProviderProfile
  ): Promise<void> {
    try {
      await updateDoc(doc(db, 'users', userId), {
        profileData,
        updatedAt: new Date(),
      });
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  // Get current user
  static getCurrentUser(): FirebaseUser | null {
    return auth.currentUser;
  }

  // Get user profile from Firestore
  static async getUserProfile(userId: string): Promise<User | null> {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists()) {
        return { id: userId, ...userDoc.data() } as User;
      }
      return null;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  // Check if user exists
  static async userExists(email: string): Promise<boolean> {
    try {
      // This is a simplified check - in production, you might want to use
      // Firebase Admin SDK or a Cloud Function for this
      return false;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  // Update user role (admin only)
  static async updateUserRole(userId: string, role: 'student' | 'provider' | 'admin'): Promise<void> {
    try {
      await updateDoc(doc(db, 'users', userId), {
        role,
        updatedAt: new Date(),
      });
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  // Delete user account
  static async deleteUser(userId: string): Promise<void> {
    try {
      // Delete user document from Firestore
      await doc(db, 'users', userId);
      // Note: Deleting the Firebase Auth user requires the user to be signed in
      // or using Firebase Admin SDK
    } catch (error: any) {
      throw new Error(error.message);
    }
  }
}
