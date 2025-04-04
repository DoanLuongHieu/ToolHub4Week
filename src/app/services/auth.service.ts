import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { delay, tap, switchMap, map, catchError } from 'rxjs/operators';
import { FirebaseAuthService, FirebaseUser } from './firebase-auth.service';

export interface User {
  id: string;
  email: string;
  username: string;
  createdAt: Date;
  invitationCode?: string;
  photoURL?: string; // Ảnh đại diện từ Google
  displayName?: string; // Tên hiển thị từ Google
  fullName?: string; // Họ và tên đầy đủ
  birthDate?: string; // Ngày sinh
  gender?: string; // Giới tính
  facebookUrl?: string; // Tài khoản Facebook
  youtubeUrl?: string; // Tài khoản YouTube
  twitterUrl?: string; // Tài khoản Twitter
  instagramUrl?: string; // Tài khoản Instagram
}

export interface RegisterRequest {
  email: string;
  username: string;
  password: string;
  invitationCode?: string;
}

export interface LoginRequest {
  usernameOrEmail: string;
  password: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  // Mô phỏng lưu trữ người dùng trong localStorage
  private readonly USERS_STORAGE_KEY = 'toolhub_users';
  private readonly CURRENT_USER_KEY = 'toolhub_current_user';

  constructor(private firebaseAuthService: FirebaseAuthService) {
    // Kiểm tra người dùng đã đăng nhập từ localStorage
    const storedUser = localStorage.getItem(this.CURRENT_USER_KEY);
    if (storedUser) {
      this.currentUserSubject.next(JSON.parse(storedUser));
    }

    // Đồng bộ user giữa Firebase và user cục bộ
    this.syncFirebaseUser();
  }

  // Đồng bộ user từ Firebase
  private syncFirebaseUser(): void {
    this.firebaseAuthService.currentUser$.subscribe((firebaseUser) => {
      if (firebaseUser) {
        // Tìm user trong cơ sở dữ liệu local
        this.findUserByFirebaseUid(firebaseUser.uid).subscribe((user) => {
          if (user) {
            // Nếu tìm thấy, cập nhật thông tin hiện tại
            this.currentUserSubject.next(user);
            localStorage.setItem(this.CURRENT_USER_KEY, JSON.stringify(user));
          }
        });
      }
    });
  }

  // Tìm user trong cơ sở dữ liệu local dựa trên Firebase UID
  private findUserByFirebaseUid(uid: string): Observable<User | null> {
    const users = this.getUsers();
    const user = users.find((u) => u.id === uid);
    return of(user || null);
  }

  // Đăng ký người dùng mới
  register(userData: RegisterRequest): Observable<User> {
    // Mô phỏng API call
    return of(this.createUser(userData)).pipe(
      delay(800), // Mô phỏng độ trễ mạng
      tap((user) => {
        // Lưu người dùng vào bộ nhớ cục bộ
        const users = this.getUsers();
        users.push(user);
        localStorage.setItem(this.USERS_STORAGE_KEY, JSON.stringify(users));

        // Cập nhật người dùng hiện tại
        this.currentUserSubject.next(user);
        localStorage.setItem(this.CURRENT_USER_KEY, JSON.stringify(user));
      })
    );
  }

  // Đăng ký với Gmail
  registerWithGoogle(): Observable<{ isNewUser: boolean; user: FirebaseUser }> {
    return this.firebaseAuthService.signInWithGoogle().pipe(
      switchMap((firebaseUser) => {
        if (!firebaseUser) {
          throw new Error('Đăng nhập Google thất bại');
        }

        // Kiểm tra xem user đã tồn tại trong DB chưa
        return this.findUserByFirebaseUid(firebaseUser.uid).pipe(
          map((existingUser) => {
            const isNewUser = !existingUser;
            return { isNewUser, user: firebaseUser };
          })
        );
      })
    );
  }

  // Hoàn thành đăng ký Gmail bằng thêm username
  completeGoogleRegistration(data: {
    uid: string;
    email: string;
    username: string;
    photoURL?: string;
    displayName?: string;
  }): Observable<User> {
    const newUser: User = {
      id: data.uid,
      email: data.email,
      username: data.username,
      createdAt: new Date(),
      photoURL: data.photoURL || '',
      displayName: data.displayName || '',
    };

    return of(newUser).pipe(
      delay(800), // Mô phỏng độ trễ mạng
      tap((user) => {
        // Lưu user vào localStorage
        const users = this.getUsers();
        users.push(user);
        localStorage.setItem(this.USERS_STORAGE_KEY, JSON.stringify(users));

        // Cập nhật người dùng hiện tại
        this.currentUserSubject.next(user);
        localStorage.setItem(this.CURRENT_USER_KEY, JSON.stringify(user));
      })
    );
  }

  // Đăng nhập thông thường
  login(loginData: LoginRequest): Observable<User> {
    // Mô phỏng API call
    return of(this.validateLogin(loginData)).pipe(
      delay(800), // Mô phỏng độ trễ mạng
      tap((user) => {
        // Lưu người dùng hiện tại vào localStorage
        this.currentUserSubject.next(user);
        localStorage.setItem(this.CURRENT_USER_KEY, JSON.stringify(user));
      })
    );
  }

