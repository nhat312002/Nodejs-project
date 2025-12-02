import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse, Pagination } from '../models/api.model';
import { environment } from '../../../environments/environment';

export interface Language {
  id: number;
  locale: string;
  name: string;
  url_flag: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface LanguageListData {
  pagination: Pagination;
  languages: Language[];
}

@Injectable({
  providedIn: 'root'
})
export class LanguageService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/languages`;

  getAll(page: number = 1, limit: number = 10, search: string): Observable<ApiResponse<LanguageListData>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (search.trim()) {
      params = params.set('search', search.trim());
    }

    return this.http.get<ApiResponse<LanguageListData>>(this.apiUrl, { params });
  }




}
