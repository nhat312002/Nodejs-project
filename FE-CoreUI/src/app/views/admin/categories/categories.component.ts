import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CategoryService } from '../../../core/services/category.service';
import { Category } from '../../../core/models/category.model';
import { CustomPaginationComponent } from '../../../shared/components/custom-pagination/custom-pagination.component';
import {
  TableModule, CardModule, ButtonModule, BadgeModule, FormModule,
  GridModule, ModalModule, SpinnerModule,
  DropdownModule
} from '@coreui/angular';
import { IconDirective } from '@coreui/icons-angular';
import { useModalCleanup } from '../../../shared/utils/modal-cleanup.util';
import { NoWhitespaceValidator } from '../../../shared/validators/no-whitespace.validator';
import { ActivatedRoute, Router } from '@angular/router';
import { combineLatest } from 'rxjs';
import { AppValidators } from '../../../shared/utils/validator.util';
import { capitalize } from '../../../shared/utils/string.util';

@Component({
  selector: 'app-categories',
  imports: [
    CommonModule, ReactiveFormsModule, FormsModule,
    TableModule, CardModule, ButtonModule, BadgeModule, FormModule,
    GridModule, ModalModule, SpinnerModule, IconDirective, DropdownModule,
    CustomPaginationComponent
  ],
  templateUrl: './categories.component.html',
  styleUrl: './categories.component.scss',
})
export class CategoriesComponent implements OnInit {
  private categoryService = inject(CategoryService);
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  private modalCleanup = useModalCleanup();

  backendError = signal<string>('');
  categories = signal<Category[]>([]);
  currentPage = signal(1);
  totalPages = signal(0);
  pageSize = signal(10);
  isLoading = signal(false);
  searchText = signal('');

  visible = false;
  isEditMode = false;
  currentId: number | null = null;
  form: FormGroup;

  constructor() {
    this.form = this.fb.group({
      name: ['', AppValidators.categoryName],
      is_active: [true]
    });
  }

  ngOnInit() {
    combineLatest([this.route.queryParamMap]).subscribe(([params])=> {
      this.searchText.set(params.get('search') || '');

      this.currentPage.set(Number(params.get('page')) || 1);
      this.pageSize.set(Number(params.get('limit')) || 10);
      this.loadData();
    });
  }

  loadData(showSpinner = true) {
    if (showSpinner)
      this.isLoading.set(true);

    this.categoryService.getCategories(this.currentPage(), this.pageSize(), this.searchText()).subscribe({
      next: (res) => {
        if (res.success) {
          this.categories.set(res.data.categories);
          this.currentPage.set(res.data.pagination.currentPage);
          this.totalPages.set(res.data.pagination.totalPages);
        }
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  updateQueryParams(resetPage = false){
    const page = resetPage ? 1 : this.currentPage();

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        search: this.searchText() || null,
        page: page,
        limit: this.pageSize()
      },
      queryParamsHandling: 'merge'
    })
  }

  onSearch() {
    this.updateQueryParams(true);
  }

  onPageChange(page: number) {
    this.currentPage.set(page);
    this.updateQueryParams(false);
  }

  onPageSizeChange(pageSize: number) {
    this.pageSize.set(pageSize);
    this.updateQueryParams(true);
  }

  openModal(cat?: Category) {
    this.visible = true;
    this.backendError.set('');
    this.form.reset({ is_active: true });

    if (cat) {
      this.isEditMode = true;
      this.currentId = cat.id;
      this.form.patchValue({
        name: cat.name,
        is_active: cat.status == '1'
      });
    } else {
      this.isEditMode = false;
      this.currentId = null;
      // Form is already reset to empty name + true status above
    }

    // 3. FORCE PRISTINE
    setTimeout(() => {
      this.form.markAsPristine();
    }, 0);
  }

  onInputChange() {
    if (this.backendError()){
      this.backendError.set('');
    }
  }

  save() {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;
    const rawName = this.form.value.name;
    const cleanName = rawName ? capitalize(rawName.trim()) : '';

    const payload = {
      name: cleanName,
      status: this.form.value.is_active ? '1' : '0'
    };

    this.form.patchValue({ name: cleanName });

    const req$ = (this.isEditMode && this.currentId)
      ? this.categoryService.update(this.currentId, payload)
      : this.categoryService.create(payload);

    req$.subscribe({
      next: () => {
        this.visible = false;
        if (!this.isEditMode) {
          this.currentPage.set(1);
          this.loadData();
        } else this.loadData(false);
      },
      error: (err) => {
        console.error(err);

        if (err.status === 401 || err.status === 403) {
          return;
        }

        if (err.status === 422 || err.status === 400 || err.status === 500) {
           const msg = err.error?.data?.[0] || err.error?.message || 'Validation Error';
           this.backendError.set(msg);
        } else {
           alert('An unexpected error occurred');
        }
      }
    })
  }

  handleVisibleChange(isVisible: boolean) {
    this.visible = isVisible;
  }

  closeModal() {
    this.visible = false;
  }


}
