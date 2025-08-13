import { Routes } from '@angular/router';
import {HomeComponent} from './pages/home/home.component';
import {RegisterComponent} from './pages/register/register.component';
import {LoginComponent} from './pages/login/login.component';
import {ProfileComponent} from './pages/profile/profile.component';
import {guestOnlyCanActivate, guestOnlyCanMatch} from './guards/guest-only/guest-only.guard';
import {authOnlyCanMatch} from './guards/auth-only/auth-only.guard';
import {AdminComponent} from './pages/admin/admin.component';
import {adminOnlyCanMatch} from './guards/admin-only/admin-only.guard';

export const routes: Routes = [
  {
    path : '',
    children: [
      {
        path : '',
        component: HomeComponent
      },
      {
        path : 'home',
        component: HomeComponent
      }
    ]
  },
  {
    path: 'register',
    component: RegisterComponent,
    canMatch: [guestOnlyCanMatch],
    canActivate: [guestOnlyCanActivate]
  },
  {
    path : 'login',
    component: LoginComponent,
    canMatch: [guestOnlyCanMatch],
    canActivate: [guestOnlyCanActivate]

  },
  {
    path : 'profile',
    component: ProfileComponent,
    canMatch: [authOnlyCanMatch],
    canActivate: [authOnlyCanMatch]
  },
  {
    path : 'admin',
    component: AdminComponent,
    canMatch: [adminOnlyCanMatch],
    canActivate: [adminOnlyCanMatch]
  },
  {
    path : '**',
    redirectTo: ''
  }
];
