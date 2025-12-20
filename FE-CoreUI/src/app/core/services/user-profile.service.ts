import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api.model';

@Injectable({
  providedIn: 'root'
})
export class UserProfileService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/users`;

  /** Cập nhật tên + số điện thoại */
  updateProfile(data: { fullName: string; phone: string }) {
    return this.http.put<ApiResponse<any>>(
      `${this.apiUrl}/profile`,
      data
    );
  }

  /** Đổi mật khẩu */
  changePassword(data: {
    currentPassword: string;
    newPassword: string;
  }) {
    return this.http.put<ApiResponse<any>>(
      `${this.apiUrl}/change-password`,
      data
    );
  }
}
