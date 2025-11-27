import { CommonModule } from '@angular/common';
import { Component, computed, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FormModule, PaginationModule } from '@coreui/angular';

@Component({
  selector: 'app-custom-pagination',
  imports: [CommonModule, FormsModule, PaginationModule, FormModule],
  templateUrl: './custom-pagination.component.html',
  styleUrl: './custom-pagination.component.scss',
})
export class CustomPaginationComponent {
  currentPage = input.required<number>();
  totalPages = input.required<number>();
  pageSize = input.required<number>();
  pageSizes = input<number[]>([5, 10, 20]);

  pageChange = output<number>();
  pageSizeChange = output<number>();

  visiblePages = computed(() => {
    const current = this.currentPage();
    const total = this.totalPages();
    const delta = 2;
    const range: number[] = [];
    const rangeWithDots: (number | string)[] = [];

    range.push(1);

    for (let i = current-delta; i <= current + delta; i++) {
      if (i > 1 && i < total) range.push(i);
    }

    if (total > 1) range.push(total);
    let l: number | null = null;
    for (const i of range) {
      if (l) {
        if (i - l === 2) rangeWithDots.push(l+1);
        else if (i - l !== 1) rangeWithDots.push('...');
      }
      rangeWithDots.push(i);
      l = i;
    }
    return rangeWithDots;
  });

  onPageChange(page: number) {
    if (page >= 1 && page <= this.totalPages()) {
      this.pageChange.emit(page);
    }
  }

  onPageSizeChange(event: any) {
    const newSize = Number(event.target.value);
    this.pageSizeChange.emit(newSize);
  }

  onGoToPage(event: any){
    const page = Number(event.target.value);
    if (page >= 1 && page <= this.totalPages()) {
      this.pageChange.emit(page);
    } else {
      event.target.value = this.currentPage();
    }
  }
}
