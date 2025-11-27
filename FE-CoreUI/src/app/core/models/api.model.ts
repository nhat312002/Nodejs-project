export interface Pagination {
  totalRecords: number;
  totalPages: number;
  currentPage: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  status: number;
  message: string;
}
