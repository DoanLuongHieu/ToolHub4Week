/**
 * Model đại diện cho thông tin người dùng
 */
export interface User {
  uid: string;
  id: string;
  email: string;
  username: string;
  createdAt: Date;
  invitationCode?: string;
  photoURL?: string;
  displayName?: string;
  fullName?: string;
  birthDate?: string;
  gender?: string;
  facebookUrl?: string;
  youtubeUrl?: string;
  twitterUrl?: string;
  instagramUrl?: string;
}

/**
 * Model đại diện cho người dùng Firebase
 */
export interface FirebaseUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  isNewUser?: boolean;
}

/**
 * Model đại diện cho yêu cầu đăng ký
 */
export interface RegisterRequest {
  email: string;
  username: string;
  password: string;
  displayName?: string;
  invitationCode?: string;
}

/**
 * Model đại diện cho yêu cầu đăng nhập
 */
export interface LoginRequest {
  email: string;
  password: string;
  usernameOrEmail: string;
}
