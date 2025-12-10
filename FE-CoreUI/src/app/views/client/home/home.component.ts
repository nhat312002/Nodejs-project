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
    this.postService.getPublicPosts({ limit: 5 }).subscribe(res => {
      if (res.success && res.data.posts.length > 0) {
        const posts = res.data.posts;
        this.heroPost.set(posts[0]);
        this.latestPosts.set(posts.slice(1));
      }
    });

    this.categoryService.getPublicCategories(1, 100).subscribe(catRes => {
      if (catRes.success) {
        const topCats = catRes.data.categories.slice(0, 100); // Lấy 3 danh mục đầu

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

    this.postService.getPublicPosts({ limit: 4, categoryIds: 'other' }).subscribe(res => {
      if(res.success) this.otherPosts.set(res.data.posts);
    });
  }
}
