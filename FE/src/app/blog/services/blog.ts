import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResponse } from 'src/app/core/models/api-response';
import { Pagination } from 'src/app/core/models/pagination';

interface UserInfo {
  id: number;
  fullName: string;
}

interface LanguageInfo {
  id: number;
  name: string;
  locale: string;
}

interface Category {
  id: number;
  name: string;
}

export interface Post {
  id: number;
  title: string;
  body: string;
  userId: number;
  originalId: null | number;
  languageId: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  textRelevance: null | number;
  titleRelevance: null | number;
  userRelevance: null | number;
  user: UserInfo;
  language: LanguageInfo;
  categories: Category[];
}

export interface PostPagination {
  pagination: Pagination;
  posts: Post[];
}

export interface PostData {
  post: Post;
}

@Injectable({
  providedIn: 'root',
})
export class BlogService {
  readonly #http = inject(HttpClient);
  readonly #baseUrl = 'http://localhost:3000/posts';

  /**
   * Lấy danh sách các bài viết đã được phê duyệt, có phân trang và tìm kiếm.
   * @param page - Số trang hiện tại.
   * @param searchQuery - Từ khóa tìm kiếm (tùy chọn).
   * @returns Observable chứa kết quả API cho danh sách bài viết.
   */
  getApprovedPosts(
    page: number = 1,
    limit: number = 10,
    searchQuery = ''
  ): Observable<ApiResponse<PostPagination>> {
    // Sử dụng HttpParams để quản lý các tham số query một cách an toàn và hiệu quả
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (searchQuery.trim()) {
      params = params.set('text', searchQuery.trim());
    }

    return this.#http.get<ApiResponse<PostPagination>>(this.#baseUrl, { params });
  }

  getPostById(id: string): Observable<ApiResponse<PostData>> {
    return this.#http.get<ApiResponse<PostData>>(`${this.#baseUrl}/${id}`);
  }
}
