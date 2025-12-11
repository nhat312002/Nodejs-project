import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';
import { catchError, Observable, of, tap, throwError } from 'rxjs';

export interface LoginResponse {
  success: boolean;
  data: {
    token: string;
    refresh_token: string; // Note: Your API uses snake_case here
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

  currentUser = signal<JwtPayload | null>(null);

  isAdmin = computed(() => this.currentUser()?.role == 3);

  constructor() {
    this.loadUserFromToken();
  }

  private loadUserFromToken() {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode<JwtPayload>(token);

        this.currentUser.set(decoded);

      } catch (error) {
        this.logout();
      }
    }
  }

  login(credentials: any) {
    return this.http.post<LoginResponse>('http://localhost:3000/auth/login', credentials)
      .pipe(
        tap(response => {

          const tokenData = {
            token: response.data.token,
            refreshToken: response.data.refresh_token
          };

          localStorage.setItem('token', tokenData.token);
          localStorage.setItem('refreshToken', tokenData.refreshToken);
          this.loadUserFromToken();


          setTimeout(() => {
            this.router.navigate(['']);
          }, 50);
        })
      );
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    this.currentUser.set(null);
    this.router.navigate(['']);
  }

  refreshToken(): Observable<any> {
    const refreshToken = localStorage.getItem('refreshToken');

    console.log('Attempting refresh');

    if (!refreshToken) {
      console.log('No refresh token found');
      this.logout();
      return throwError(() => new Error('No refresh token'));
    }

    return this.http.post<any>('http://localhost:3000/auth/refresh', { refresh_token: refreshToken })
      .pipe(
        tap((response) => {
          console.log('Refresh API success');
          localStorage.setItem('token', response.data.token);
          localStorage.setItem('refreshToken', response.data.refresh_token);

          this.loadUserFromToken();
        }),
        catchError((err) => {
          console.log("Error error");
          this.logout();
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

  // isAuthenticated(): boolean {
  //   return !!localStorage.getItem('token');
  // }

  getRedirectUrl(): string {
    const user = this.currentUser();

    if (!user) return '/login';

    if (user.role == 3) {
      return '/dashboard';
    } else {
      return '/home';
    }
  }

  isAccessTokenExpired(): boolean {
    const token = this.getAccessToken();
    if (!token) return true;

    try {
      const decoded: any = jwtDecode(token);
      const currentTime = Date.now() / 1000;
      return decoded.exp < currentTime;
    } catch (error) {
      return true;
    }
  }
}
