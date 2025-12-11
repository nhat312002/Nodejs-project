import { Component, OnInit, inject, signal, effect, untracked, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';

// CoreUI
import {
  RowComponent, ColComponent, CardComponent, CardBodyComponent,
  FormModule, ButtonDirective, SpinnerModule, CollapseModule, CardModule,
  GridModule,
  DropdownModule
} from '@coreui/angular';
import { IconDirective } from '@coreui/icons-angular';

// Shared
import { PostService } from '../../../core/services/post.service';
import { CategoryService } from '../../../core/services/category.service';
import { LanguageService } from '../../../core/services/language.service';
import { Post } from '../../../core/models/post.model';
import { Category } from '../../../core/models/category.model';
import { PostCardComponent } from '../../../shared/components/post-card/post-card.component';
import { CustomPaginationComponent } from '../../../shared/components/custom-pagination/custom-pagination.component';
import { combineLatest } from 'rxjs';
@Component({
  selector: 'app-archive',
  imports: [
    CommonModule, FormsModule,
    CardComponent, CardBodyComponent, GridModule, FormModule, CardModule, DropdownModule,
    ButtonDirective, SpinnerModule, CollapseModule, IconDirective,
    PostCardComponent, CustomPaginationComponent
  ],
  templateUrl: './archive.component.html',
  styleUrl: './archive.component.scss',
})
export class ArchiveComponent implements OnInit {
  private postService = inject(PostService);
  private categoryService = inject(CategoryService);
  private langService = inject(LanguageService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  // --- DATA SIGNALS ---
  posts = signal<Post[]>([]);
  categories = signal<Category[]>([]);

  // Pagination
  currentPage = signal(1);
  totalPages = signal(0);
  pageSize = signal(10);
  isLoading = signal(false);

  // --- FILTER SIGNALS ---
  searchQuery = signal(''); // Searches title + body
  searchAuthor = signal(''); // Searches user name
  sortOrder = signal('date_desc');

  // Category Logic
  selectedCategoryIds = signal<(number | string)[]>([]); // Stores IDs or 'other'
  matchAllCategories = signal(false); // The toggle

  // Helper: Disable "Match All" if less than 2 categories selected
  canMatchAll = computed(() => {
    const ids = this.selectedCategoryIds();
    return ids.length > 1 && !ids.includes('other');
  });
  categoryButtonLabel = computed(() => {
    const count = this.selectedCategoryIds().length;
    if (count === 0) return 'All Categories';
    if (count === 1) {
      const id = this.selectedCategoryIds()[0];
      if (id === 'other') return 'Other';
      return this.categories().find(c => c.id === id)?.name || 'Selected';
    }
    return `Categories (${count})`;
  });

  // NEW SIGNAL: Track if we are in a specific category route
  isCategoryView = signal(false);

  // UPDATE TITLE HELPER
  pageTitle = computed(() => {
    if (this.isCategoryView()) {
      // Find name of the selected category (assuming ID is set in selectedCategoryIds)
      const id = this.selectedCategoryIds()[0];
      const cat = this.categories().find(c => c.id === id);
      return cat ? cat.name : 'Category';
    }
    return 'Archive';
  });


  constructor() {
    // Reload when Language changes
    effect(() => {
      untracked(() => {
        this.loadCategories();
        this.loadPosts();
      });
    });
  }

  ngOnInit() {
    // Load categories for the dropdown menu once
    this.loadCategories();

    // 1. LISTEN TO URL CHANGES (Path AND Query)
    // This is the source of truth. It handles Tabs, Back Button, and Reloads.
    combineLatest([
      this.route.paramMap,      // /category/:id
      this.route.queryParamMap  // ?text=abc&page=2
    ]).subscribe(([params, queryParams]) => {

      // A. DETERMINE CONTEXT & CATEGORY
      const catId = params.get('id');

      if (catId) {
        // --- CATEGORY TAB (/category/5) ---
        this.isCategoryView.set(true);
        this.selectedCategoryIds.set([Number(catId)]); // Lock to this category
        this.matchAllCategories.set(false);
      } else {
        // --- ARCHIVE TAB (/archive) ---
        this.isCategoryView.set(false);

        // Restore Categories from URL ?cat=1,2,other
        const catParam = queryParams.get('cat');
        if (catParam) {
          const ids = catParam.split(',').map(id => id === 'other' ? 'other' : Number(id));
          this.selectedCategoryIds.set(ids);
        } else {
          this.selectedCategoryIds.set([]);
        }

        // Restore Match All
        this.matchAllCategories.set(queryParams.get('matchAll') === 'true');
      }

      // B. RESTORE COMMON FILTERS
      // Defaults to '' or 1 if param is missing (Logic Reset)
      this.searchQuery.set(queryParams.get('text') || '');
      this.searchAuthor.set(queryParams.get('author') || '');
      this.sortOrder.set(queryParams.get('sort') || 'date_desc');
      this.currentPage.set(Number(queryParams.get('page')) || 1);

      // C. TRIGGER DATA LOAD

      this.loadPosts();
    });
  }

  // --- 2. THE "WRITE TO URL" HELPER ---
  updateQueryParams(resetPage: boolean = false) {
    const page = resetPage ? 1 : this.currentPage();

    // Build the object
    const queryParams: any = {
      text: this.searchQuery() || null,
      author: this.searchAuthor() || null,
      sort: this.sortOrder(),
      page: page > 1 ? page : null, // Hide page=1 to keep URL clean
    };

    // Only sync categories if we are in Archive view (not fixed category view)
    if (!this.isCategoryView()) {
      const cats = this.selectedCategoryIds();
      queryParams.cat = cats.length > 0 ? cats.join(',') : null;

      // Only sync matchAll if applicable
      queryParams.matchAll = (this.canMatchAll() && this.matchAllCategories()) ? 'true' : null;
    }

    // Navigate (This triggers the subscription in ngOnInit)
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: queryParams,
      queryParamsHandling: 'merge', // Keep other params if any
    });
  }

  // --- 3. UPDATED ACTIONS ---
  // These now update the URL instead of loading data directly


  // 1. Load Categories for the Sidebar
  loadCategories() {
    this.categoryService.getPublicCategories(1, 100).subscribe(res => {
      if (res.success) {
        this.categories.set(res.data.categories);
      }
    });
  }

  // 2. Load Posts
  loadPosts(locale: string = "en") {
    this.isLoading.set(true);

    const params: any = {
      page: this.currentPage(),
      limit: this.pageSize(),
      locale: locale,
      sort: this.sortOrder(),
      categoryIds: this.selectedCategoryIds(), // Pass the array
      categoryMatchAll: this.matchAllCategories()
    };

    if (this.searchQuery().trim()) params.text = this.searchQuery().trim();
    if (this.searchAuthor().trim()) params.userFullName = this.searchAuthor().trim();

    this.postService.getPublicPosts(params).subscribe({
      next: (res) => {
        if (res.success) {
          this.posts.set(res.data.posts);
          this.currentPage.set(res.data.pagination.currentPage);
          this.totalPages.set(res.data.pagination.totalPages);
        }
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  // --- ACTIONS ---

  // Triggered by Search/Sort inputs
  onFilterChange() {
    this.updateQueryParams(true);
  }

  // Triggered by Pagination
  onPageChange(page: number) {
    this.currentPage.set(page);
    this.updateQueryParams(false);
  }

  // Triggered by Category Checkbox
  toggleCategory(id: number | string) {
    this.selectedCategoryIds.update(currentIds => {

      // SCENARIO 1: User clicked "Uncategorized" ('other')
      if (id === 'other') {
        // If it is already selected -> Deselect it (Clear all)
        if (currentIds.includes('other')) {
          return [];
        }
        // If it is NOT selected -> Select it AND Clear all numbers
        return ['other'];
      }

      // SCENARIO 2: User clicked a specific Number ID
      else {
        // If "Uncategorized" is currently selected, clear it first!
        if (currentIds.includes('other')) {
          return [id]; // Start fresh with just this number
        }

        // Standard Toggle Logic (Add/Remove)
        if (currentIds.includes(id)) {
          return currentIds.filter(i => i !== id);
        } else {
          return [...currentIds, id];
        }
      }
    });

    // --- SAFETY CHECKS ---
    const newIds = this.selectedCategoryIds();

    // 1. "Match All" is impossible if 'other' is selected
    if (newIds.includes('other')) {
      this.matchAllCategories.set(false);
    }
    // 2. "Match All" requires at least 2 items
    else if (newIds.length < 2) {
      this.matchAllCategories.set(false);
    }

    // Trigger Reload
    this.onFilterChange();
  }

  // Helper to check if checkbox is checked
  isCategorySelected(id: number | string): boolean {
    return this.selectedCategoryIds().includes(id);
  }

  resetFilters() {
    this.searchQuery.set('');
    this.searchAuthor.set('');
    this.selectedCategoryIds.set([]);
    this.matchAllCategories.set(false);
    this.sortOrder.set('date_desc');
    this.onFilterChange();
  }
}
