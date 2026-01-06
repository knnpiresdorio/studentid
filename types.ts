// Types definitions
// Forced refresh
export enum UserRole {
  STUDENT = 'STUDENT',
  STORE = 'STORE', // Apenas validação
  STORE_ADMIN = 'STORE_ADMIN', // Gestão da loja
  ADMIN = 'ADMIN', // Software/Super Admin
  SCHOOL_ADMIN = 'SCHOOL_ADMIN' // Specific School Admin
}

export enum SchoolType {
  UNIVERSITY = 'Universidade',
  PROFESSIONAL = 'Curso Profissionalizante',
  LANGUAGE = 'Escola de Idiomas',
  TRADITIONAL = 'Escola Tradicional'
}

export enum MemberType {
  STUDENT = 'ALUNO',
  STAFF = 'COLABORADOR',
  MANAGER = 'GESTOR',
  PARTNER = 'SÓCIO'
}

export interface School {
  id: string;
  name: string;
  logoUrl: string;
  type: SchoolType;
  isActive: boolean;
  description?: string;
  createdAt: string;
}

export interface Dependent {
  id: string;
  name: string;
  cpf: string;
  relation: string; // e.g., 'Filho', 'Cônjuge'
  birthDate: string;
  photoUrl?: string; // Add photoUrl
  city?: string; // Add city
  state?: string; // Add state
  isActive?: boolean;
}

export interface Student {
  id: string;
  schoolId: string;
  fullName: string;
  cpf: string;
  photoUrl: string;
  schoolName: string;
  schoolType: SchoolType;
  course: string;
  registrationNumber: string;
  validUntil: string;
  isActive: boolean;
  birthDate: string; // Add birthDate
  dependents: Dependent[];
  isDependent?: boolean;
  parentName?: string;
  city?: string;
  state?: string;
  userType?: MemberType;
}

export type PromotionUsageLimit = 'UNLIMITED' | 'MONTHLY' | 'ONCE';

export interface Promotion {
  id: string;
  title: string;
  limit: PromotionUsageLimit;
  description?: string;
  validUntil?: string;
  isActive?: boolean;
}

export interface Partner {
  id: string;
  schoolId: string;
  adminUserId?: string; // Linked Store Admin User ID
  name: string;
  category: string;
  discount: string;
  description: string;
  logoUrl: string;
  bannerUrl?: string;
  address: string;
  city?: string;
  state?: string;
  activePromotions?: Promotion[];
  phoneNumber?: string;
  instagramUrl?: string;
  facebookUrl?: string;
  tiktokUrl?: string;
  socialVisibility?: {
    instagram?: boolean;
    facebook?: boolean;
    tiktok?: boolean;
    phone?: boolean;
  };
  isActive: boolean;
}

export interface AppUser {
  id: string;
  username: string;
  role: UserRole;
  name: string;
  email?: string; // Real user email from Supabase Auth
  password?: string; // For mock user management (resetting password)
  studentData?: Student; // Only if role is STUDENT
  schoolId?: string; // Only if role is SCHOOL_ADMIN
  partnerId?: string; // Only if role is STORE_ADMIN or STORE
  mustChangePassword?: boolean;
}

export interface VerificationResult {
  valid: boolean;
  student?: Student;
  message: string;
  created_at: string;
  method?: 'QR' | 'CPF';
}

export type RequestType = 'ADD_DEPENDENT' | 'DELETE_DEPENDENT' | 'UPDATE_PHOTO' | 'UPDATE_INFO' | 'UPDATE_DEPENDENT' | 'BENEFIT_USAGE' | 'PARTNER_DELETION' | 'CREATE_MEMBER' | 'UPDATE_STUDENT' | 'DELETE_STUDENT' | 'UPDATE_PARTNER' | 'CREATE_PARTNER' | 'RESET_PASSWORD' | 'BULK_UPDATE_STATUS' | 'VALIDATION_SUCCESS' | 'APPROVE_REQUEST' | 'REJECT_REQUEST';

export interface ChangeRequest {
  id: string;
  schoolId: string;
  studentId: string;
  studentName: string;
  type: RequestType;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  reason: string;
  payload?: any; // Stores the dependent data to be added, or the ID to be deleted
  dependentId?: string;
  dependentName?: string;
  createdAt: string;
  resolvedAt?: string;
  resolvedBy?: string;
}

export interface Invite {
  id: string;
  token: string;
  schoolId: string;
  parentId?: string; // If it's a dependent invite
  role: UserRole.STUDENT | UserRole.STUDENT; // simplified for now
  isUsed: boolean;
  expiresAt: string;
  createdAt: string;
}


export enum ActionType {
  LOGIN = 'LOGIN',
  VALIDATION_SUCCESS = 'VALIDATION_SUCCESS',
  VALIDATION_FAILED = 'VALIDATION_FAILED',
  ACCESS = 'ACCESS',
  MODIFICATION = 'MODIFICATION',
  DELETE = 'DELETE',
  BENEFIT_USAGE = 'BENEFIT_USAGE'
}

export interface AuditLog {
  id: string;
  schoolId: string;
  actorId: string;
  actorName: string;
  actorRole: UserRole;
  action: ActionType | string; // Allow string for flexibility but prefer Enum
  targetStudent: string;
  details: string;
  metadata?: {
    ipAddress?: string;
    userAgent?: string;
    location?: string;
    [key: string]: any;
  };
  created_at: string;
}

// API Types
export interface PaginationParams {
  page: number;
  pageSize: number;
  searchTerm?: string;
  schoolId?: string;
}

export interface PaginatedResult<T> {
  data: T[];
  count: number;
}