  // Đăng nhập với Google
  loginWithGoogle(): Observable<User> {
    return this.firebaseAuthService.signInWithGoogle().pipe(
      switchMap((firebaseUser) => {
        if (!firebaseUser) {
          throw new Error('Đăng nhập Google thất bại');
        }

        // Tìm user trong cơ sở dữ liệu local
        return this.findUserByFirebaseUid(firebaseUser.uid).pipe(
          switchMap((user) => {
            if (!user) {
              // Nếu chưa có user này, cần đăng ký
              const error = new Error('USER_NOT_REGISTERED');
              (error as any).firebaseUser = firebaseUser; // Lưu thông tin người dùng vào đối tượng lỗi
              throw error;
            }

            // Lưu user hiện tại
            this.currentUserSubject.next(user);
            localStorage.setItem(this.CURRENT_USER_KEY, JSON.stringify(user));

            return of(user);
          })
        );
      }),
      catchError((err) => {
        if (err.message === 'USER_NOT_REGISTERED') {
          const error = new Error(
            'Tài khoản chưa được đăng ký. Vui lòng đăng ký trước.'
          );
          // Chuyển thông tin người dùng từ đối tượng lỗi gốc sang đối tượng lỗi mới
          if (err.firebaseUser) {
            (error as any).user = err.firebaseUser;
          }
          throw error;
        }
        throw err;
      })
    );
  }

  // Đăng xuất
  logout(): Observable<void> {
    localStorage.removeItem(this.CURRENT_USER_KEY);
    this.currentUserSubject.next(null);

    // Đăng xuất khỏi Firebase
    return this.firebaseAuthService.signOut();
  }

  // Kiểm tra email đã tồn tại chưa
  isEmailTaken(email: string): boolean {
    const users = this.getUsers();
    return users.some((user) => user.email === email);
  }

  // Kiểm tra username đã tồn tại chưa
  isUsernameTaken(username: string): boolean {
    const users = this.getUsers();
    return users.some((user) => user.username === username);
  }

  // Lấy danh sách người dùng từ localStorage
  private getUsers(): User[] {
    const storedUsers = localStorage.getItem(this.USERS_STORAGE_KEY);
    return storedUsers ? JSON.parse(storedUsers) : [];
  }

  // Tạo đối tượng người dùng mới
  private createUser(userData: RegisterRequest): User {
    return {
      id: this.generateId(),
      email: userData.email,
      username: userData.username,
      createdAt: new Date(),
      invitationCode: userData.invitationCode,
    };
  }

  // Xác thực đăng nhập
  private validateLogin(loginData: LoginRequest): User {
    const users = this.getUsers();
    const user = users.find(
      (u) =>
        u.email === loginData.usernameOrEmail ||
        u.username === loginData.usernameOrEmail
    );

    if (!user) {
      throw new Error('User not found');
    }

    // Trong thực tế, cần so sánh mật khẩu đã băm
    // Ở đây ta đang mô phỏng nên bỏ qua việc kiểm tra mật khẩu

    return user;
  }

  // Tạo ID ngẫu nhiên
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
  }

  // Cập nhật thông tin người dùng
  updateUserProfile(
    userId: string,
    profileData: Partial<User>
  ): Observable<User> {
    // Trong thực tế, đây sẽ là API call
    return of(null).pipe(
      delay(800), // Mô phỏng độ trễ mạng
      switchMap(() => {
        const users = this.getUsers();
        const userIndex = users.findIndex((u) => u.id === userId);

        if (userIndex === -1) {
          throw new Error('Không tìm thấy người dùng');
        }

        // Cập nhật thông tin người dùng
        const updatedUser = { ...users[userIndex], ...profileData };
        users[userIndex] = updatedUser;

        // Lưu vào localStorage
        localStorage.setItem(this.USERS_STORAGE_KEY, JSON.stringify(users));

        // Cập nhật người dùng hiện tại nếu là người dùng đang đăng nhập
        if (this.currentUserSubject.value?.id === userId) {
          this.currentUserSubject.next(updatedUser);
          localStorage.setItem(
            this.CURRENT_USER_KEY,
            JSON.stringify(updatedUser)
          );
        }

        return of(updatedUser);
      })
    );
  }

  // Đổi mật khẩu (mô phỏng, vì thực tế chúng ta không lưu mật khẩu trong localStorage)
  changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ): Observable<boolean> {
    // Trong thực tế, đây sẽ là API call để xác thực mật khẩu hiện tại và cập nhật mật khẩu mới
    return of(null).pipe(
      delay(800), // Mô phỏng độ trễ mạng
      switchMap(() => {
        // Vì đây là mô phỏng, chúng ta giả định mật khẩu hiện tại là đúng
        // Trong thực tế, cần kiểm tra mật khẩu với backend

        // Trả về thành công
        return of(true);
      }),
      // Đăng xuất sau khi đổi mật khẩu thành công
      tap(() => {
        this.logout().subscribe();
      })
    );
  }

  // Cập nhật ảnh đại diện
  updateProfilePhoto(userId: string, photoURL: string): Observable<User> {
    return this.updateUserProfile(userId, { photoURL });
  }

  // Lấy thông tin người dùng theo ID
  getUserById(userId: string): Observable<User | null> {
    const users = this.getUsers();
    const user = users.find((u) => u.id === userId);
    return of(user || null);
  }
}
