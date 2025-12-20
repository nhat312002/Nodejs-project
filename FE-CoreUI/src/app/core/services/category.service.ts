import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../environments/environment';
import {Observable} from 'rxjs';
import {ApiResponse} from '../models/api.model';
import {Category, CategoryListData} from '../models/category.model';

@Injectable({providedIn: 'root'})
export class CategoryService {
  private http = inject(HttpClient);
  private adminApiUrl = `${environment.apiUrl}/admin/categories`;

  getCategories(page: number = 1, limit: number = 10, search: string = ''): Observable<ApiResponse<CategoryListData>> {
    const params: any = {page, limit};
    if (search) params.name = search;

    return this.http.get<ApiResponse<CategoryListData>>(this.adminApiUrl, {params});
  }

  create(data: Partial<Category>): Observable<ApiResponse<Category>>{
    return this.http.post<ApiResponse<Category>>(this.adminApiUrl, data);
  }

  update(id: number, data: Partial<Category>): Observable<ApiResponse<Category>> {
    return this.http.put<ApiResponse<Category>>(`${this.adminApiUrl}/${id}`, data);
  }
}
