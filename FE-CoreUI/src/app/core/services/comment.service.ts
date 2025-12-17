import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api.model';
import { Comment } from '../models/comment.model';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class CommentService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  getCommentsByPost(postId: number | string): Observable<ApiResponse<{ comments: Comment[] }>> {
    return this.http.get<ApiResponse<{ comments: Comment[] }>>(`${this.apiUrl}/comments`, {
      params: { postId, limit: 50 } // Fetch enough comments
    });
  }

  createComment(postId: number, content: string, parentId: number | null = null): Observable<ApiResponse<any>> {
    let params: any = {
      postId,
      content
    };

    if (parentId) params.parentId = parentId;
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/comments`, params);
  }

  updateComment(commentId: number, content: string): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(`${this.apiUrl}/comments/${commentId}`, {
      content: content
    });
  }

  deleteComment(commentId: number): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.apiUrl}/comments/${commentId}`);
  }
}
