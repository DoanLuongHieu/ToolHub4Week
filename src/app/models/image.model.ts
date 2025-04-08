/**
 * Model đại diện cho thông tin metadata của ảnh
 */
export interface ImageMetadata {
  width?: number;
  height?: number;
  format?: string;
  orientation?: number;
  gps?: {
    latitude?: number;
    longitude?: number;
  };
  exif?: {
    [key: string]: any;
  };
  dateTime?: string;
  make?: string;
  model?: string;
}

/**
 * Model đại diện cho tùy chọn chuyển đổi ảnh
 */
export interface ImageConversionOptions {
  format: 'jpeg' | 'png' | 'webp' | 'gif';
  quality?: number; // 0-100
  resize?: {
    width?: number;
    height?: number;
    maintainAspectRatio?: boolean;
  };
  rotate?: number; // Degrees
}

/**
 * Model đại diện cho tùy chọn chỉnh sửa ảnh
 */
export interface ImageEditOptions {
  crop?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  brightness?: number; // -100 to 100
  contrast?: number; // -100 to 100
  saturation?: number; // -100 to 100
  filters?: string; // CSS filter string
}
