import {inject, Injectable, signal} from '@angular/core';
import {catchError, map, of, switchMap, tap} from 'rxjs';
import {Credentials} from '../../interfaces/credentials/credentials';
import {HttpClient} from '@angular/common/http';
import {User} from '../../models/user/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly http = inject(HttpClient);
  private readonly BASE_URL = 'http://localhost:8080/api/auth';

  readonly user = signal<User | null>(null);
  private readonly accessToken = signal<string | null>(null);

  register(user: User) {
    return this.http.post(this.BASE_URL + '/register', user, {withCredentials: true});
  }

  login(credentials: Credentials) {
    return this.http.post<any>(this.BASE_URL + '/login', credentials, {withCredentials: true}).pipe(
      tap(res => this.accessToken.set(res?.accessToken ?? null)),
      switchMap(() => this.me())
    );
  }

  logout() {
    return this.http.get(this.BASE_URL + '/logout', {withCredentials: true}).pipe(
      tap(() => {
        this.accessToken.set(null);
        this.user.set(null);
      }),
      map(() => null)
    );
  }

  // Charge l'utilisateur courant (protégé)
  me() {
    return this.http.get<User>(this.BASE_URL + '/me', {withCredentials: true}).pipe(
      tap(u => this.user.set(u)),
      map(() => this.user()),
      catchError(() => {
        this.user.set(null);
        return of(null);
      })
    );
  }

  // Demande un nouvel access token via le cookie HttpOnly
  refresh() {
    return this.http.post<any>(this.BASE_URL + '/refresh', {}, {
      withCredentials: true,
      observe: 'response'
    }).pipe(
      map(res => {
        const token = (res.body as any)?.accessToken ?? null;
        this.accessToken.set(token);
        return token;
      }),
      catchError(() => of(null))
    );
  }

  // Au démarrage de l'app, tenter transparence session -> doit TOUJOURS compléter
  bootstrapSession() {
    return this.refresh().pipe(
      switchMap(token => token ? this.me() : of(null)),
      catchError(() => of(null)) // <- sécurité supplémentaire
    );
  }

  isLoggedIn(): boolean {
    return this.user() !== null;
  }

  hasRole(role: string): boolean {
    const user: User | null = this.user();
    if (!user) return false;
    const roles = Array.isArray((user as any).roles) ? (user as any).roles : [(user as any).role];
    return roles?.includes(role) ?? false;
  }

  getAccessToken(): string | null {
    return this.accessToken();
  }
}
