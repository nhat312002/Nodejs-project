import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AvatarModule, BadgeModule, ButtonModule, CardModule, DropdownModule, FormModule, GridModule, ModalModule, PaginationModule, SharedModule, SpinnerModule, TableModule } from '@coreui/angular';
import { IconDirective } from '@coreui/icons-angular';
import { UserService } from '../../../core/services/user.service';
import { AuthService } from '../../../core/services/auth.service';
import { User } from '../../../core/models/user.model';
import { CustomPaginationComponent } from '../../../shared/components/custom-pagination/custom-pagination.component';
import { useModalCleanup } from '../../../shared/utils/modal-cleanup.util';
import { ActivatedRoute, Router } from '@angular/router';
import { combineLatest } from 'rxjs';
@Component({
  selector: 'app-users',
  imports: [
    CommonModule, FormsModule,
    TableModule, CardModule, ButtonModule, BadgeModule, PaginationModule,
    FormModule, GridModule, SpinnerModule, AvatarModule, ModalModule, IconDirective,
    DropdownModule, SharedModule,
    CustomPaginationComponent
  ],
  templateUrl: './users.component.html',
  styleUrl: './users.component.scss',
})
export class UsersComponent implements OnInit {
  private userService = inject(UserService);
  private authService = inject(AuthService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private modalCleanup = useModalCleanup();

  users = signal<User[]>([]);
  currentPage = signal<number>(1);
  limit = signal<number>(10);
  // pageSizes = [5, 10, 20];

  totalPages = signal<number>(0);

  isLoading = signal<boolean>(false);
  searchText = signal<string>('');

  currentUserId = signal<number | null>(null);

  confirmVisible = false;
  userToToggle: User | null = null;

  pagesArray = computed(() => Array(this.totalPages()).fill(0).map((x, i) => i + 1));

  roles = [
    { id: 1, name: 'User' },
    { id: 2, name: 'Moderator' },
    { id: 3, name: 'Admin' }
  ];

  ngOnInit(): void {
    const user = this.authService.currentUser();
    if (user) this.currentUserId.set(user.userId);
    combineLatest([this.route.queryParamMap]).subscribe(([params]) => {
      this.searchText.set(params.get('search') || '');
      this.currentPage.set(Number(params.get('page')) || 1);
      this.limit.set(Number(params.get('limit')) || 10);
      this.loadData();
    });
  }

  loadData(showSpinner = true) {
    if (showSpinner)
      this.isLoading.set(true);

    this.userService.getUsers(this.currentPage(), this.limit(), this.searchText()).subscribe({
      next: (res) => {
        if (res.success) {
          this.users.set(res.data.users);
          this.currentPage.set(res.data.pagination.currentPage);
          this.totalPages.set(res.data.pagination.totalPages);
        }
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  updateQueryParams(resetPage = false) {
    const page = resetPage ? 1 : this.currentPage();

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        search: this.searchText() || null,
        page: page > 1 ? page : null,
        limit: this.limit()
      },
      queryParamsHandling: 'merge'
    });
  }

  onSearch() {
    this.updateQueryParams(true); // Reset to page 1
  }

  onPageChange(page: number) {
    this.currentPage.set(page);
    this.updateQueryParams(false);
  }

  onPageSizeChange(newSize: number) {
    this.limit.set(newSize);
    this.updateQueryParams(true); // Reset to page 1
  }

  onRoleChange(user: User, event: any) {
    const newRoleId = Number(event.target.value);

    if (user.id === this.currentUserId() && newRoleId !== 3) {
      if (!confirm("Warning: You are removing your own Admin rights. Continue?")) {
        this.loadData();
        return;
      }
    }

    this.userService.update(user.id, { role_id: newRoleId }).subscribe({
      next: () => {
        this.users.update(list => list.map(u => u.id === user.id ? { ...u, role_id: newRoleId } : u));
      },
      error: () => {
        alert('Failed to update role');
        this.loadData();
      }
    });
  }

  initiateToggle(user: User) {
    if (user.id === this.currentUserId()) return;
    this.userToToggle = user;
    this.confirmVisible = true;
  }

  confirmToggle() {
    const user = this.userToToggle;
    if (!user) return;

    const newStatus = user.status == "0" ? "1" : "0";

    this.userService.update(user.id, { status: newStatus }).subscribe({
      next: () => {
        this.users.update(list => list.map(u => u.id === user.id ? { ...u, status: newStatus } : u));
        this.resetModal();
        this.loadData(false);
      },
      error: () => {
        alert('Failed to update status');
        this.resetModal();
        this.loadData();
      }
    });
  }

  resetModal() {
    this.confirmVisible = false;
    // this.userToToggle = null;
  }

}
