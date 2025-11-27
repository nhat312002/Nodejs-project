import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { ApiResponse } from '../core/models/api.model';
import { User, UserListData } from '../core/models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/admin/users`;

  getUsers(page: number = 1, limit : number = 10, search : string){
    const params : any = {page, limit};
    if (search.trim()) params.search = search;

    return this.http.get<ApiResponse<UserListData>>(this.apiUrl, {params});
  }

  update(userId: number, data: Partial<User> | any){
    return this.http.put<ApiResponse<any>>(`${this.apiUrl}/${userId}`, data);
  }

}
