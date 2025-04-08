/**
 * Model đại diện cho một trang PDF
 */
export interface PdfPage {
  pageNumber: number;
  selected: boolean;
}

/**
 * Model đại diện cho khoảng trang trong PDF
 */
export interface PageRange {
  start: number;
  end: number;
}

/**
 * Model đại diện cho cấu hình nén PDF
 */
export interface CompressionState {
  isCompressing: boolean;
  error: string | null;
  originalFile: File | null;
  compressedFile: Uint8Array | null;
  originalSize: number | null;
  compressedSize: number | null;
  quality: number;
  removeMetadata: boolean;
}

/**
 * Model đại diện cho các tùy chọn chuyển đổi PDF
 */
export interface PdfConversionOptions {
  outputFormat: 'xlsx' | 'csv' | 'txt' | 'jpg' | 'png';
  quality?: number; // Cho định dạng ảnh
  includeHeader?: boolean; // Cho Excel/CSV
  pageNumbers?: number[]; // Các trang cần chuyển đổi
}
