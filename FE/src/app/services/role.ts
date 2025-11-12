import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Role {
  id: number;
  name: string;
  status: number;
}

@Injectable({
  providedIn: 'root',
})
export class RoleService {
    readonly baseUrl = 'http://localhost:3000/roles';

  constructor(readonly http: HttpClient) {}

  getAllRoles(): Observable<Role[]> {
    return this.http.get<Role[]>(this.baseUrl);
  }

  // Sau này có thể thêm create, update, delete role
}
