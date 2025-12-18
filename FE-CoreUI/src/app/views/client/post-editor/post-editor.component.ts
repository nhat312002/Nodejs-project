import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { EditorComponent, TINYMCE_SCRIPT_SRC } from '@tinymce/tinymce-angular'; // TinyMCE

// CoreUI
import {
  CardModule, FormModule, ButtonDirective, SpinnerModule,
  GridModule, DropdownModule, BadgeModule
} from '@coreui/angular';
import { IconDirective } from '@coreui/icons-angular';

// App
import { PostService } from '../../../core/services/post.service';
import { Category } from '../../../core/models/category.model';
import { CategoryService } from '../../../core/services/category.service';
import { LanguageService, Language } from '../../../core/services/language.service';
import { environment } from '../../../../environments/environment';
import { ImgUrlPipe } from '../../../shared/pipes/img-url.pipe';

@Component({
  selector: 'app-post-editor',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, RouterLink, EditorComponent,
    CardModule, FormModule, ButtonDirective, SpinnerModule, GridModule, DropdownModule, BadgeModule,
    ImgUrlPipe
  ],
  templateUrl: './post-editor.component.html',
  styleUrl: './post-editor.component.scss',
  providers: [
    { provide: TINYMCE_SCRIPT_SRC, useValue: 'tinymce/tinymce.min.js' }
  ]
})
export class PostEditorComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private postService = inject(PostService);
  private categoryService = inject(CategoryService);
  private langService = inject(LanguageService);

  // --- STATE ---
  form: FormGroup;
  isEditMode = signal(false);
  postId: number | null = null;

  isLoading = signal(false);
  isSubmitting = signal(false);

  // Data for Dropdowns
  categories = signal<Category[]>([]);
  languages = signal<Language[]>([]);

  // Cover Image
  selectedFile: File | null = null;
  previewUrl: string | null = null;

  // --- HELPER FOR CATEGORY BUTTON ---
  selectedCatIds = signal<number[]>([]); // Tracks selection for UI

  categoryLabel = computed(() => {
    const ids = this.selectedCatIds();
    if (ids.length === 0) return 'Select Categories';

    // Find names
    const names = this.categories()
      .filter(c => ids.includes(c.id))
      .map(c => c.name);

    if (names.length <= 2) return names.join(', ');
    return `${names.slice(0, 2).join(', ')} (+${names.length - 2})`;
  });

  // --- TINYMCE CONFIG ---
  editorConfig = {
    base_url: '/tinymce',
    suffix: '.min',
    height: 600,
    menubar: false,
    plugins: 'image link lists media table wordcount',
    toolbar: 'undo redo | blocks | bold italic | alignleft aligncenter alignright | bullist numlist | image link',
    images_upload_handler: (blobInfo: any) => new Promise<string>((resolve, reject) => {
      const formData = new FormData();
      formData.append('file', blobInfo.blob(), blobInfo.filename());
      // Assuming your http client is injected as 'http' (not shown here but needed)
      // For brevity using fetch:
      fetch(`${environment.apiUrl}/media/upload`, {
        method: 'POST',
        body: formData,
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      })
        .then(r => r.json())
        .then(res => resolve(res.location))
        .catch(() => reject('Upload failed'));
    })
  };

  constructor() {
    this.form = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(5)]],
      excerpt: ['', [Validators.maxLength(250)]],
      body: ['', [Validators.required]],
      language_id: [null, [Validators.required]],
      category_ids: [[]], // Array of IDs
      // status: ['1'] // Default to Draft
    });
  }

  ngOnInit() {
    this.loadDependencies();

    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        // --- EDIT MODE ---
        this.isEditMode.set(true);
        this.postId = Number(id);
        this.loadPostData(id);
      } else {
        // --- CREATE MODE ---
        this.isEditMode.set(false);
        // Default Language
        // const currentLang = this.langService.currentLang()?;
        // if (currentLang) {
        //   this.form.patchValue({ language_id: currentLang.id });
        // }
        this.form.patchValue({ language_id: 1 });
      }
    });
  }

  loadDependencies() {
    // 1. Get Categories (Active only for dropdown)
    // Note: In Edit mode, if a post has a disabled category, it might not show up here.
    // Ideally use an Admin endpoint or generic endpoint.
    this.categoryService.getPublicCategories(1, 100).subscribe(res => {
      if (res.success) this.categories.set(res.data.categories);
    });

    // 2. Get Languages
    this.langService.getPublicLanguages().subscribe(res => {
      if (res.success) this.languages.set(res.data.languages);
    });
  }

  loadPostData(id: string) {
    this.isLoading.set(true);

    // Use getOwnPostDetail (Authenticated)
    this.postService.getOwnPostDetail(id).subscribe({
      next: (res) => {
        const p = res.data.post;

        // Extract IDs from backend response
        const catIds = p.categories?.map(c => c.id) || [];
        this.selectedCatIds.set(catIds); // Sync Signal

        this.form.patchValue({
          title: p.title,
          excerpt: p.excerpt,
          body: p.body,
          language_id: p.languageId,
          category_ids: catIds,
          // status: p.status
        });

        if (p.url_thumbnail) {
          this.previewUrl = p.url_thumbnail;
        }
        this.isLoading.set(false);
      },
      error: () => {
        // Handle error (e.g. not owner)
        this.router.navigate(['/profile/posts']);
      }
    });
  }

  // --- ACTIONS ---

  toggleCategory(id: number) {
    const currentIds = this.form.value.category_ids as number[];
    let newIds: number[];

    if (currentIds.includes(id)) {
      newIds = currentIds.filter(x => x !== id);
    } else {
      newIds = [...currentIds, id];
    }

    // Update Form & Signal
    this.form.patchValue({ category_ids: newIds });
    this.form.markAsDirty();
    this.selectedCatIds.set(newIds);
  }

  isCategorySelected(id: number): boolean {
    return this.selectedCatIds().includes(id);
  }

  onFileSelect(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      this.form.markAsDirty();
      const reader = new FileReader();
      reader.onload = (e) => this.previewUrl = e.target?.result as string;
      reader.readAsDataURL(file);
    }
  }

  removeCover() {
    this.selectedFile = null;
    this.previewUrl = null;
    this.form.markAsDirty();
    // Logic note: If editing, backend needs to know we removed it.
    // For simple implementation, backend overrides if file sent, ignores if not.
    // To explicitly delete, you might need a flag like 'delete_thumbnail: true' in payload.
  }

  // --- SAVE ---
  save() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    // this.form.patchValue({ status: targetStatus });

    const formData = new FormData();
    // Append Text Fields
    Object.keys(this.form.value).forEach(key => {
      if (key === 'category_ids') {
        // Convert array [1, 2] to string "1,2" for Joi
        const ids = this.form.value[key];
        if (ids && ids.length) formData.append('categoryIds', ids.join(','));
      } else {
        formData.append(key, this.form.value[key]);
      }
    });

    // Append File
    if (this.selectedFile) {
      formData.append('thumbnail', this.selectedFile);
    }

    const request$ = this.isEditMode()
      ? this.postService.update(this.postId!, formData)
      : this.postService.create(formData);

    request$.subscribe({
      next: () => {
        this.router.navigate(['/profile/posts']);
      },
      error: (err) => {
        alert(err.error?.message || 'Failed to save');
        this.isSubmitting.set(false);
      }
    });
  }
}
