import { Component, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ValidationErrors,
  ValidatorFn,
  Validators
} from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../shared/services/auth.service';
import { LoginRequest } from '../../shared/models/user.model';

// ── Strict email validator (for forgot password field only) ───────────────────
export function strictEmailValidator(): ValidatorFn {
  const EMAIL_REGEX =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/;

  return (control: AbstractControl): ValidationErrors | null => {
    const value: string = (control.value || '').trim();
    if (!value) return null;
    if (!EMAIL_REGEX.test(value))  return { invalidEmail: true };
    if (value.length > 254)        return { emailTooLong: true };
    const [local] = value.split('@');
    if (local.length > 64)         return { localPartTooLong: true };
    if (local.startsWith('.') || local.endsWith('.') || local.includes('..'))
                                   return { invalidEmail: true };
    return null;
  };
}

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  // ── Login form ──────────────────────────────────────────────────────────────
  loginForm: FormGroup;
  isLoading    = false;
  hidePassword = true;
  errorMessage = '';

  // ── Forgot password modal ───────────────────────────────────────────────────
  showForgotModal = false;
  forgotForm:      FormGroup;
  forgotLoading   = false;
  forgotSuccess   = false;
  forgotError     = '';

  get forgotEmailError(): string {
    const ctrl = this.forgotForm.get('email');
    if (ctrl?.hasError('required'))          return 'Email address is required';
    if (ctrl?.hasError('invalidEmail'))      return 'Enter a valid email address (e.g. name@domain.com)';
    if (ctrl?.hasError('emailTooLong'))      return 'Email must not exceed 254 characters';
    if (ctrl?.hasError('localPartTooLong'))  return 'Part before @ must not exceed 64 characters';
    return '';
  }

  constructor(
    private fb:          FormBuilder,
    private authService: AuthService,
    private router:      Router,
    private snackBar:    MatSnackBar
  ) {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });

    this.forgotForm = this.fb.group({
      email: ['', [Validators.required, strictEmailValidator()]]
    });
  }

  ngOnInit(): void {}

  // ── Login + role-based redirect ─────────────────────────────────────────────
  onSubmit(): void {
    if (this.loginForm.valid) {
      this.isLoading = true;
      const loginRequest: LoginRequest = {
        username: this.loginForm.value.username,
        password: this.loginForm.value.password
      };

      this.authService.login(loginRequest).subscribe({
        next: (response) => {
          this.isLoading = false;

          // ── Save all user info so every component can read it ──────────────
          localStorage.setItem('authToken',  response.token);
          localStorage.setItem('userId',     String(response.id ?? ''));
          localStorage.setItem('username',   response.username  ?? '');
          localStorage.setItem('firstName',  response.firstName ?? '');
          localStorage.setItem('lastName',   response.lastName  ?? '');
          localStorage.setItem('userRole',   response.role      ?? '');

          this.snackBar.open('Login successful!', 'Close', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });

          // Redirect based on user role
          const role = response.role;
          if (role === 'ROLE_ADMIN') {
            this.router.navigate(['/admin/dashboard']);
          } else if (role === 'ROLE_LAWYER') {
            this.router.navigate(['/lawyer/dashboard']);
          } else if (role === 'ROLE_CLIENT') {
            this.router.navigate(['/client/dashboard']);
          } else {
            this.router.navigate(['/']);
          }
        },
        error: (error) => {
          this.isLoading = false;
          this.snackBar.open('Login failed. Please check your credentials.', 'Close', {
            duration: 3000,
            panelClass: ['error-snackbar']
          });
        }
      });
    }
  }

  togglePasswordVisibility(): void {
    this.hidePassword = !this.hidePassword;
  }

  // ── Forgot password modal ───────────────────────────────────────────────────
  openForgotModal(): void {
    this.showForgotModal = true;
    this.forgotSuccess   = false;
    this.forgotError     = '';
    this.forgotForm.reset();
  }

  closeForgotModal(): void {
    this.showForgotModal = false;
  }

  onForgotSubmit(): void {
    if (this.forgotForm.invalid) {
      this.forgotForm.markAllAsTouched();
      return;
    }

    this.forgotLoading = true;
    this.forgotError   = '';

    const email = (this.forgotForm.value.email as string).trim().toLowerCase();

    // Wire up your AuthService call here:
    // this.authService.forgotPassword({ email }).subscribe({
    //   next: () => { this.forgotLoading = false; this.forgotSuccess = true; },
    //   error: (err) => { this.forgotLoading = false; this.forgotError = err?.error?.message || 'Something went wrong.'; }
    // });

    // Placeholder until service method is ready:
    setTimeout(() => {
      this.forgotLoading = false;
      this.forgotSuccess = true;
    }, 1500);
  }

  // ── Navigation ──────────────────────────────────────────────────────────────
  navigateToRegister(): void { this.router.navigate(['/auth/register']); }
  navigateToHome():     void { this.router.navigate(['/']); }
}