import { Routes } from '@angular/router';
import { DefaultLayoutComponent, ClientLayoutComponent } from './layout';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
import { guestGuard } from './core/guards/guest.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./views/pages/login/login.component').then(m => m.LoginComponent),
    data: { title: 'Login Page' },
    canActivate: [guestGuard]
  },
  {
    path: 'register',
    loadComponent: () => import('./views/pages/register/register.component').then(m => m.RegisterComponent),
    data: {
      title: 'Register Page'
    },
    canActivate: [guestGuard]
  },
   {
    path: '404',
    loadComponent: () => import('./views/pages/page404/page404.component').then(m => m.Page404Component),
    data: {
      title: 'Page 404'
    }
  },
  {
    path: '500',
    loadComponent: () => import('./views/pages/page500/page500.component').then(m => m.Page500Component),
    data: {
      title: 'Page 500'
    }
  },
  {
    path: '',
    component: ClientLayoutComponent,
    data: { title: 'Home' },
    children: [
      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full'
      },
      {
        path: 'home',
        loadComponent: () => import('./views/client/home/home.component').then((m) => m.HomeComponent)
      },
    ]
  },
  {
    path: 'admin',
    component: DefaultLayoutComponent,
    data: { title: 'Admin Home', roles: [3] },
    canActivate: [authGuard, roleGuard],
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        loadChildren: () => import('./views/dashboard/routes').then((m) => m.routes)
      },
      {
        path: 'users',
        loadComponent: () => import('./views/admin/users/users.component').then(m => m.UsersComponent),
        data: {
          title: 'Users'
        }
      },
      {
        path: 'categories',
        loadComponent: () => import('./views/admin/categories/categories.component').then(m => m.CategoriesComponent),
        data: {
          title: 'Categories'
        }
      },
      {
        path: 'languages',
        loadComponent: () => import('./views/admin/languages/languages.component').then((m) => m.LanguagesComponent),
        data: {
          title: 'Languages'
        }
      },
    ]

  },
  { path: '**', redirectTo: '' }
  // {
  //   path: '',
  //   redirectTo: 'dashboard',
  //   pathMatch: 'full'
  // },
  // {
  //   path: '',
  //   loadComponent: () => import('./layout').then(m => m.DefaultLayoutComponent),
  //   data: {
  //     title: 'Home'
  //   },
  //   children: [
  //     {
  //       path: 'dashboard',
  //       loadChildren: () => import('./views/dashboard/routes').then((m) => m.routes)
  //     },
  //     {
  //       path: 'theme',
  //       loadChildren: () => import('./views/theme/routes').then((m) => m.routes)
  //     },
  //     {
  //       path: 'base',
  //       loadChildren: () => import('./views/base/routes').then((m) => m.routes)
  //     },
  //     {
  //       path: 'buttons',
  //       loadChildren: () => import('./views/buttons/routes').then((m) => m.routes)
  //     },
  //     {
  //       path: 'forms',
  //       loadChildren: () => import('./views/forms/routes').then((m) => m.routes)
  //     },
  //     {
  //       path: 'icons',
  //       loadChildren: () => import('./views/icons/routes').then((m) => m.routes)
  //     },
  //     {
  //       path: 'notifications',
  //       loadChildren: () => import('./views/notifications/routes').then((m) => m.routes)
  //     },
  //     {
  //       path: 'widgets',
  //       loadChildren: () => import('./views/widgets/routes').then((m) => m.routes)
  //     },
  //     {
  //       path: 'charts',
  //       loadChildren: () => import('./views/charts/routes').then((m) => m.routes)
  //     },
  //     {
  //       path: 'pages',
  //       loadChildren: () => import('./views/pages/routes').then((m) => m.routes)
  //     }
  //   ]
  // },
  // {
  //   path: '404',
  //   loadComponent: () => import('./views/pages/page404/page404.component').then(m => m.Page404Component),
  //   data: {
  //     title: 'Page 404'
  //   }
  // },
  // {
  //   path: '500',
  //   loadComponent: () => import('./views/pages/page500/page500.component').then(m => m.Page500Component),
  //   data: {
  //     title: 'Page 500'
  //   }
  // },
  // {
  //   path: 'login',
  //   loadComponent: () => import('./views/pages/login/login.component').then(m => m.LoginComponent),
  //   data: {
  //     title: 'Login Page'
  //   }
  // },
  // {
  //   path: 'register',
  //   loadComponent: () => import('./views/pages/register/register.component').then(m => m.RegisterComponent),
  //   data: {
  //     title: 'Register Page'
  //   }
  // },
  // { path: '**', redirectTo: 'dashboard' }
];
