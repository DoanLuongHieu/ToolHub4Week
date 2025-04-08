/**
 * Model đại diện cho thông tin preview của một file
 */
export interface FilePreview {
  file: File;
  previewUrl?: string;
}

/**
 * Model đại diện cho loại file
 */
export enum FileType {
  PDF = 'application/pdf',
  EXCEL = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  CSV = 'text/csv',
  IMAGE = 'image',
  WORD = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  TEXT = 'text/plain',
}

/**
 * Kiểm tra loại file
 * @param file File cần kiểm tra
 * @param type Loại file cần kiểm tra
 * @returns true nếu file thuộc loại được chỉ định
 */
export function isFileType(file: File, type: FileType): boolean {
  if (type === FileType.IMAGE) {
    return file.type.startsWith('image/');
  }
  return file.type === type;
}
