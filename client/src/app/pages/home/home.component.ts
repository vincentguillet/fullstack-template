import {Component, inject} from '@angular/core';
import {MatButton} from '@angular/material/button';
import {AuthService} from '../../services/auth/auth.service';
import {RouterLink} from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    MatButton,
    RouterLink
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {

  protected readonly authService: AuthService = inject(AuthService);

  getUser() {
    return this.authService.user();
  }
}
