import { Routes } from '@angular/router';
import { Home } from './admin/home/home';
import { RolePage } from './admin/role/role-page/role-page';
import { RoleCreate } from './admin/role/role-create/role-create';
import { UserPage } from './admin/user/user-page/user-page';
import { CategoryPage } from './admin/category/category-page/category-page';
import { LanguagePage } from './admin/language/language-page/language-page';
import { PostPage } from './admin/post/post-page/post-page';

export const routes: Routes = [
    {path: 'admin',
      component: Home,
        children: [
            {path: 'role-page', component: RolePage},
            {path: 'role-page/create', component: RoleCreate},
            {path: 'user-page', component: UserPage},
            {path: 'category-page', component: CategoryPage},
            {path: 'language-page', component: LanguagePage},
            {path: 'post-page', component: PostPage},
        ]
    },
    {
      path: 'blog',
      loadChildren: () => import('./blog/blog.routes').then(m => m.BlogRoutes)
    }
];
