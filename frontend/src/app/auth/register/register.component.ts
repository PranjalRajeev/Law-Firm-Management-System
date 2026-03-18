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

// ─────────────────────────────────────────────────────────────────────────────
// Custom Validators
// ─────────────────────────────────────────────────────────────────────────────

/** RFC 5322-inspired email validator — stricter than Angular's built-in */
export function strictEmailValidator(): ValidatorFn {
  // Allows standard email format: local@domain.tld
  // - local part: alphanumeric + .!#$%&'*+/=?^_`{|}~- (no leading/trailing/double dots)
  // - domain: valid hostnames separated by dots, TLD must be 2+ alpha chars
  const EMAIL_REGEX =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/;

  return (control: AbstractControl): ValidationErrors | null => {
    const value: string = (control.value || '').trim();
    if (!value) return null; // let required validator handle empty

    if (!EMAIL_REGEX.test(value))               return { invalidEmail: true };
    if (value.length > 254)                     return { emailTooLong: true };

    const [local] = value.split('@');
    if (local.length > 64)                      return { localPartTooLong: true };
    if (local.startsWith('.') || local.endsWith('.')) return { invalidEmail: true };
    if (local.includes('..'))                   return { invalidEmail: true };

    return null;
  };
}

/** Password rules interface — used for the live checklist in the template */
export interface PasswordRules {
  minLength:  boolean;
  hasUpper:   boolean;
  hasLower:   boolean;
  hasNumeric: boolean;
  hasSpecial: boolean;
}

/**
 * Strong password validator.
 * Returns individual error keys so the template can highlight each rule.
 * Rules: min 8 chars, uppercase, lowercase, digit, special character.
 */
export function strongPasswordValidator(): ValidatorFn {
  const SPECIAL = /[!@#$%^&*()\-_=+\[\]{};':",.<>/?\\|`~]/;

  return (control: AbstractControl): ValidationErrors | null => {
    const value: string = control.value || '';
    if (!value) return null; // let required handle empty

    const errors: ValidationErrors = {};

    if (value.length < 8)         errors['minLength']  = true;
    if (!/[A-Z]/.test(value))     errors['hasUpper']   = true;
    if (!/[a-z]/.test(value))     errors['hasLower']   = true;
    if (!/[0-9]/.test(value))     errors['hasNumeric'] = true;
    if (!SPECIAL.test(value))     errors['hasSpecial'] = true;

    return Object.keys(errors).length ? errors : null;
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {
  registerForm: FormGroup;
  hidePassword  = true;
  isLoading     = false;
  errorMessage  = '';

  // ── Password intelligence ─────────────────────────────────────────────────

  /** Live rule state for the checklist UI */
  get passwordRules(): PasswordRules {
    const value: string = this.registerForm.get('password')?.value || '';
    const SPECIAL = /[!@#$%^&*()\-_=+\[\]{};':",.<>/?\\|`~]/;
    return {
      minLength:  value.length >= 8,
      hasUpper:   /[A-Z]/.test(value),
      hasLower:   /[a-z]/.test(value),
      hasNumeric: /[0-9]/.test(value),
      hasSpecial: SPECIAL.test(value)
    };
  }

  /** 0–5 strength score (one point per passing rule) */
  get passwordStrength(): number {
    const r = this.passwordRules;
    return [r.minLength, r.hasUpper, r.hasLower, r.hasNumeric, r.hasSpecial]
      .filter(Boolean).length;
  }

  get passwordStrengthLabel(): string {
    switch (this.passwordStrength) {
      case 0: case 1: return 'Very Weak';
      case 2:         return 'Weak';
      case 3:         return 'Fair';
      case 4:         return 'Strong';
      default:        return 'Very Strong';
    }
  }

  get passwordStrengthClass(): string {
    switch (this.passwordStrength) {
      case 0: case 1: return 'strength-1';
      case 2:         return 'strength-2';
      case 3:         return 'strength-3';
      case 4:         return 'strength-4';
      default:        return 'strength-5';
    }
  }

  /** Only show hints after user starts typing or blurs */
  get showPasswordHints(): boolean {
    const ctrl = this.registerForm.get('password');
    return !!(ctrl?.value?.length > 0) || !!(ctrl?.touched);
  }

  // ── Email helpers ──────────────────────────────────────────────────────────

  get emailErrorMessage(): string {
    const ctrl = this.registerForm.get('email');
    if (ctrl?.hasError('required'))        return 'Email address is required';
    if (ctrl?.hasError('invalidEmail'))    return 'Enter a valid email address (e.g. name@domain.com)';
    if (ctrl?.hasError('emailTooLong'))    return 'Email address must not exceed 254 characters';
    if (ctrl?.hasError('localPartTooLong')) return 'The part before @ must not exceed 64 characters';
    return '';
  }

  // ── Constructor ────────────────────────────────────────────────────────────

  constructor(
    private fb:          FormBuilder,
    private router:      Router,
    private authService: AuthService,
    private snackBar:    MatSnackBar
  ) {
    this.registerForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.maxLength(50)]],
      lastName:  ['', [Validators.required, Validators.maxLength(50)]],
      username:  ['', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(30),
        Validators.pattern(/^[a-zA-Z0-9._-]+$/)   // no spaces or special chars
      ]],
      email:    ['', [Validators.required, strictEmailValidator()]],
      password: ['', [Validators.required, strongPasswordValidator()]],
      role:     ['', Validators.required]
    });
  }

  ngOnInit(): void {}

  // ── Actions ────────────────────────────────────────────────────────────────

  togglePasswordVisibility(): void {
    this.hidePassword = !this.hidePassword;
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.isLoading    = true;
    this.errorMessage = '';

    const v = this.registerForm.value;

    const registerData = {
      firstName:         v.firstName,
      lastName:          v.lastName,
      username:          v.username,
      email:             (v.email as string).trim().toLowerCase(),
      password:          v.password,
      barNumber:         v.role === 'LAWYER' ? 'PENDING' : null,
      phoneNumber:       null,
      address:           null,
      specialization:    null,
      yearsOfExperience: null
    };

    this.authService.register(registerData).subscribe({
      next: () => {
        this.isLoading = false;
        this.snackBar.open('Registration successful! Please login.', 'Close', { duration: 3000 });
        this.router.navigate(['/auth/login']);
      },
      error: (error) => {
        this.isLoading    = false;
        this.errorMessage = error?.error?.message
          || error?.message
          || 'Registration failed. Please try again.';
        this.snackBar.open(this.errorMessage, 'Close', { duration: 5000 });
      }
    });
  }

  navigateToLogin(): void { this.router.navigate(['/auth/login']); }
  navigateToHome():  void { this.router.navigate(['/']); }
}