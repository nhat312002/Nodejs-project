import { Pagination } from './api.model';

export interface Language {
  id: number;
  name: string;
  locale: string; // e.g. 'en-US', 'vi-VN'
  url_flag: string; // URL from backend
  status: string; // '1' = Active, '0' = Disabled
  createdAt?: string;
}

export interface LanguageListData {
  pagination: Pagination;
  languages: Language[];
}
