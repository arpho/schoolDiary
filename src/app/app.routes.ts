import { Routes } from '@angular/router';
import { authGuard } from './shared/guards/auth.guard';
import { pendingChangesGuard } from './shared/guards/pending-changes.guard';
import { roleGuard } from './shared/guards/role.guard';
import { UsersRole } from './shared/models/usersRole';

/**
 * Definizione delle rotte principali dell'applicazione.
 * Collega i percorsi URL ai rispettivi componenti/pagine, gestendo lazy loading e guardie di navigazione.
 */
export const routes: Routes = [
  {
    path: 'home',
    loadComponent: () => import('./home/home.page').then((m) => m.HomePage),
    canActivate: [authGuard]
  },
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/auth/login/login.page').then(m => m.LoginPage)
  },
  {
    path: 'signup',
    loadComponent: () => import('./pages/auth/signup/signup.page').then(m => m.SignupPage)
  },
  {
    path: 'lock-screen',
    loadComponent: () => import('./pages/auth/lock-screen/lock-screen.page').then(m => m.LockScreenPage)
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./pages/dashboard/dashboard').then(m => m.DashboardPage),
    canActivate: [authGuard]
  },

  {
    path: 'grids-list',
    loadComponent: () => import('./pages/grids/grids-list/grids-list').then(m => m.GridsListComponent),
    canActivate: [authGuard, roleGuard],
    data: { roles: [UsersRole.ADMIN, UsersRole.TEACHER] }
  },
  {
    path: 'gridsdialog',
    loadComponent: () => import('./pages/grids/gridsdialog/gridsdialog').then(m => m.GridsdialogPage),
    canActivate: [authGuard, roleGuard],
    data: { roles: [UsersRole.ADMIN, UsersRole.TEACHER] }
  },
  {
    path: 'classes-list',
    loadComponent: () => import('./pages/classes/classes-list/classes-list').then(m => m.ClassesListComponent),
    canActivate: [authGuard, roleGuard],
    data: { roles: [UsersRole.ADMIN, UsersRole.TEACHER] }
  },
  {
    path: 'class-dialog/:classkey',
    loadComponent: () => import('./pages/classes/classe-dialog/classe-dialog').then(m => m.ClasseDialogPage),
    canActivate: [authGuard, roleGuard],
    canDeactivate: [pendingChangesGuard],
    data: { roles: [UsersRole.ADMIN, UsersRole.TEACHER] }
  },
  {
    path: 'users-list',
    loadComponent: () => import('./pages/users/users-list/users-list.page').then(m => m.UsersListPage),
    canActivate: [authGuard, roleGuard],
    data: { roles: [UsersRole.ADMIN] }
  },
  {
    path: 'user-dialog/:userKey',
    loadComponent: () => import('./pages/users/user-dialog/user-dialog.page').then(m => m.UserDialogPage),
    canActivate: [authGuard, roleGuard],
    canDeactivate: [pendingChangesGuard],
    data: { roles: [UsersRole.ADMIN] }
  },
  {
    path: 'classes-selector',
    loadComponent: () => import('./pages/classes/pages/classes-selector/classes-selector.page').then(m => m.ClassesSelectorPage)
  },

  {
    path: 'profile/:userKey',
    loadComponent: () => import('./pages/profile/profile.page').then(m => m.ProfilePage)
  },
  {
    path: 'evaluations-list4-student',
    loadComponent: () => import('./pages/evaluations/pages/evaluations-list4-student/evaluations-list4-student.page').then(m => m.EvaluationsList4StudentPage)
  },
  {
    path: 'evaluation-dialog',
    loadComponent: () => import('./pages/evaluations/evaluation-dialog/evaluation-dialog.page').then(m => m.EvaluationDialogPage),
    canActivate: [authGuard, roleGuard],
    canDeactivate: [pendingChangesGuard],
    data: { roles: [UsersRole.ADMIN, UsersRole.TEACHER] }
  },
  {
    path: 'evaluation-dialog/:evaluationKey',
    loadComponent: () => import('./pages/evaluations/evaluation-dialog/evaluation-dialog.page').then(m => m.EvaluationDialogPage),
    canActivate: [authGuard, roleGuard],
    canDeactivate: [pendingChangesGuard],
    data: { roles: [UsersRole.ADMIN, UsersRole.TEACHER] }
  },
  {
    path: 'evaluation/:studentKey/:classKey/:teacherKey',
    loadComponent: () => import('./pages/evaluations/components/evaluation4pages/evaluation4pages.component').then(m => m.Evaluation4pagesComponent)
  },
  {
    path: 'evaluations-list',
    loadComponent: () => import("./pages/evaluations/pages/evaluations-list/evaluations-list.page").then(m => m.EvaluationsListPage),
    canActivate: [authGuard, roleGuard],
    data: { roles: [UsersRole.ADMIN, UsersRole.TEACHER] }
  },
  {
    path: 'reset-password',
    loadComponent: () => import('./pages/auth/reset-password/reset-password.page').then(m => m.ResetPasswordPage)
  },
  {
    path: 'recover-password',
    loadComponent: () => import('./pages/auth/recover-password/recover-password.page').then(m => m.RecoverPasswordPage)
  },
  {
    path: 'activities-list',
    loadComponent: () => import('./pages/activities/activities-list/activities-list.page').then(m => m.ActivitiesListPage),
    canActivate: [authGuard, roleGuard],
    data: { roles: [UsersRole.ADMIN, UsersRole.TEACHER] }
  },
  {
    path: 'edit-evaluation/:evaluationKey',
    loadComponent: () => import('./pages/evaluations/edit-evaluation/edit-evaluation.page').then(m => m.EditEvaluationPage),
    canActivate: [authGuard, roleGuard],
    canDeactivate: [pendingChangesGuard],
    data: { roles: [UsersRole.ADMIN, UsersRole.TEACHER] }
  },
  {
    path: "pdf-evaluation/:evaluationKey",
    loadComponent: () => import('./pages/evaluations/components/evaluation2-pdf/evaluation2-pdf.component').then(m => m.Evaluation2PdfComponent)
  },
  {
    path: 'evaluations4-student/:studentKey/:teacherKey',
    loadComponent: () => import('./pages/evaluations/pages/evaluations4-student/evaluations4-student.page').then(m => m.Evaluations4StudentPage)
  },
  {
    path: 'activity-detail/:activityKey',
    loadComponent: () => import('./pages/activities/activity-detail/activity-detail.component').then(m => m.ActivityDetailComponent),
    canActivate: [authGuard]
  },
  {
    path: 'agenda',
    loadComponent: () => import('./pages/agenda/agenda.page').then(m => m.AgendaPage)
  },
  {
    path: 'subjects-list',
    loadComponent: () => import('./pages/subjects-list/subjects-list.page').then(m => m.SubjectsListPage),
    canActivate: [authGuard, roleGuard],
    data: { roles: [UsersRole.ADMIN] }
  },
  {
    path: 'edit-subject/:subjectKey',
    loadComponent: () => import('./pages/subjects-list/pages/edit-subject/edit-subject.page').then(m => m.EditSubjectPage),
    canActivate: [authGuard, roleGuard],
    canDeactivate: [pendingChangesGuard],
    data: { roles: [UsersRole.ADMIN] }
  },
  {
    path: 'create-subject',
    loadComponent: () => import('./pages/subjects-list/pages/create-subject/create-subject.page').then(m => m.CreateSubjectPage),
    canActivate: [authGuard, roleGuard],
    canDeactivate: [pendingChangesGuard],
    data: { roles: [UsersRole.ADMIN] }
  },
  {
    path: 'progress/:studentKey/:subjectsKey',
    loadComponent: () => import('./pages/evaluations/pages/progress/progress.page').then(m => m.ProgressPage)
  },
  {
    path: 'timetable',
    loadComponent: () => import('./pages/timetable/timetable.page').then( m => m.TimetablePage)
  },
  {
    path: 'tutoring',
    loadComponent: () => import('./pages/tutoring/tutoring.page').then( m => m.TutoringPage)
  },
  {
    path: 'evaluations4-activity/:activityKey',
    loadComponent: () => import('./pages/evaluations4-activity/evaluations4-activity.page').then( m => m.Evaluations4ActivityPage)
  },
  {
    path: 'changelog',
    loadComponent: () => import('./pages/changelog/changelog.page').then( m => m.ChangelogPage)
  },
  {
    path: 'interrogations4user/:studentKey',
    loadComponent: () => import('./pages/agenda/pages/interrogations4user/interrogations4user.page').then( m => m.Interrogations4userPage)
  },
  {
    path: 'settings',
    loadComponent: () => import('./pages/settings/settings.page').then( m => m.SettingsPage)
  }
];
