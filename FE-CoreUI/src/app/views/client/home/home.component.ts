import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import { PostService } from '../../../core/services/post.service';
import { CategoryService } from '../../../core/services/category.service';
import { Post } from '../../../core/models/post.model';
import { Category } from '../../../core/models/category.model';
import { PostCardComponent } from '../../../shared/components/post-card/post-card.component';
import { ImgUrlPipe } from '../../../shared/pipes/img-url.pipe';

@Component({
  selector: 'app-home',
  imports: [CommonModule, RouterLink, PostCardComponent, ImgUrlPipe],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
  private postService = inject(PostService);
  private categoryService = inject(CategoryService);
  // private langService = inject(LanguageService); <--- TẠM BỎ

  // --- SIGNALS ---
  heroPost = signal<Post | null>(null);
  latestPosts = signal<Post[]>([]);
  categorySections = signal<{ category: Category, posts: Post[] }[]>([]);
  otherPosts = signal<Post[]>([]);

  ngOnInit() {
    // Gọi hàm load dữ liệu ngay lập tức
    this.loadData();
  }

  loadData() {
    // 1. LẤY BÀI MỚI NHẤT (Không truyền locale nữa)
    // Lấy 5 bài: 1 Hero + 4 Grid
    this.postService.getPublicPosts({ limit: 5 }).subscribe(res => {
      if (res.success && res.data.posts.length > 0) {
        const posts = res.data.posts;
        this.heroPost.set(posts[0]);
        this.latestPosts.set(posts.slice(1));
      }
    });

    // 2. LẤY BÀI VIẾT THEO DANH MỤC NỔI BẬT
    // (Tạm thời lấy danh mục tiếng Anh hoặc lấy tất cả danh mục)
    this.categoryService.getPublicCategories().subscribe(catRes => {
      if (catRes.success) {
        const topCats = catRes.data.categories.slice(0, 3); // Lấy 3 danh mục đầu

        topCats.forEach(cat => {
          // Lấy bài viết của danh mục này (Không lọc ngôn ngữ)
          this.postService.getPublicPosts({ limit: 4, categoryIds: [cat.id] })
            .subscribe(pRes => {
              if (pRes.data.posts.length > 0) {
                this.categorySections.update(curr => [
                  ...curr,
                  { category: cat, posts: pRes.data.posts }
                ]);
              }
            });
        });
      }
    });

    // 3. LẤY BÀI VIẾT KHÁC ("Other")
    this.postService.getPublicPosts({ limit: 4, categoryIds: 'other' }).subscribe(res => {
      if(res.success) this.otherPosts.set(res.data.posts);
    });
  }
}
