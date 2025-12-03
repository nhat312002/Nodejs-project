import { Pagination } from './api.model';

export interface Category {
  id: number;
  name: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryListData {
  pagination: Pagination;
  categories: Category[];
}
