import { Component, OnInit, inject, signal, effect, untracked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { combineLatest } from 'rxjs';

// CoreUI
import {
  CardModule, FormModule, ButtonDirective, SpinnerModule,
  DropdownModule, BadgeModule,
  GridModule
} from '@coreui/angular';
import { IconDirective } from '@coreui/icons-angular';

// App Imports
import { PostService } from '../../../core/services/post.service';
import { LanguageService } from '../../../core/services/language.service';
import { Post } from '../../../core/models/post.model';
import { PostCardComponent } from '../../../shared/components/post-card/post-card.component';
import { CustomPaginationComponent } from '../../../shared/components/custom-pagination/custom-pagination.component';
import { ConfirmService } from 'src/app/core/services/confirm.service';

@Component({
  selector: 'app-my-post-list', // Singular Selector
  standalone: true,
  imports: [
    CommonModule, FormsModule, RouterLink,
    CardModule, FormModule, ButtonDirective, SpinnerModule, DropdownModule, BadgeModule, IconDirective,
    PostCardComponent, CustomPaginationComponent, GridModule
  ],
  templateUrl: './my-post-list.component.html'
})
export class MyPostListComponent implements OnInit { // Singular Class Name
  private postService = inject(PostService);
  private langService = inject(LanguageService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private confirmService = inject(ConfirmService);

  // Data
  posts = signal<Post[]>([]);

  // Pagination
  currentPage = signal(1);
  totalPages = signal(0);
  pageSize = signal(10);
  isLoading = signal(false);

  // Filters
  searchQuery = signal('');
  statusFilter = signal(''); // ''=All, '1'=Pending, '2'=Approved, '3'=Rejected

  constructor() {
    // Reload when language changes
    effect(() => {
      // const lang = this.langService.currentLang();
      // if(lang) untracked(() => this.loadData(lang.locale));
    });
  }

  ngOnInit() {
    // Sync with URL params
    combineLatest([this.route.queryParamMap]).subscribe(([queryParams]) => {
      this.searchQuery.set(queryParams.get('text') || '');
      this.statusFilter.set(queryParams.get('status') || '');
      this.currentPage.set(Number(queryParams.get('page')) || 1);

      // const locale = this.langService.currentLang()?.locale || 'en';
      this.loadData();
    });
  }

  loadData(locale: string = "en") {
    this.isLoading.set(true);

    let query : any = {
      page: this.currentPage(),
      limit: this.pageSize(),
      // locale: locale,
      // text: this.searchQuery(),
      // status: this.statusFilter(),
      sort: 'date_desc'
    };

    if (this.searchQuery()) {
      query.text = this.searchQuery();
    }

    if (this.statusFilter()) {
      query.status = this.statusFilter();
    }

    this.postService.getOwnPosts(query).subscribe({
      next: (res) => {
        if (res.success) {
          this.posts.set(res.data.posts);
          this.totalPages.set(res.data.pagination.totalPages);
        }
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  // --- ACTIONS ---

  onFilterChange() {
    this.updateQueryParams(true);
  }

  onPageChange(page: number) {
    this.currentPage.set(page);
    this.updateQueryParams(false);
  }

  async deletePost(postId: number) {
     const isConfirmed = await this.confirmService.ask({
      title: 'Delete Post?',
      message: 'This action cannot be undone. Are you sure?',
      confirmText: 'Delete',
      color: 'danger' // Makes the button red
    });

    if (!isConfirmed) return; // Stop if user clicked Cancel


    this.postService.delete(postId).subscribe({
      next: () => {
        // Optimistic Update: Remove from UI immediately
        this.posts.update(list => list.filter(p => p.id !== postId));

        // Reload if page becomes empty
        if (this.posts().length === 0 && this.currentPage() > 1) {
          this.onPageChange(this.currentPage() - 1);
        }
      },
      error: () => alert('Failed to delete post')
    });
  }

  updateQueryParams(resetPage: boolean = false) {
    const page = resetPage ? 1 : this.currentPage();
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        text: this.searchQuery() || null,
        status: this.statusFilter() || null,
        page: page > 1 ? page : null
      },
      queryParamsHandling: 'merge'
    });
  }
}
