import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common'; // Cần cho các pipe như 'date', 'slice'
import { finalize } from 'rxjs';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';

import { BlogService as BlogService } from '../../services/blog';
import { Post } from '../../services/blog';
import { PostItem } from '../post-item/post-item';
import { Topbar } from '../topbar/topbar';

// Định nghĩa một interface cho trạng thái của component
interface PostState {
  posts: Post[];
  total: number;
  loading: boolean;
  error: string | null;
}
@Component({
  selector: 'app-blog-post-list',
  imports: [CommonModule, PostItem, Topbar, MatPaginatorModule],
  templateUrl: './blog-post-list.html',
  styleUrl: './blog-post-list.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BlogPostList implements OnInit {
  private readonly blogService = inject(BlogService);

  // 1. Sử dụng một signal duy nhất để quản lý toàn bộ trạng thái của component
  private state = signal<PostState>({
    posts: [],
    total: 0,
    loading: true,
    error: null,
  });

  readonly pageIndex = signal(0);
  readonly pageSize = signal(10);
  // 2. Sử dụng computed() để dẫn xuất các trạng thái public (read-only)
  // Điều này giúp template luôn đồng bộ và ngăn chặn việc thay đổi trạng thái từ bên ngoài
  public readonly posts = computed(() => this.state().posts);
  public readonly total = computed(() => this.state().total);
  public readonly loading = computed(() => this.state().loading);
  public readonly error = computed(() => this.state().error);

  ngOnInit(): void {
    this.loadPosts();
  }

  loadPosts() {
    this.state.update(s => ({ ...s, loading: true, error: null }));

    const apiPage = this.pageIndex() + 1;
    const apiLimit = this.pageSize();

    this.blogService
      .getApprovedPosts(apiPage, apiLimit)
      .pipe(
        finalize(() => this.state.update((s) => ({ ...s, loading: false })))
      )
      .subscribe({
        next: (response) => {
          if (response.success && response.data) {
            this.state.update((s) => ({
              ...s,
              posts: response.data.posts,
              total: response.data.pagination.totalRecords
            }));
          }
        },
        error: (err) => {
          console.error('Error fetching posts:', err);
          this.state.update((s) => ({
            ...s,
            error: 'Không thể tải danh sách bài viết. Vui lòng thử lại sau.',
          }));
        },
      });
  }

  onPageChange(e: PageEvent) {
    this.pageIndex.set(e.pageIndex);
    this.pageSize.set(e.pageSize);

    this.loadPosts();
    window.scrollTo({top: 0, behavior: 'smooth'});
  }
}
