import { Routes } from '@angular/router';
import { authGuard } from './shared/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'home',
    loadComponent: () => import('./home/home.page').then((m) => m.HomePage),
    canActivate:[authGuard]   
  },
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/auth/login/login.page').then( m => m.LoginPage)
  },
  {
    path: 'signup',
    loadComponent: () => import('./pages/auth/signup/signup.page').then( m => m.SignupPage)
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./pages/dashboard/dashboard').then( m => m.DashboardPage),
    canActivate:[authGuard]   
  },

  {
    path: 'grids-list',
    loadComponent: () => import('./pages/grids/grids-list/grids-list').then( m => m.GridsListComponent)
  },
  {
    path: 'gridsdialog',
    loadComponent: () => import('./pages/grids/gridsdialog/gridsdialog').then( m => m.GridsdialogPage)
  },
];
