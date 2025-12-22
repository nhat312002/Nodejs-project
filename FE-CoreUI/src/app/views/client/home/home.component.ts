import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import { PostService } from '../../../core/services/post.service';
import { CategoryService } from '../../../core/services/category.service';
import { Post } from '../../../core/models/post.model';
import { Category } from '../../../core/models/category.model';
import { PostCardComponent } from '../../../shared/components/post-card/post-card.component';
import { ImgUrlPipe } from '../../../shared/pipes/img-url.pipe';
import { catchError, forkJoin, map, of, switchMap } from 'rxjs';

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

    // 3. CATEGORY SECTIONS (The ForkJoin Logic)
    this.categoryService.getPublicCategories(1, 100).pipe(
      // Switch from the Category Request to the Posts Request
      switchMap(catRes => {
        if (!catRes.success || !catRes.data.categories.length) {
          return of([]); // Return empty if no categories
        }

        const topCats = catRes.data.categories.slice(0, 5); // Limit to top 5 to save bandwidth

        // Create an array of HTTP Observables
        const requests = topCats.map(cat =>
          this.postService.getPublicPosts({ limit: 4, categoryIds: [cat.id] }).pipe(
            // A. Map success response to a convenient object
            map(postRes => ({
              category: cat,
              posts: postRes.data.posts
            })),

            // B. HANDLE ERROR PER REQUEST
            // If fetching "Tech" fails, we return NULL.
            // This prevents forkJoin from crashing the whole page.
            catchError(err => {
              console.error(`Failed to load posts for category ${cat.name}`, err);
              return of(null);
            })
          )
        );

        // Execute all requests in parallel
        return forkJoin(requests);
      })
    ).subscribe({
      next: (results) => {
        // 'results' is an array: [{category, posts}, null, {category, posts}...]

        // Filter out nulls (errors) and empty lists
        // Force type casting if TS complains about null check
        const validSections = results
          .filter((item): item is { category: Category, posts: Post[] } =>
             item !== null && item.posts.length > 0
          );

        // Update the signal ONCE (No UI flickering)
        this.categorySections.set(validSections);
      },
      error: (err) => console.error('Failed to load category list', err)
    });

    this.postService.getPublicPosts({ limit: 4, categoryIds: 'other' }).subscribe(res => {
      if(res.success) this.otherPosts.set(res.data.posts);
    });
  }
}
