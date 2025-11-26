import { Routes } from '@angular/router';

export const BlogRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/blog-home/blog-home')
        .then(c => c.BlogHome)
  },
  {
    path: 'posts',
    loadComponent: () =>
      import('./pages/blog-post-list/blog-post-list')
        .then(c => c.BlogPostList)
  },
  {
    path: 'posts/:id',
    loadComponent: () =>
      import('./pages/blog-post-detail/blog-post-detail')
        .then(c => c.BlogPostDetail)
  }
]
