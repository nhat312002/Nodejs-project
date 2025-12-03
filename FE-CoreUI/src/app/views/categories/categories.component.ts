import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CategoryService } from '../../core/services/category.service';
import { Category } from '../../core/models/category.model';
import { CustomPaginationComponent } from '../../shared/components/custom-pagination/custom-pagination.component';
import {
  TableModule, CardModule, ButtonModule, BadgeModule, FormModule,
  GridModule, ModalModule, SpinnerModule
} from '@coreui/angular';
import { IconDirective } from '@coreui/icons-angular';
import { useModalCleanup } from '../../shared/utils/modal-cleanup.util';

@Component({
  selector: 'app-categories',
  imports: [
    CommonModule, ReactiveFormsModule, FormsModule,
    TableModule, CardModule, ButtonModule, BadgeModule, FormModule,
    GridModule, ModalModule, SpinnerModule, IconDirective,
    CustomPaginationComponent
  ],
  templateUrl: './categories.component.html',
  styleUrl: './categories.component.scss',
})
export class CategoriesComponent implements OnInit {
  private categoryService = inject(CategoryService);
  private fb = inject(FormBuilder);

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
      name: ['', [Validators.required, Validators.minLength(2)]],
      is_active: [true]
    });
  }

  ngOnInit() {
    this.loadData();
  }

  private modalCleanup = useModalCleanup();

  loadData() {
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

  onSearch() {
    this.currentPage.set(1);
    this.loadData();
  }

  onPageChange(page: number) {
    this.currentPage.set(page);
    this.loadData();
  }

  onPageSizeChange(pageSize: number) {
    this.pageSize.set(pageSize);
    this.loadData();
  }

  openModal(cat?: Category) {
    // 1. Show Modal & Clear Errors
    this.visible = true;
    this.backendError.set('');

    // 2. Reset Form (Clears Values, Touched, Dirty)
    // We set the default for 'is_active' here to ensure it's not null
    this.form.reset({ is_active: true });

    if (cat) {
      this.isEditMode = true;
      this.currentId = cat.id;
      // Patch values (this makes the form Dirty internally)
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
    // We wait 1 tick for the UI to update, then lock the form as "Clean"
    // This ensures the "Save" button starts disabled.
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
    const payload = {
      name: this.form.value.name,
      status: this.form.value.is_active ? '1' : '0'
    };

    const req$ = (this.isEditMode && this.currentId)
      ? this.categoryService.update(this.currentId, payload)
      : this.categoryService.create(payload);

    req$.subscribe({
      next: () => {
        this.visible = false;
        if (!this.isEditMode) this.currentPage.set(1);
        this.loadData();
      },
      error: (err) => {
        console.error(err);

        if (err.status === 401 || err.status === 403) {
          return;
        }

        if (err.status === 422 || err.status === 400) {
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
    // DELETE all the reset logic from here.
    // We let the form stay "dirty" while it fades out in the background.
  }

  closeModal() {
    this.visible = false;
  }


}
