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
import { SpinnerComponent } from '@coreui/angular';

@Component({
  selector: 'app-home',
  imports: [CommonModule, RouterLink, PostCardComponent, ImgUrlPipe, SpinnerComponent],
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
  categoryCursor = signal<number | null>(null);
  hasMoreCategories = signal(false);
  isLoadingCategories = signal(false);
  otherPosts = signal<Post[]>([]);

  ngOnInit() {
    this.loadInitialData();
  }

  loadInitialData() {
    // 1. Hero & Latest (Independent)
    this.postService.getPublicPosts({ limit: 5 }).subscribe(res => {
      if (res.success && res.data.posts.length > 0) {
        this.heroPost.set(res.data.posts[0]);
        this.latestPosts.set(res.data.posts.slice(1));
      }
    });

    // 2. Start loading first batch of categories
    this.loadCategoryBatch();
  }

  /**
   * Loads a batch of categories using Cursor Pagination,
   * then uses forkJoin to fetch posts for them in parallel.
   */
  loadCategoryBatch() {
    if (this.isLoadingCategories()) return;

    this.isLoadingCategories.set(true);
    const cursor = this.categoryCursor();
    const LIMIT = 4; // Load 3 categories at a time

    this.categoryService.getPublicCategoriesCursor(cursor, LIMIT).pipe(
      // A. Got Categories? Now fetch their posts.
      switchMap(catRes => {
        // Validation: If API failed or empty
        if (!catRes.success || !catRes.data.categories.length) {
          return of({ sections: [], meta: catRes.data?.meta });
        }

        const categories = catRes.data.categories;
        const meta = catRes.data.meta; // Save meta for later

        // Create parallel requests
        const postRequests = categories.map((cat: Category) =>
          this.postService.getPublicPosts({ limit: 4, categoryIds: [cat.id] }).pipe(
            // Map successful post response to a Section Object
            map(postRes => ({
              category: cat,
              posts: postRes.data.posts
            })),
            // Handle error per category (don't crash the whole batch)
            catchError(err => {
              console.error(`Error loading posts for ${cat.name}`, err);
              return of(null);
            })
          )
        );

        // Execute all post requests
        return forkJoin(postRequests).pipe(
          map(results => ({
            sections: results, // Array of {category, posts} or null
            meta: meta
          }))
        );
      })
    ).subscribe({
      next: (result: any) => {
        // 1. Filter out failed requests or empty sections
        // Type guard: ensure item is not null and has posts
        const validSections = (result.sections || [])
          .filter((item: any) => item !== null && item.posts.length > 0);

        // 2. Append to existing list
        this.categorySections.update(current => [...current, ...validSections]);

        // 3. Update Pagination State
        if (result.meta) {
          this.categoryCursor.set(result.meta.nextCursor);
          this.hasMoreCategories.set(result.meta.hasMore);

          // 4. "Other Posts" Logic
          // Only load "Other" if there are NO MORE categories to show
          if (!result.meta.hasMore) {
            this.loadOtherPosts();
          }
        }

        this.isLoadingCategories.set(false);
      },
      error: (err) => {
        console.error('Category batch failed', err);
        this.isLoadingCategories.set(false);
      }
    });
  }

  loadOtherPosts() {
    this.postService.getPublicPosts({ limit: 4, categoryIds: 'other' }).subscribe(res => {
      if (res.success) this.otherPosts.set(res.data.posts);
    });
  }
}
