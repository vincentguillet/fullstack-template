import { inject } from '@angular/core';
import { CanActivateFn, CanMatchFn, Router, UrlTree, ActivatedRouteSnapshot, Route } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';

function requireAuth(url?: string): boolean | UrlTree {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isLoggedIn()) {
    return true;
  }

  // redirige vers /login avec un param "redirect"
  return router.createUrlTree(['/login'], { queryParams: { redirect: url ?? router.url } });
}

export const authOnlyCanActivate: CanActivateFn = (route: ActivatedRouteSnapshot): boolean | UrlTree =>
  requireAuth(route?.url?.map(urlSegment => urlSegment.path).join('/') ?? '/login');

export const authOnlyCanMatch: CanMatchFn = (route: Route): boolean | UrlTree =>
  requireAuth(route?.path ?? '/login');
