// User Types
export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role: 'student' | 'provider' | 'admin';
  profileData?: StudentProfile | ProviderProfile;
  createdAt: Date;
  updatedAt: Date;
}

export interface StudentProfile {
  dateOfBirth: string;
  institution: string;
  fieldOfStudy: string;
  level: 'undergraduate' | 'postgraduate';
  documents: {
    idCardUrl?: string;
    matricCertUrl?: string;
    transcriptUrl?: string;
    cvUrl?: string;
  };
}

export interface ProviderProfile {
  organizationName: string;
  contactPerson: string;
  website?: string;
  description?: string;
}

// Bursary Types
export interface Bursary {
  id: string;
  title: string;
  description: string;
  providerId: string;
  providerName: string;
  requirements: string[];
  deadline: Date;
  fieldOfStudy: string[];
  level: 'undergraduate' | 'postgraduate' | 'both';
  amount?: number;
  duration?: string;
  location?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Application Types
export interface Application {
  id: string;
  bursaryId: string;
  studentId: string;
  providerId: string;
  status: 'submitted' | 'under_review' | 'accepted' | 'rejected' | 'withdrawn';
  submittedAt: Date;
  updatedAt: Date;
  notes?: string;
  studentInfo: {
    name: string;
    email: string;
    institution: string;
    fieldOfStudy: string;
    level: string;
  };
  bursaryInfo: {
    title: string;
    providerName: string;
    amount?: number;
  };
}

// Navigation Types
export type RootStackParamList = {
  Auth: undefined;
  Student: undefined;
  Provider: undefined;
  Admin: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  RoleSelection: undefined;
};

export type StudentStackParamList = {
  StudentDashboard: undefined;
  StudentProfile: undefined;
  BursaryList: undefined;
  BursaryDetails: { bursaryId: string };
  ApplicationForm: { bursaryId: string };
  ApplicationTracking: undefined;
  ApplicationDetails: { applicationId: string };
};

export type ProviderStackParamList = {
  ProviderDashboard: undefined;
  BursaryManagement: undefined;
  CreateBursary: undefined;
  EditBursary: { bursaryId: string };
  ApplicantReview: { bursaryId: string };
  ApplicationDetails: { applicationId: string };
};

export type AdminStackParamList = {
  AdminDashboard: undefined;
  UserManagement: undefined;
  BursaryOversight: undefined;
  SystemSettings: undefined;
};

// Form Types
export interface LoginForm {
  email: string;
  password: string;
}

export interface RegisterForm {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone?: string;
}

export interface BursaryForm {
  title: string;
  description: string;
  requirements: string[];
  deadline: string;
  fieldOfStudy: string[];
  level: 'undergraduate' | 'postgraduate' | 'both';
  amount?: number;
  duration?: string;
  location?: string;
}

export interface StudentProfileForm {
  dateOfBirth: string;
  institution: string;
  fieldOfStudy: string;
  level: 'undergraduate' | 'postgraduate';
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Filter Types
export interface BursaryFilters {
  fieldOfStudy?: string[];
  level?: 'undergraduate' | 'postgraduate' | 'both';
  deadline?: Date;
  searchTerm?: string;
}

// Notification Types
export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  isRead: boolean;
  createdAt: Date;
  actionUrl?: string;
}
