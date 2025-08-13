import {Component, inject, OnDestroy} from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators
} from '@angular/forms';
import {Router, RouterLink} from '@angular/router';
import {MatError, MatFormField, MatLabel} from '@angular/material/form-field';
import {MatInput} from '@angular/material/input';
import {
  MatCard,
  MatCardActions,
  MatCardContent,
  MatCardHeader,
  MatCardSubtitle,
  MatCardTitle
} from '@angular/material/card';
import {MatProgressSpinner} from '@angular/material/progress-spinner';
import {MatDivider} from '@angular/material/divider';
import {AuthService} from '../../services/auth/auth.service';
import {MatCheckbox} from '@angular/material/checkbox';
import {MatButton} from '@angular/material/button';
import {Subscription} from 'rxjs';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    MatError,
    MatFormField,
    MatLabel,
    MatInput,
    MatCard,
    MatCardHeader,
    MatCardTitle,
    MatCardSubtitle,
    MatCardContent,
    ReactiveFormsModule,
    MatProgressSpinner,
    MatDivider,
    MatCardActions,
    RouterLink,
    MatCheckbox,
    MatButton
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent implements OnDestroy {

  registerForm: FormGroup;
  isSubmitted = false;
  isLoading = false;

  private readonly router: Router = inject(Router);
  private readonly authService: AuthService = inject(AuthService);

  private registerSubscription: Subscription | null = null;

  constructor(private readonly formBuilder: FormBuilder) {
    this.registerForm = this.formBuilder.group({
      firstName: ['', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(50),
        Validators.pattern('^[a-zA-Z]+$')
      ]],
      lastName: ['', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(50),
        Validators.pattern('^[a-zA-Z]+$')
      ]],
      username: ['', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(20),
        Validators.pattern('^[a-zA-Z0-9_]+$')
      ]],
      email: ['', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(120),
        Validators.email
      ]],
      password: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.maxLength(20),
        Validators.pattern('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$')
      ]],
      confirmPassword: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.maxLength(20),
        Validators.pattern('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$')
      ]],
      termsAndConditions: [false, Validators.requiredTrue]
    }, {validators: this.passwordMatchValidator});
  }

  ngOnDestroy(): void {
    this.registerSubscription?.unsubscribe();
  }

  private readonly passwordMatchValidator: ValidatorFn = (group: AbstractControl): ValidationErrors | null => {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    return password === confirmPassword ? null : {passwordMismatch: true};
  };

  onRegister() {

    this.isSubmitted = true;

    if (this.registerForm.valid) {
      this.isLoading = true;
      const registrationData = this.registerForm.value;
      delete registrationData.confirmPassword;
      this.registerSubscription = this.authService.register(registrationData).subscribe({
        next: (response) => {
          this.isLoading = false;
          this.registerForm.reset();
          this.isSubmitted = false;
          alert("Registration successful!");
          this.router.navigate(['/']).then();
        },
        error: (error) => {
          console.error('Erreur HTTP:', error);
          this.isLoading = false;
          alert("An error occurred during registration. Please try again.");
        }
      });
    }
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.registerForm.get(fieldName);
    return Boolean(field && field.invalid && (field.dirty || field.touched || this.isSubmitted));
  }

  getFieldError(fieldName: string): string {
    const field = this.registerForm.get(fieldName);

    if (field && field.errors) {
      if (field.errors['required']) return `Ce champ est obligatoire`;
      if (field.errors['email']) return `Format d'email invalide`;
      if (field.errors['minlength']) return `Minimum ${field.errors['minlength'].requiredLength} caractères`;
      if (field.errors['maxlength']) return `Maximum ${field.errors['maxlength'].requiredLength} caractères`;
    }
    return '';
  }
}
