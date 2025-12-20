import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api.model';

@Injectable({
  providedIn: 'root'
})
export class UserProfileService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}`;

  /** Cập nhật tên + số điện thoại */
  updateProfile(data: { fullName: string; phone: string }) {
    return this.http.put<ApiResponse<any>>(
      `${this.apiUrl}/profile`,
      {
        full_name: data.fullName,
        phone: data.phone
      }
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
