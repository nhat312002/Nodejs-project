import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { LanguageService } from '../../../core/services/language.service';
import { Language } from '../../../core/models/language.model';
import { CustomPaginationComponent } from '../../../shared/components/custom-pagination/custom-pagination.component';
import { NoWhitespaceValidator } from '../../../shared/validators/no-whitespace.validator';
import { useModalCleanup } from '../../../shared/utils/modal-cleanup.util';
import {
  TableModule, CardModule, ButtonModule, BadgeModule, FormModule,
  GridModule, ModalModule, SpinnerModule, AvatarModule
} from '@coreui/angular';
import { IconDirective } from '@coreui/icons-angular';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-languages',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, FormsModule,
    TableModule, CardModule, ButtonModule, BadgeModule, FormModule,
    GridModule, ModalModule, SpinnerModule, IconDirective, AvatarModule,
    CustomPaginationComponent
  ],
  templateUrl: './languages.component.html',
  styleUrl: './languages.component.scss'
})
export class LanguagesComponent implements OnInit {
  private languageService = inject(LanguageService);
  private fb = inject(FormBuilder);

  // Cleanup Utility
  private modalCleanup = useModalCleanup();

  // Signals
  languages = signal<Language[]>([]);
  currentPage = signal(1);
  totalPages = signal(0);
  pageSize = signal(10);
  isLoading = signal(false);
  searchText = signal('');
  backendError = signal('');

  // Form State
  visible = false;
  isEditMode = false;
  currentId: number | null = null;
  form: FormGroup;

  // File Upload State
  selectedFile: File | null = null;
  previewUrl: string | null = null; // For showing the image in modal

  constructor() {
    this.form = this.fb.group({
      name: ['', [Validators.required, NoWhitespaceValidator]],
      locale: ['', [Validators.required, NoWhitespaceValidator, Validators.pattern(/^[a-z]{2}(-[A-Z]{2})?$/)]], // Regex for 'en' or 'en-US'
      is_active: [true]
    });
  }

  ngOnInit() { this.loadData(); }

  loadData(showSpinner = true) {
    if (showSpinner)
      this.isLoading.set(true);

    this.languageService.getAll(this.currentPage(), this.pageSize(), this.searchText()).subscribe({
      next: (res) => {
        if (res.success) {
          this.languages.set(res.data.languages);
          this.currentPage.set(res.data.pagination.currentPage);
          this.totalPages.set(res.data.pagination.totalPages);
        }
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  // --- ACTIONS ---

  onSearch() {
    this.currentPage.set(1);
    this.loadData();
  }

  onPageChange(p: number) { this.currentPage.set(p); this.loadData(); }
  onPageSizeChange(s: number) { this.pageSize.set(s); this.loadData(); }

  // --- MODAL LOGIC ---

  openModal(lang?: Language) {
    this.visible = true;
    this.backendError.set('');
    this.selectedFile = null;
    this.previewUrl = null;

    // Reset form values
    this.form.reset({ is_active: true });

    if (lang) {
      this.isEditMode = true;
      this.currentId = lang.id;

      this.form.patchValue({
        name: lang.name,
        locale: lang.locale,
        is_active: lang.status == '1'
      });
      // Show existing flag as preview
      this.previewUrl = lang.url_flag;
    } else {
      this.isEditMode = false;
      this.currentId = null;
    }

    // Force pristine state for UI logic
    setTimeout(() => this.form.markAsPristine(), 0);
  }

  // Handle File Selection
  onFileSelect(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      this.form.markAsDirty(); // Manually mark dirty so Save enables

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => this.previewUrl = e.target?.result as string;
      reader.readAsDataURL(file);
    }
  }

  save() {
    if (this.form.invalid) return;

    // 1. Prepare FormData
    const formData = new FormData();
    formData.append('name', this.form.value.name.trim());
    formData.append('locale', this.form.value.locale.trim());
    formData.append('status', this.form.value.is_active ? '1' : '0');

    // Only append file if user picked a new one
    if (this.selectedFile) {
      formData.append('url_flag', this.selectedFile); // Key must match backend (e.g., upload.single('flag'))
    }

    // 2. Send Request
    const req$ = (this.isEditMode && this.currentId)
      ? this.languageService.update(this.currentId, formData)
      : this.languageService.create(formData);

    req$.subscribe({
      next: () => {
        this.closeModal();
        if (!this.isEditMode) {
          this.currentPage.set(1);
          this.loadData();
        } else this.loadData(false);
      },
      error: (err) => {
        if (err.status === 401 || err.status === 403) return;

        if (err.status === 422 || err.status === 400 || err.status === 500) {
          const msg = err.error?.data?.[0] || err.error?.message || 'Validation Error';
          this.backendError.set(msg);
        } else {
          alert('Server Error');
        }
      }
    });
  }

  // Modal Cleanup
  handleVisibleChange(isVisible: boolean) {
    this.visible = isVisible;
  }
  closeModal() {
    this.handleVisibleChange(false);
  }

  onInputChange() {
    if (this.backendError()) this.backendError.set('');
  }

  getFlagIcon(locale: string): string {
    if (!locale) return 'cifUn'; // Fallback

    try {
      // 1. Use the browser's native API to parse the locale
      // 'maximize()' adds the missing pieces (e.g., "en" -> "en-Latn-US")
      const localeData = new Intl.Locale(locale).maximize();

      // 2. Extract the region (e.g., "US", "JP", "CN")
      let region = localeData.region;

      // 3. Fallback logic if region is still missing (rare)
      if (!region) return 'cifUn';

      // 4. Convert to CoreUI format: "US" -> "Us" -> "cifUs"
      const titleCase = region.charAt(0).toUpperCase() + region.slice(1).toLowerCase();

      return `cif${titleCase}`;
    } catch (e) {
      console.warn('Invalid locale code:', locale);
      return 'cifUn';
    }
  }

  getImageUrl(relativePath: string): string {
    if (!relativePath) return '';

    // Check if it's already a full URL (http...) or base64 (data:image)
    if (relativePath.startsWith('http') || relativePath.startsWith('data:')) {
      return relativePath;
    }

    const baseUrl = environment.apiUrl; // Or extract from environment
    return `${baseUrl}${relativePath}`;
  }
}
