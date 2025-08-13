import {Component, inject} from '@angular/core';
import {MatToolbar} from '@angular/material/toolbar';
import {MatButton} from '@angular/material/button';
import {Router, RouterLink} from '@angular/router';
import {AuthService} from '../../services/auth/auth.service';
import {MatMenu, MatMenuItem, MatMenuTrigger} from '@angular/material/menu';
import {MatIcon} from '@angular/material/icon';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    MatToolbar,
    MatButton,
    RouterLink,
    MatMenuTrigger,
    MatIcon,
    MatMenu,
    MatMenuItem
  ],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {

  protected readonly authService = inject(AuthService);
  private readonly router: Router = inject(Router);

  login() {
    this.router.navigate(['/login'], {queryParams: {redirect: '/profile'}}).then();
  }

  logout() {
    this.authService.logout().subscribe({
      next: () => {
        this.login();
      },
      error: (err) => {
        console.error('Logout failed:', err);
      }
    });
  }

  getUser() {
    return this.authService.user();
  }
}
