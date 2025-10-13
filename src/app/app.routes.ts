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
  {
    path: 'classes-list',
    loadComponent: () => import('./pages/classes/classes-list/classes-list').then( m => m.ClassesListComponent)
  },
  {
    path: 'class-dialog/:classkey',
    loadComponent: () => import('./pages/classes/classe-dialog/classe-dialog').then( m => m.ClasseDialogPage)
  },
  {
    path: 'users-list',
    loadComponent: () => import('./pages/users/users-list/users-list.page').then( m => m.UsersListPage)
  },
  {
    path: 'user-dialog/:userKey',
    loadComponent: () => import('./pages/users/user-dialog/user-dialog.page').then( m => m.UserDialogPage)
  },
  {
    path: 'classes-selector',
    loadComponent: () => import('./pages/classes/pages/classes-selector/classes-selector.page').then( m => m.ClassesSelectorPage)
  },

  {
    path: 'profile/:userKey',
    loadComponent: () => import('./pages/profile/profile.page').then( m => m.ProfilePage)
  },
  {
    path: 'evaluations-list4-student',
    loadComponent: () => import('./pages/evaluations/pages/evaluations-list4-student/evaluations-list4-student.page').then( m => m.EvaluationsList4StudentPage)
  },
  {
    path: 'evaluation-dialog',
    loadComponent: () => import('./pages/evaluations/evaluation-dialog/evaluation-dialog.page').then( m => m.EvaluationDialogPage)
  },
  {
    path: 'evaluation-dialog/:evaluationKey',
    loadComponent: () => import('./pages/evaluations/evaluation-dialog/evaluation-dialog.page').then( m => m.EvaluationDialogPage)
  },
  {
    path: 'evaluation/:studentKey/:classKey/:teacherKey',
    loadComponent: () => import('./pages/evaluations/components/evaluation4pages/evaluation4pages.component').then( m => m.Evaluation4pagesComponent)
  },
  {
    path: 'evaluations-list',
    loadComponent: () => import("./pages/evaluations/pages/evaluations-list/evaluations-list.page").then( m => m.EvaluationsListPage)
  },
  {
    path: 'reset-password',
    loadComponent: () => import('./pages/auth/reset-password/reset-password.page').then(m => m.ResetPasswordPage)
  },
  {
    path: 'recover-password',
    loadComponent: () => import('./pages/auth/recover-password/recover-password.page').then( m => m.RecoverPasswordPage)
  },
  {
    path: 'activities-list',
    loadComponent: () => import('./pages/activities/activities-list/activities-list.page').then( m => m.ActivitiesListPage)
  },
];
