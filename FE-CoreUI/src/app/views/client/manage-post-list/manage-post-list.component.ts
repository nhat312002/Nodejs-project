import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

// CoreUI
import {
  CardModule, FormModule, ButtonDirective, SpinnerModule,
  DropdownModule, BadgeModule,
  GridModule
} from '@coreui/angular';
import { IconDirective } from '@coreui/icons-angular';

// App
import { PostService } from '../../../core/services/post.service';
import { Post } from '../../../core/models/post.model';
import { PostCardComponent } from '../../../shared/components/post-card/post-card.component';
import { CustomPaginationComponent } from '../../../shared/components/custom-pagination/custom-pagination.component';
import { ConfirmService } from '../../../core/services/confirm.service';

@Component({
  selector: 'app-manage-post-list',
  standalone: true,
  imports: [
    CommonModule, FormsModule, RouterLink,
    CardModule, FormModule, ButtonDirective, SpinnerModule, DropdownModule, BadgeModule, IconDirective, GridModule,
    PostCardComponent, CustomPaginationComponent
  ],
  templateUrl: './manage-post-list.component.html',
})
export class ManagePostListComponent implements OnInit {
  private postService = inject(PostService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private confirmService = inject(ConfirmService);
  // Data
  posts = signal<Post[]>([]);
  isLoading = signal(false);

  // Pagination
  currentPage = signal(1);
  totalPages = signal(0);
  pageSize = signal(10);

  // Filters
  // Default to '1' (Pending) because that is what mods need to work on first
  statusFilter = signal('1');
  searchQuery = signal('');

  ngOnInit() {
    this.route.queryParamMap.subscribe(params => {
      this.searchQuery.set(params.get('search') || '');
      this.currentPage.set(Number(params.get('page')) || 1);
      this.pageSize.set(Number(params.get('limit')) || 10);

      // if (params.has('status'))
        this.statusFilter.set(params.get('status') || '');

      this.loadData();
    })
  }

  loadData() {
    this.isLoading.set(true);

    let query : any = {
      page: this.currentPage(),
      limit: this.pageSize(),
      sort: 'date_desc'
    };

    if (this.statusFilter()) query.status = this.statusFilter();
    if (this.searchQuery()) query.text = this.searchQuery();

    this.postService.getAdminPosts(query).subscribe({
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

  updateQueryParams(resetPage: boolean = false){
    const page = resetPage ? 1: this.currentPage();

    const queryParams: any = {
      search: this.searchQuery() || null,
      status: this.statusFilter() || null,
      page: page > 1 ? page : null,
      limit: this.pageSize(),
    };

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: queryParams,
      queryParamsHandling: 'merge'
    });
  }
  // Approve (2) or Reject (3)
  async updateStatus(post: Post, newStatus: string, event: Event) {
    // 1. STOP EVERYTHING IMMEDIATELY
    event.stopPropagation(); // Don't bubble to the card
    event.preventDefault();  // Don't trigger any browser link actions

    // 2. Now show the blocking confirm dialog
    const action = newStatus === '2' ? 'Approve' : 'Reject';
    const isConfirmed = await this.confirmService.ask({
      title: `${action} Post?`,
      message: `Are you sure you want to ${action} the post "${post.title}"?`,
      confirmText: action,
      color: action == 'Approve' ? 'success' : 'danger',
    });

    if (!isConfirmed) return;

    this.postService.updateStatus(post.id, newStatus).subscribe({
      next: () => {
        this.loadData();
      },
      error: (err) => {
        this.confirmService.alert({
          title: 'Error',
          message: err.error?.message || `Failed to ${action} post.`,
          color: 'danger'
        });
      }
    });
  }

  onFilterChange() {
    this.updateQueryParams(true);
  }

  onPageChange(page: number) {
    this.currentPage.set(page);
    this.updateQueryParams(false);
  }

  onPageSizeChange(newSize: number) {
    this.pageSize.set(newSize);
    this.updateQueryParams(true); // Reset to page 1 when changing size
  }
}
