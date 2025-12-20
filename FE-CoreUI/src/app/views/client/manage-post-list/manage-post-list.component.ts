import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

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

@Component({
  selector: 'app-manage-post-list',
  standalone: true,
  imports: [
    CommonModule, FormsModule, RouterLink,
    CardModule, FormModule, ButtonDirective, SpinnerModule, DropdownModule, BadgeModule, IconDirective, GridModule,
    PostCardComponent, CustomPaginationComponent
  ],
  templateUrl: './manage-post-list.component.html'
})
export class ManagePostListComponent implements OnInit {
  private postService = inject(PostService);

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
    this.loadData();
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

  // Approve (2) or Reject (3)
  updateStatus(post: Post, newStatus: string, event: Event) {
    // 1. STOP EVERYTHING IMMEDIATELY
    event.stopPropagation(); // Don't bubble to the card
    event.preventDefault();  // Don't trigger any browser link actions

    // 2. Now show the blocking confirm dialog
    const action = newStatus === '2' ? 'Approve' : 'Reject';
    if (!confirm(`Are you sure you want to ${action} this post?`)) return;

    this.postService.updateStatus(post.id, newStatus).subscribe({
      next: () => {
        this.loadData();
      },
      error: () => alert(`Failed to ${action} post`)
    });
  }

  onFilterChange() {
    this.currentPage.set(1);
    this.loadData();
  }

  onPageChange(page: number) {
    this.currentPage.set(page);
    this.loadData();
  }
}
