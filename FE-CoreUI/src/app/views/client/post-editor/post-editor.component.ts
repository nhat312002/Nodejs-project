import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { EditorComponent, TINYMCE_SCRIPT_SRC } from '@tinymce/tinymce-angular'; // TinyMCE

// CoreUI
import {
  CardModule, FormModule, ButtonDirective, SpinnerModule,
  GridModule, DropdownModule, BadgeModule,
  AlertComponent
} from '@coreui/angular';
import { IconDirective } from '@coreui/icons-angular';

// App
import { PostService } from '../../../core/services/post.service';
import { Category } from '../../../core/models/category.model';
import { CategoryService } from '../../../core/services/category.service';
import { LanguageService, Language } from '../../../core/services/language.service';
import { environment } from '../../../../environments/environment';
import { ImgUrlPipe } from '../../../shared/pipes/img-url.pipe';
import { AuthService } from '../../../core/services/auth.service';
import { firstValueFrom } from 'rxjs';

import { NoWhitespaceValidator } from '../../../shared/utils/validator.util'
import { ConfirmService } from 'src/app/core/services/confirm.service';

@Component({
  selector: 'app-post-editor',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, RouterLink, EditorComponent,
    CardModule, FormModule, ButtonDirective, SpinnerModule, GridModule, DropdownModule, BadgeModule,
    ImgUrlPipe, AlertComponent
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
  private authService = inject(AuthService);
  private confirmService = inject(ConfirmService);
  // --- STATE ---
  form: FormGroup;
  isEditMode = signal(false);
  postId: number | null = null;

  isLoading = signal(false);
  isSubmitting = signal(false);

  saveError = signal('');

  // Data for Dropdowns
  categories = signal<Category[]>([]);
  languages = signal<Language[]>([]);

  // Cover Image
  selectedFile: File | null = null;
  previewUrl: string | null = null;
  isCoverRemoved = false;

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
    toolbar: 'undo redo | blocks | bold italic | bullist numlist | image link',
    // 1. CSS inside the editor (Matches your frontend font and image behavior)
    content_style: `
    // body { font-family: Georgia, serif; font-size: 18px; color: #2c2c2c; }
    img { max-width: 100%; height: auto; display: block; margin: 10px auto; border-radius: 5px; }
  `,

    // 2. Default Class (Applied to every new image)
    // This ensures your frontend renders it nicely even without extra CSS
    image_class_list: [
      { title: 'Responsive', value: 'img-fluid rounded' },
      { title: 'None', value: '' }
    ],

    // 1. Tell TinyMCE where relative images live
    // If your image is "uploads/abc.jpg", TinyMCE will load "http://localhost:3000/uploads/abc.jpg"
    // But internally it keeps the path as "uploads/abc.jpg"
    document_base_url: environment.apiUrl + '/',

    // 2. Prevent TinyMCE from rewriting URLs to absolute
    relative_urls: false,
    remove_script_host: false,
    convert_urls: true,
    images_upload_handler: (blobInfo: any) => { return this.handleImageUpload(blobInfo); }
  };

  constructor() {
    this.form = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3), NoWhitespaceValidator]],
      excerpt: ['', [Validators.maxLength(250)]],
      body: ['', [Validators.required]],
      languageId: [1, [Validators.required]],
      categoryIds: [[]], // Array of IDs
      // status: ['1'] // Default to Draft
    });
  }

  private removeFailedImages(html: string): string {
    if (!html) return '';

    // Regex to find <img> tags where src starts with "data:"
    // It replaces the whole <img> tag with an empty string
    return html.replace(/<img[^>]+src="data:[^">]+"[^>]*>/g, '');
  }

  // Optional: Check if there are bad images to warn the user
  private hasBadImages(html: string): boolean {
    return /<img[^>]+src="data:/.test(html);
  }

  private async handleImageUpload(blobInfo: any): Promise<string> {
    const formData = new FormData();
    formData.append('file', blobInfo.blob(), blobInfo.filename());

    let token = this.authService.getAccessToken();

    try {
      let response = await fetch(`${environment.apiUrl}/media/upload`, {
        method: 'POST',
        body: formData,
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.status === 401) {
        console.log('TinyMCE upload 401. Refreshing token...');


        await firstValueFrom(this.authService.refreshToken());
        const newToken = this.authService.getAccessToken();

        response = await fetch(`${environment.apiUrl}/media/upload`, {
          method: 'POST',
          body: formData,
          headers: { 'Authorization': `Bearer ${newToken}` }
        });
      }

      if (response.ok) {
        const json = await response.json();
        let location = json.data.location;

        if (location && !location.startsWith('http')) {
          const baseUrl = environment.apiUrl.replace(/\/$/, '');
          if (!location.startsWith('/')) location = `/${location}`;
          location = `${baseUrl}${location}`;
        }

        return location;
      }


      // 5. Handle Other Errors
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Upload failed');

    } catch (error: any) {
      console.error('TinyMCE Upload Error:', error);
      // If refresh failed, or retry failed, reject the promise
      throw new Error(error.message || 'Image upload failed');
    }
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
          languageId: p.languageId,
          categoryIds: catIds,
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
    const currentIds = this.form.value.categoryIds as number[];
    let newIds: number[];

    if (currentIds.includes(id)) {
      newIds = currentIds.filter(x => x !== id);
    } else {
      newIds = [...currentIds, id];
    }

    // Update Form & Signal
    this.form.patchValue({ categoryIds: newIds });
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
      this.isCoverRemoved = false;
      this.form.markAsDirty();
      const reader = new FileReader();
      reader.onload = (e) => this.previewUrl = e.target?.result as string;
      reader.readAsDataURL(file);
    }
  }

  removeCover() {
    this.selectedFile = null;
    this.previewUrl = null;
    this.isCoverRemoved = true;
    this.form.markAsDirty();
    // Logic note: If editing, backend needs to know we removed it.
    // For simple implementation, backend overrides if file sent, ignores if not.
    // To explicitly delete, you might need a flag like 'delete_thumbnail: true' in payload.
  }

  // --- SAVE ---
  async save() {
    this.saveError.set('');

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    // 1. Get raw content
    let content = this.form.value.body;

    // 2. CHECK FOR FAILED IMAGES

    if (this.hasBadImages(content)) {
      const confirmed = await this.confirmService.ask({
        title: 'Upload Failed',
        message: 'Some images failed to upload (likely too large) and will be removed. Continue saving?',
        confirmText: 'Remove & Save',
        color: 'warning'
      });

      if (!confirmed) return;

      // User confirmed, strip images
      content = this.removeFailedImages(content);
      this.form.patchValue({ body: content });
    }


    this.isSubmitting.set(true);

    const formData = new FormData();
    Object.keys(this.form.value).forEach(key => {
      if (key === 'categoryIds') {
        const ids = this.form.value[key];
        if (ids && ids.length) formData.append('categoryIds', ids.join(','));
      } else {
        formData.append(key, this.form.value[key]);
      }
    });

    if (this.selectedFile) {
      formData.append('thumbnail', this.selectedFile);
    }
    else if (this.isCoverRemoved && this.isEditMode()) {
      formData.append('deleteThumbnail', 'true');
    }
    const request$ = this.isEditMode()
      ? this.postService.update(this.postId!, formData)
      : this.postService.create(formData);

    request$.subscribe({
      next: () => {
        this.router.navigate(['/profile/posts']);
      },
      error: (err) => {
        let msg = 'Failed to save';

        if (err.error?.data && Array.isArray(err.error.data)) {
          // Join array items with a new line
          msg = err.error.data.join('\n');
        } else if (err.error?.message) {
          msg = err.error.message;
        }

        this.saveError.set(msg);
        this.isSubmitting.set(false);
      }
    });
  }
}
