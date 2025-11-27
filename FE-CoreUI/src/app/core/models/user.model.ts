import { Pagination } from './api.model';

export interface User {
  id: number;
  full_name: string;
  email: string;
  username: string;
  phone: string | null;
  role_id: number;
  status: string;
  url_avatar?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UserListData {
  pagination: Pagination;
  users: User[];
}
