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
