import { Routes } from '@angular/router';
import {HomeComponent} from './pages/home/home.component';
import {RegisterComponent} from './pages/register/register.component';
import {LoginComponent} from './pages/login/login.component';

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
    component: RegisterComponent
  },
  {
    path : 'login',
    component: LoginComponent
  },
  {
    path : '**',
    redirectTo: ''
  }
];
