import { Routes } from '@angular/router';
import { authGuard, adminGuard } from './guards/auth-guard';

export const routes: Routes = [
  { path: '', redirectTo: '/videos', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login')
      .then(m => m.Login)
  },
  {
    path: 'register',
    loadComponent: () => import('./pages/register/register')
      .then(m => m.Register)
  },
  {
    path: 'videos',
    loadComponent: () => import('./pages/video-list/video-list')
      .then(m => m.VideoList),
    canActivate: [authGuard]
  },
  {
    path: 'watch/:id',
    loadComponent: () => import('./pages/video-player/video-player')
      .then(m => m.VideoPlayer),
    canActivate: [authGuard]
  },
  {
    path: 'admin/upload',
    loadComponent: () => import('./pages/admin-upload/admin-upload')
      .then(m => m.AdminUpload),
    canActivate: [adminGuard]
  }
];