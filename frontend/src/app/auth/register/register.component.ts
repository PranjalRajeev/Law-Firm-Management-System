import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../shared/services/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {
  registerForm: FormGroup;
  hidePassword = true;
  isLoading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {
    this.registerForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      role: ['', Validators.required]
    });
  }

  ngOnInit(): void {}

  togglePasswordVisibility(): void {
    this.hidePassword = !this.hidePassword;
  }

  onSubmit(): void {
    console.log('SUBMIT FIRED');
    console.log('Form valid:', this.registerForm.valid);
    console.log('Form value:', this.registerForm.value);

    if (this.registerForm.invalid) {
      console.log('FORM INVALID - stopping');
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const formValue = this.registerForm.value;

    const registerData = {
      firstName: formValue.firstName,
      lastName: formValue.lastName,
      username: formValue.username,
      email: formValue.email,
      password: formValue.password,
      barNumber: formValue.role === 'LAWYER' ? 'PENDING' : null,
      phoneNumber: null,
      address: null,
      specialization: null,
      yearsOfExperience: null
    };

    console.log('CALLING REGISTER SERVICE with:', registerData);

    this.authService.register(registerData).subscribe({
      next: (response) => {
        console.log('REGISTER SUCCESS:', response);
        this.isLoading = false;
        this.snackBar.open('Registration successful! Please login.', 'Close', {
          duration: 3000
        });
        this.router.navigate(['/auth/login']);
      },
      error: (error) => {
        console.error('REGISTER ERROR:', error);
        this.isLoading = false;
        this.errorMessage = error?.error?.message
          || error?.message
          || 'Registration failed. Please try again.';
        this.snackBar.open(this.errorMessage, 'Close', {
          duration: 5000
        });
      }
    });
  }

  navigateToLogin(): void {
    this.router.navigate(['/auth/login']);
  }

  navigateToHome(): void {
    this.router.navigate(['/']);
  }
}