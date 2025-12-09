import {Pagination} from './api.model';

export interface Post {
  id: number;
  title: string;
  body: string; // The full HTML content
  createdAt: string;
  updatedAt: string;
  // Nested Objects from Sequelize
  user?: {
    id: number;
    fullName: string;
  };
  categories?: {
    id: number;
    name: string;
  }[];

  // These might be null in DB, so we handle them in the component
  excerpt?: string;
  url_thumbnail?: string;
}

export interface PostListData {
  pagination: Pagination;
  posts: Post[];
}
