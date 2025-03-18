import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, from, of } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { User } from './auth.service';

// Firebase
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut,
  UserCredential,
  onAuthStateChanged,
  Auth as FirebaseAuth
} from 'firebase/auth';

export interface FirebaseUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  isNewUser?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class FirebaseAuthService {
  private auth: FirebaseAuth;
  private googleProvider = new GoogleAuthProvider();
  
  private currentUserSubject = new BehaviorSubject<FirebaseUser | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  // Lưu thông tin user Firebase trong localStorage
  private readonly FIREBASE_USER_KEY = 'toolhub_firebase_user';

  constructor() {
    // Khởi tạo Firebase
    const app = initializeApp(environment.firebaseConfig);
    this.auth = getAuth(app);
    
    // Cấu hình GoogleAuthProvider
    this.googleProvider.setCustomParameters({
      prompt: 'select_account'
    });

    // Kiểm tra trạng thái xác thực khi khởi tạo
    this.initAuthState();

    // Load user từ localStorage
    const storedUser = localStorage.getItem(this.FIREBASE_USER_KEY);
    if (storedUser) {
      this.currentUserSubject.next(JSON.parse(storedUser));
    }
  }

  // Lắng nghe trạng thái xác thực từ Firebase
  private initAuthState(): void {
    onAuthStateChanged(this.auth, (user) => {
      if (user) {
        const firebaseUser: FirebaseUser = {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL
        };
        this.currentUserSubject.next(firebaseUser);
        localStorage.setItem(this.FIREBASE_USER_KEY, JSON.stringify(firebaseUser));
      } else {
        this.currentUserSubject.next(null);
        localStorage.removeItem(this.FIREBASE_USER_KEY);
      }
    });
  }

  // Đăng nhập bằng Google
  signInWithGoogle(): Observable<FirebaseUser> {
    return from(signInWithPopup(this.auth, this.googleProvider))
      .pipe(
        map((result: UserCredential) => {
          const user = result.user;
          const isNewUser = user.metadata.creationTime === user.metadata.lastSignInTime;
          
          const firebaseUser: FirebaseUser = {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
            isNewUser: isNewUser
          };
          
          return firebaseUser;
        }),
        tap(user => {
          this.currentUserSubject.next(user);
          localStorage.setItem(this.FIREBASE_USER_KEY, JSON.stringify(user));
        }),
        catchError(error => {
          console.error('Lỗi đăng nhập Google:', error);
          throw error;
        })
      );
  }

  // Đăng xuất
  signOut(): Observable<void> {
    return from(signOut(this.auth))
      .pipe(
        tap(() => {
          this.currentUserSubject.next(null);
          localStorage.removeItem(this.FIREBASE_USER_KEY);
        }),
        catchError(error => {
          console.error('Lỗi đăng xuất:', error);
          return of(undefined);
        })
      );
  }

  // Lấy thông tin người dùng hiện tại
  getCurrentUser(): FirebaseUser | null {
    return this.currentUserSubject.value;
  }

  // Kiểm tra người dùng đã đăng nhập chưa
  isLoggedIn(): boolean {
    return !!this.currentUserSubject.value;
  }

  // Cập nhật thông tin người dùng cục bộ (khi tạo username)
  updateLocalUserInfo(updates: Partial<FirebaseUser>): void {
    const currentUser = this.getCurrentUser();
    if (currentUser) {
      const updatedUser = { ...currentUser, ...updates };
      this.currentUserSubject.next(updatedUser);
      localStorage.setItem(this.FIREBASE_USER_KEY, JSON.stringify(updatedUser));
    }
  }

  // Tìm người dùng từ Firestore theo uid
  // Đây chỉ là mẫu, trong thực tế bạn sẽ tích hợp với Firestore
  findUserByUid(uid: string): Observable<User | null> {
    // Mô phỏng việc tìm kiếm người dùng từ Firestore
    const storedUsers = localStorage.getItem('toolhub_users');
    const users: User[] = storedUsers ? JSON.parse(storedUsers) : [];
    const user = users.find(u => u.id === uid);
    
    return of(user || null);
  }

  // Kiểm tra xem người dùng đã đăng ký username chưa
  hasCompletedRegistration(uid: string): Observable<boolean> {
    return this.findUserByUid(uid).pipe(
      map(user => !!user && !!user.username)
    );
  }
} 