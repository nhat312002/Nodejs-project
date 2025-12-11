import { CommonModule } from '@angular/common';
import { Component, effect, inject, OnInit, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { DropdownModule, GridModule, NavModule } from '@coreui/angular';
import { Category } from '../../../core/models/category.model';
import { CategoryService } from '../../../core/services/category.service';
import { LanguageService } from '../../../core/services/language.service';

@Component({
  selector: 'app-public-tabs-layout',
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, DropdownModule, GridModule, NavModule],
  templateUrl: './public-tabs-layout.component.html',
  styleUrl: './public-tabs-layout.component.scss',
})
export class PublicTabsLayoutComponent {
  private categoryService = inject(CategoryService);
  // private langService = inject(LanguageService);

  mainCategories = signal<Category[]>([]);
  moreCategories = signal<Category[]>([]);

  constructor() {
    // Reload tabs when language changes
    effect(() => {
      // const lang = this.langService.currentLang();
      // if (lang) {
        this.loadCategories();
      // }
    });
  }

  loadCategories() {
    this.categoryService.getPublicCategories().subscribe(res => {
      if (res.success) {
        const cats = res.data.categories;
        this.mainCategories.set(cats.slice(0, 5)); // Show top 5
        this.moreCategories.set(cats.slice(5)); // Rest in dropdown
      }
    });
  }
}
