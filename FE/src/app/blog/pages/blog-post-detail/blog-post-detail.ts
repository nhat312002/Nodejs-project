import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { BlogService, Post } from '../../services/blog';
import { finalize, switchMap } from 'rxjs';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

interface PostState {
  post: Post | null;
  loading: boolean;
  error: string | null;
}
@Component({
  selector: 'app-blog-post-detail',
  imports: [CommonModule,
    RouterModule, ],
  templateUrl: './blog-post-detail.html',
  styleUrl: './blog-post-detail.css',
})
export class BlogPostDetail implements OnInit{
  private route = inject(ActivatedRoute);

  private readonly blogService = inject(BlogService);

  // 1. Sử dụng một signal duy nhất để quản lý toàn bộ trạng thái của component
  private state = signal<PostState>({
    post: null,
    loading: true,
    error: null,
  });

  // 2. Sử dụng computed() để dẫn xuất các trạng thái public (read-only)
  // Điều này giúp template luôn đồng bộ và ngăn chặn việc thay đổi trạng thái từ bên ngoài
  public readonly post = computed(() => this.state().post);
  public readonly loading = computed(() => this.state().loading);
  public readonly error = computed(() => this.state().error);

  ngOnInit() {
    // Lắng nghe thay đổi trên URL (đề phòng trường hợp click bài khác ngay trong trang chi tiết)
    this.route.paramMap.pipe(
      // Lấy id từ URL, switchMap sẽ hủy request cũ nếu id thay đổi nhanh
      switchMap(params => {
        const id = params.get('id');
        this.state.set({ post: null, loading: true, error: null }); // Reset state

        if (!id) throw new Error('Không tìm thấy ID bài viết');

        return this.blogService.getPostById(id).pipe(
           // Tắt loading khi xong (dù lỗi hay thành công)
           finalize(() => this.state.update(s => ({ ...s, loading: false })))
        );
      })
    ).subscribe({
      next: (response) => {
        // Tùy vào cấu trúc API backend trả về mà bạn lấy data cho đúng
        // Ví dụ backend trả về { data: { ...post } } hoặc trả về trực tiếp post
        const postData = response.data;

        this.state.update(s => ({ ...s, post: postData.post }));
      },
      error: (err) => {
        console.error(err);
        this.state.update(s => ({ ...s, error: 'Không thể tải nội dung bài viết.' }));
      }
    });
  }
}
