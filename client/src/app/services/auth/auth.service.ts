import {inject, Injectable, signal} from '@angular/core';
import {map, Observable, tap} from 'rxjs';
import {Credentials} from '../../interfaces/credentials/credentials';
import {HttpClient} from '@angular/common/http';
import {User} from '../../models/user/user';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly http: HttpClient = inject(HttpClient);
  private readonly BASE_URL = 'http://localhost:8080/api/auth';

  user = signal<User | null | undefined>(undefined);

  register(user: User): Observable<any> {
    return this.http.post(this.BASE_URL + '/register', user).pipe(
      tap(() => {
        // Optionally handle post-registration logic here
      })
    );
  }

  login(credentials: Credentials): Observable<User | null | undefined> {
    return this.http.post<User>(this.BASE_URL + '/login', credentials).pipe(
      tap((result: any) => {
        localStorage.setItem('token', result.token);
        const user: User = Object.assign(new User(), result['user']);
        this.user.set(user);
      }),
      map((result: any) => {
        return this.user();
      })
    );
  }

  logout(): Observable<null> {
    return this.http.get(this.BASE_URL + '/logout').pipe(
      tap(() => {
        localStorage.removeItem('token');
        this.user.set(null);
      }),
      map(() => null)
    );
  }

  getUsers(): Observable<User | null | undefined> {
    return this.http.get(this.BASE_URL + '/me').pipe(
      tap((result: any) => {
        const user: User = Object.assign(new User(), result);
        this.user.set(user);
      }),
      map((result: any) => {
        return this.user();
      })
    );
  }
}
