export interface User {
  id: string;
  email: string;
  name?: string | null;
  createdAt: Date;
}

export interface Conversion {
  id: string;
  userId: string;
  originalImageUrl: string;
  svgUrl: string;
  originalFilename: string;
  svgFilename: string;
  originalFileSize: number;
  svgFileSize: number;
  originalDimensions: string;
  status: ConversionStatus;
  errorMessage?: string | null;
  createdAt: Date;
}

export type ConversionStatus = "pending" | "processing" | "completed" | "failed";

export interface ConversionResult {
  id: string;
  originalImageUrl: string;
  svgUrl: string;
  originalFilename: string;
  svgFilename: string;
  originalFileSize: number;
  svgFileSize: number;
  originalDimensions: string;
  status: ConversionStatus;
  createdAt: Date;
}

export interface ImageDimensions {
  width: number;
  height: number;
}

export interface FalConversionResponse {
  image: {
    url: string;
    file_name: string;
    file_size: number;
    content_type: string;
  };
}

export const IMAGE_CONSTRAINTS = {
  MAX_SIZE: 5 * 1024 * 1024, // 5 MB
  MAX_RESOLUTION: 16 * 1000000, // 16 MP
  MAX_DIMENSION: 4096,
  MIN_DIMENSION: 256,
  ALLOWED_FORMATS: ["image/png", "image/jpeg", "image/webp"],
  ALLOWED_EXTENSIONS: [".png", ".jpg", ".jpeg", ".webp"],
} as const;

// Admin User Management Types
export interface AdminUser {
  id: string;
  email: string;
  name: string | null;
  createdAt: Date;
  subscriptionType: string;
  subscriptionStatus: string;
  subscriptionPlan: string | null;
  paypalSubscriptionId: string | null;
  creditsRemaining: number;
  creditsTotal: number;
  totalConversions: number;
  lastActivityAt: Date | null;
  isPaused: boolean;
}

export interface UserDetailStats {
  totalConversions: number;
  thisMonthConversions: number;
  creditsRemaining: number;
  creditsTotal: number;
  subscriptionStatus: string;
  subscriptionPlan: string | null;
  dailyUsage: DailyUsageData[];
  monthlyTrends: MonthlyTrendData[];
}

export interface DailyUsageData {
  date: string;
  count: number;
}

export interface MonthlyTrendData {
  month: string;
  count: number;
}

export interface AdminDashboardStats {
  totalUsers: number;
  activeSubscriptions: number;
  totalConversions: number;
  monthlyRevenue: number;
  freeUsers: number;
  paidUsers: number;
}

export interface UserListFilters {
  search?: string;
  planType?: string;
  status?: string;
  sortBy?: "conversions" | "createdAt" | "email";
  sortOrder?: "asc" | "desc";
}

export interface PaginatedUsersResponse {
  users: AdminUser[];
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}
