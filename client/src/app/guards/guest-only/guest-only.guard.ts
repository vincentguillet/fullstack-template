import { inject } from '@angular/core';
import { Router, UrlTree, CanActivateFn, CanMatchFn } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';

function redirectIfLoggedIn(): boolean | UrlTree {
  const authService = inject(AuthService);
  const router = inject(Router);
  // Si déjà connecté -> redirige vers /home
  return authService.isLoggedIn() ? router.parseUrl('/home') : true;
}

export const guestOnlyCanMatch: CanMatchFn = () => redirectIfLoggedIn();
export const guestOnlyCanActivate: CanActivateFn = () => redirectIfLoggedIn();
