import {APP_INITIALIZER, ApplicationConfig, inject, provideZoneChangeDetection} from '@angular/core';
import {provideRouter} from '@angular/router';

import {routes} from './app.routes';
import {provideHttpClient, withInterceptors} from '@angular/common/http';
import {provideAnimationsAsync} from '@angular/platform-browser/animations/async';
import {authTokenInterceptor} from './interceptors/authToken/auth-token.interceptor';
import {AuthService} from './services/auth/auth.service';
import {catchError, firstValueFrom, of} from 'rxjs';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({eventCoalescing: true}),
    provideRouter(routes),
    provideAnimationsAsync(),
    provideHttpClient(withInterceptors([
        authTokenInterceptor
      ])
    ),
    {
      provide: APP_INITIALIZER,
      multi: true,
      useFactory: () => {
        const auth = inject(AuthService);
        return () => firstValueFrom(auth.bootstrapSession().pipe(
            catchError(err => of(null))
          )
        );
      }
    }
  ]
};
