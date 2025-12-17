import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { ApiResponse } from '../models/api.model';
import { PostListData, Post } from '../models/post.model';

@Injectable({ providedIn: 'root' })
export class PostService {
  private http = inject(HttpClient);
  private publicApiUrl = `${environment.apiUrl}/posts`;
  private privateApiUrl = `${environment.apiUrl}/posts/own`;
  private moderatorApiUrl = `${environment.apiUrl}/moderate/posts`;

  getPublicPosts(params: {
    page?: number,
    limit?: number,
    categoryIds?: string | number[], // Có thể là ID hoặc 'other'
    locale?: string,               // Bắt buộc (ví dụ: 'vi', 'en')
    text?: string,
    sort?: string                 // 'date_desc', 'title_asc'...
  }): Observable<ApiResponse<PostListData>> {
    return this.http.get<ApiResponse<PostListData>>(this.publicApiUrl, { params });
  }

  getOwnPosts(params: {
    page?: number,
    limit?: number,
    categoryIds?: string | number[], // Có thể là ID hoặc 'other'
    locale?: string,               // Bắt buộc (ví dụ: 'vi', 'en')
    text?: string,
    sort?: string,                 // 'date_desc', 'title_asc'...
    status?: string,
  }): Observable<ApiResponse<PostListData>> {
    return this.http.get<ApiResponse<PostListData>>(this.privateApiUrl, { params });
  }

  getAdminPosts(params: {
    page?: number,
    limit?: number,
    categoryIds?: string | number[], // Có thể là ID hoặc 'other'
    locale?: string,               // Bắt buộc (ví dụ: 'vi', 'en')
    text?: string,
    sort?: string,                 // 'date_desc', 'title_asc'...
    status?: string
  }): Observable<ApiResponse<PostListData>> {
    return this.http.get<ApiResponse<PostListData>>(this.moderatorApiUrl, { params });
  }

  getPostDetail(id: number | string): Observable<ApiResponse<{post: Post}>> {
    return this.http.get<ApiResponse<{post: Post}>>(`${this.publicApiUrl}/${id}`);
  }

  // 2. OWNER (Read Own Drafts/Pending)
  // Backend must check: req.user.id === post.user_id
  getOwnPostDetail(id: string | number) {
    return this.http.get<ApiResponse<{ post: Post }>>(`${this.privateApiUrl}/${id}`);
  }

  // 3. ADMIN (Read Any for Moderation)
  getAdminPostDetail(id: string | number) {
    return this.http.get<ApiResponse<{ post: Post }>>(`${this.moderatorApiUrl}/${id}`);
  }

  // Lấy tất cả bài viết (cho bảng quản lý)
  getAll(page: number = 1, limit: number = 10, search: string = ''): Observable<ApiResponse<PostListData>> {
    const params: any = { page, limit };
    if (search) params.search = search;

    // Gọi endpoint: GET /admin/posts
    return this.http.get<ApiResponse<PostListData>>(this.moderatorApiUrl, { params });
  }

  create(data: any): Observable<ApiResponse<Post>> {
    return this.http.post<ApiResponse<Post>>(this.publicApiUrl, data);
  }

  update(id: number, data: any): Observable<ApiResponse<Post>> {
    return this.http.put<ApiResponse<Post>>(`${this.publicApiUrl}/${id}`, data);
  }

  delete(id: number): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(`${this.publicApiUrl}/${id}/disable`, {});
  }
}
