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
        children: [
            {path: 'home', component: Home},
            {path: 'role-page', component: RolePage},
            {path: 'role-page/create', component: RoleCreate},
            {path: 'user-page', component: UserPage},
            {path: 'category-page', component: CategoryPage},
            {path: 'language-page', component: LanguagePage},
            {path: 'post-page', component: PostPage},
            {path: '', redirectTo: 'home', pathMatch: 'full'}
        ]
    },
];