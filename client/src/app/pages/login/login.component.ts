import {Component, inject} from '@angular/core';
import {MatError, MatFormField, MatLabel} from '@angular/material/form-field';
import {FormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {AuthService} from '../../services/auth/auth.service';
import {Router} from '@angular/router';
import {Subscription} from 'rxjs';
import {Credentials} from '../../interfaces/credentials/credentials';
import {User} from '../../models/user/user';
import {MatInput} from '@angular/material/input';
import {MatButton} from '@angular/material/button';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    MatFormField,
    MatLabel,
    MatError,
    ReactiveFormsModule,
    MatInput,
    MatButton
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {

  private readonly formBuilder: FormBuilder = inject(FormBuilder);
  private readonly loginService: AuthService = inject(AuthService);
  private readonly router: Router = inject(Router);

  private loginSubscription: Subscription | null = null;

  loginFormGroup = this.formBuilder.group({
    username: ['', [
      Validators.required
    ]],
    password: ['', [
      Validators.required
    ]]
  });

  invalidCredentials = false;

  ngOnDestroy() {
    this.loginSubscription?.unsubscribe();
  }

  login() {
    this.loginSubscription = this.loginService.login(
      this.loginFormGroup.value as Credentials).subscribe({
      next: (result: User | null | undefined) => {
        this.navigateHome();
      },
      error: (error) => {
        console.log(error);
        this.invalidCredentials = true;
      }
    });
  }

  navigateHome() {
    this.router.navigate(['/home']).then();
  }
}
