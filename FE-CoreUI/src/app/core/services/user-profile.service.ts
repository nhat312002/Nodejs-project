import { effect, inject, Injectable, signal, untracked } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api.model';
import { User } from '../../core/models/user.model';
import { AuthService } from './auth.service';
import { tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserProfileService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}`;
  private authService = inject(AuthService);
  profile = signal<any>(null);

  constructor() {
    effect(() => {
      const authUser = this.authService.currentUser();

      if (authUser) {
        untracked(() => {
          this.fetchProfile();
        });
      } else {
        untracked(() => {
          this.profile.set(null);
        });
      }
    });
  }
  fetchProfile() {
    this.http.get<ApiResponse<User>>(`${this.apiUrl}/profile`).subscribe({
      next: (res) => {
        if (res.success){
          this.profile.set(res.data);
        }
      },
      error: () => this.profile.set(null)
    });
  }

  getProfile() {
    return this.http.get<ApiResponse<User>>(`${this.apiUrl}/profile`);
  }

  /** Cập nhật tên + số điện thoại */
  updateProfile(data: { fullName: string; phone: string }) {
    return this.http.put<ApiResponse<any>>(
      `${this.apiUrl}/profile`,
      {
        full_name: data.fullName,
        phone: data.phone
      }
    ).pipe(
      tap(() => {
        this.fetchProfile();
      })
    );
  }

  /** Đổi mật khẩu */
  changePassword(data: {
    currentPassword: string;
    newPassword: string;
  }) {
    return this.http.post<ApiResponse<any>>(
      `${this.apiUrl}/profile/password`,
      {
        password: data.newPassword,
        oldPassword: data.currentPassword,
      }
    );
  }
}
