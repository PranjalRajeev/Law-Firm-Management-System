// src/app/client/profile/client-profile.component.ts

import { Component, OnInit } from '@angular/core';
import { ProfileService } from '../../shared/services/profile.service';
import {
  ChangePasswordRequest, UpdateProfileRequest, UserDto
} from '../../shared/models/profile.model';

// ── Same password rules interface as register page ────────────────────────────
export interface PasswordRules {
  minLength:  boolean;
  hasUpper:   boolean;
  hasLower:   boolean;
  hasNumeric: boolean;
  hasSpecial: boolean;
}

@Component({
  selector: 'app-client-profile',
  templateUrl: './client-profile.component.html',
  styleUrls: ['./client-profile.component.scss']
})
export class ClientProfileComponent implements OnInit {

  // ── State ─────────────────────────────────────────────────────────────────
  profile: UserDto | null = null;
  loading  = true;
  error    = '';

  // ── Active section ────────────────────────────────────────────────────────
  activeSection: 'info' | 'security' = 'info';

  // ── Edit profile form ─────────────────────────────────────────────────────
  editMode    = false;
  saving      = false;
  saveSuccess = '';
  saveError   = '';

  editForm: UpdateProfileRequest = {
    firstName: '', lastName: '', email: '', phoneNumber: '', address: ''
  };

  // ── Change password form ──────────────────────────────────────────────────
  pwForm: ChangePasswordRequest = {
    currentPassword: '', newPassword: '', confirmPassword: ''
  };
  pwSaving    = false;
  pwSuccess   = '';
  pwError     = '';
  showCurrent = false;
  showNew     = false;
  showConfirm = false;

  constructor(private profileService: ProfileService) {}

  ngOnInit(): void { this.loadProfile(); }

  // ── Load ──────────────────────────────────────────────────────────────────
  loadProfile(): void {
    this.profileService.getProfile().subscribe({
      next: p => { this.profile = p; this.loading = false; this.populateForm(p); },
      error: () => { this.error = 'Failed to load profile.'; this.loading = false; }
    });
  }

  private populateForm(p: UserDto): void {
    this.editForm = {
      firstName:   p.firstName,
      lastName:    p.lastName,
      email:       p.email,
      phoneNumber: p.phoneNumber ?? '',
      address:     p.address ?? '',
    };
  }

  // ── Edit profile ──────────────────────────────────────────────────────────
  startEdit(): void {
    if (this.profile) this.populateForm(this.profile);
    this.saveSuccess = '';
    this.saveError   = '';
    this.editMode    = true;
  }

  cancelEdit(): void {
    this.editMode  = false;
    this.saveError = '';
    if (this.profile) this.populateForm(this.profile);
  }

  saveProfile(): void {
    if (!this.editForm.firstName.trim() || !this.editForm.lastName.trim() || !this.editForm.email.trim()) {
      this.saveError = 'First name, last name and email are required.';
      return;
    }
    this.saving    = true;
    this.saveError = '';
    this.profileService.updateProfile(this.editForm).subscribe({
      next: updated => {
        this.profile     = updated;
        this.saving      = false;
        this.editMode    = false;
        this.saveSuccess = 'Profile updated successfully.';
        localStorage.setItem('firstName', updated.firstName);
        localStorage.setItem('lastName',  updated.lastName);
        setTimeout(() => this.saveSuccess = '', 4000);
      },
      error: err => { this.saveError = err?.error?.message ?? 'Failed to update profile.'; this.saving = false; }
    });
  }

  // ── Password intelligence — identical to register page ────────────────────

  private readonly SPECIAL_RE = /[!@#$%^&*()\-_=+\[\]{};':",.<>/?\\|`~]/;

  /** Live rule-by-rule state for the checklist UI */
  get passwordRules(): PasswordRules {
    const v: string = this.pwForm.newPassword || '';
    return {
      minLength:  v.length >= 8,
      hasUpper:   /[A-Z]/.test(v),
      hasLower:   /[a-z]/.test(v),
      hasNumeric: /[0-9]/.test(v),
      hasSpecial: this.SPECIAL_RE.test(v)
    };
  }

  /** 0–5 score — one point per passing rule */
  get passwordStrengthScore(): number {
    const r = this.passwordRules;
    return [r.minLength, r.hasUpper, r.hasLower, r.hasNumeric, r.hasSpecial].filter(Boolean).length;
  }

  get passwordStrengthLabel(): string {
    switch (this.passwordStrengthScore) {
      case 0: case 1: return 'Very Weak';
      case 2:         return 'Weak';
      case 3:         return 'Fair';
      case 4:         return 'Strong';
      default:        return 'Very Strong';
    }
  }

  get passwordStrengthClass(): string {
    switch (this.passwordStrengthScore) {
      case 0: case 1: return 'strength-1';
      case 2:         return 'strength-2';
      case 3:         return 'strength-3';
      case 4:         return 'strength-4';
      default:        return 'strength-5';
    }
  }

  /** Show hints once the user starts typing */
  get showPasswordHints(): boolean {
    return (this.pwForm.newPassword?.length ?? 0) > 0;
  }

  // ── Change password ───────────────────────────────────────────────────────
  submitPasswordChange(): void {
    if (!this.pwForm.currentPassword || !this.pwForm.newPassword || !this.pwForm.confirmPassword) {
      this.pwError = 'All password fields are required.';
      return;
    }
    if (this.pwForm.newPassword !== this.pwForm.confirmPassword) {
      this.pwError = 'New password and confirm password do not match.';
      return;
    }

    // ── Same strong-password rules as register ────────────────────────────
    const r = this.passwordRules;
    if (!r.minLength)  { this.pwError = 'Password must be at least 8 characters.';             return; }
    if (!r.hasUpper)   { this.pwError = 'Password must include at least one uppercase letter.'; return; }
    if (!r.hasLower)   { this.pwError = 'Password must include at least one lowercase letter.'; return; }
    if (!r.hasNumeric) { this.pwError = 'Password must include at least one number.';           return; }
    if (!r.hasSpecial) { this.pwError = 'Password must include at least one special character (!@#$%…).'; return; }

    this.pwSaving  = true;
    this.pwError   = '';
    this.pwSuccess = '';

    this.profileService.changePassword(this.pwForm).subscribe({
      next: () => {
        this.pwSaving  = false;
        this.pwSuccess = 'Password changed successfully.';
        this.resetPwForm();
        setTimeout(() => this.pwSuccess = '', 4000);
      },
      error: err => { this.pwError = err?.error?.message ?? 'Failed to change password.'; this.pwSaving = false; }
    });
  }

  private resetPwForm(): void {
    this.pwForm = { currentPassword: '', newPassword: '', confirmPassword: '' };
    this.showCurrent = false;
    this.showNew     = false;
    this.showConfirm = false;
  }

  // ── Helpers ───────────────────────────────────────────────────────────────
  get initials(): string {
    if (!this.profile) return '?';
    return this.profileService.getInitials(this.profile.firstName, this.profile.lastName);
  }

  get fullName(): string {
    if (!this.profile) return '';
    return `${this.profile.firstName} ${this.profile.lastName}`;
  }

  get memberSince(): string {
    if (!this.profile?.createdAt) return '';
    return this.profileService.formatMemberSince(this.profile.createdAt);
  }
}