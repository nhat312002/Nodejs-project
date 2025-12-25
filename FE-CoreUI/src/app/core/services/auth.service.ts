import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';
import { catchError, Observable, of, tap, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { skipRefreshLogic } from '../interceptors/skip.context';

export interface LoginResponse {
  success: boolean;
  data: {
    token: string;
    refresh_token: string;
    user: {
      id: number;
      full_name: string;
      email: string;
      username: string;
      role_id: number;
    }
  };
  message: string;
}

export interface JwtPayload {
  userId: number;
  role: number;
  exp: number;
  iat: number;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  // Sử dụng Signal để quản lý state user toàn cục
  currentUser = signal<JwtPayload | null>(null);

  // Computed signal để check quyền Admin nhanh
  isAdmin = computed(() => this.currentUser()?.role === 3);

  constructor() {
    this.loadUserFromToken();
    // Sử dụng setTimeout 0 để đảm bảo check session sau khi App đã khởi tạo xong
    setTimeout(() => this.checkSessionValidity(), 0);
  }

  private checkSessionValidity() {
    const refreshToken = this.getRefreshToken();

    if (!refreshToken) {
      this.currentUser.set(null);
      return;
    }

    try {
      const decoded: any = jwtDecode(refreshToken);
      const currentTime = Date.now() / 1000;

      // Nếu Refresh Token đã hết hạn
      if (decoded.exp < currentTime) {
        console.warn('Session expired. Logging out...');
        const currentUrl = window.location.pathname + window.location.search;
        this.logout('/login', currentUrl);

        return;
      }

      // Nếu Access Token hết hạn nhưng Refresh Token còn sống -> Refresh ngay
      if (this.isAccessTokenExpired()) {
        this.refreshToken().subscribe({
          error: () => console.error('Silent refresh failed on startup')
        });
      }
    } catch (error) {
      this.logout('/login');
    }
  }

  public loadUserFromToken() {
    const token = this.getAccessToken();
    if (token) {
      try {
        const decoded = jwtDecode<JwtPayload>(token);
        this.currentUser.set(decoded);
      } catch (error) {
        this.currentUser.set(null);
      }
    } else {
      this.currentUser.set(null);
    }
  }

  login(credentials: any) {
    return this.http.post<LoginResponse>(`${environment.apiUrl}/auth/login`, credentials)
      .pipe(
        tap(response => {
          localStorage.setItem('token', response.data.token);
          localStorage.setItem('refreshToken', response.data.refresh_token);
          this.loadUserFromToken();
        })
      );
  }

  register(payload: any) {
    return this.http.post<any>(`${environment.apiUrl}/auth/register`, payload);
  }

  /**
   * Hàm Logout quan trọng để dọn dẹp và chặn loop điều hướng
   */
  logout(redirectTo: string = '/login', returnUrl?: string) {
    const currentUrl = this.router.url;
    const finalReturnUrl = returnUrl || (currentUrl.includes('/login') ? undefined : currentUrl);

    // 1. Xóa dữ liệu storage trước
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    this.currentUser.set(null);

    // 2. Dọn dẹp UI (Modal backdrop)
    this.cleanupDOM();

    // 3. Chặn Loop: Nếu đang ở trang login rồi thì không navigate nữa
    // Đây là nguyên nhân chính gây lỗi "Aw Snap" do navigate đệ quy
    // const currentUrl = this.router.url;
    // if (currentUrl.includes('/login') && redirectTo === '/login') {
      // return;
    // }
    if (this.router.url.startsWith('/login') && redirectTo === '/login') return;

    const queryParams: any = {};
    if (finalReturnUrl && finalReturnUrl !== '/' && finalReturnUrl !== '/login') {
      queryParams.returnUrl = finalReturnUrl;
    }

    this.router.navigate([redirectTo], { queryParams });
  }

  private cleanupDOM() {
    document.body.classList.remove('modal-open');
    document.body.style.removeProperty('overflow');
    document.body.style.removeProperty('padding-right');
    const backdrops = document.querySelectorAll('.modal-backdrop');
    backdrops.forEach(backdrop => (backdrop as HTMLElement).remove());
  }

  refreshToken(): Observable<any> {
    const refreshToken = this.getRefreshToken();

    if (!refreshToken) {
      this.logout('/login');
      return throwError(() => new Error('No refresh token available'));
    }

    return this.http.post<any>(
      `${environment.apiUrl}/auth/refresh`,
      { refresh_token: refreshToken },
      { context: skipRefreshLogic() } // Bỏ qua interceptor xử lý 401 cho chính nó
    ).pipe(
      tap((response) => {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('refreshToken', response.data.refresh_token);
        this.loadUserFromToken();
      }),
      catchError((err) => {
        // Nếu API refresh trả về lỗi (401, 403, 500...), buộc phải logout
        this.logout('/login', this.router.url);

        return throwError(() => err);
      })
    );
  }

  getAccessToken(): string | null {
    return localStorage.getItem('token');
  }

  getRefreshToken(): string | null {
    return localStorage.getItem('refreshToken');
  }

  isAccessTokenExpired(): boolean {
    const token = this.getAccessToken();
    if (!token) return true;
    try {
      const decoded: any = jwtDecode(token);
      return decoded.exp < (Date.now() / 1000);
    } catch {
      return true;
    }
  }

  getRedirectUrl(){
    return '/';
  }
}
