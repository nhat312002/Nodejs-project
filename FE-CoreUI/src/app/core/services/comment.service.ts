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
}
