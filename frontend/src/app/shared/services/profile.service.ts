// src/app/shared/services/profile.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  ChangePasswordRequest, UpdateProfileRequest, UserDto
} from '../models/profile.model';

@Injectable({ providedIn: 'root' })
export class ProfileService {

  private clientBase = `${environment.apiUrl}/client/profile`;
  private lawyerBase = `${environment.apiUrl}/lawyer/profile`;

  constructor(private http: HttpClient) {}

  // ── Client ────────────────────────────────────────────────────────────────

  /** GET /api/client/profile */
  getProfile(): Observable<UserDto> {
    return this.http.get<UserDto>(this.clientBase);
  }

  /** PUT /api/client/profile */
  updateProfile(request: UpdateProfileRequest): Observable<UserDto> {
    return this.http.put<UserDto>(this.clientBase, request);
  }

  /** PUT /api/client/profile/change-password */
  changePassword(request: ChangePasswordRequest): Observable<void> {
    return this.http.put<void>(`${this.clientBase}/change-password`, request);
  }

  // ── Lawyer ────────────────────────────────────────────────────────────────

  /** GET /api/lawyer/profile */
  getLawyerProfile(): Observable<UserDto> {
    return this.http.get<UserDto>(this.lawyerBase);
  }

  /** PUT /api/lawyer/profile */
  updateLawyerProfile(request: UpdateProfileRequest): Observable<UserDto> {
    return this.http.put<UserDto>(this.lawyerBase, request);
  }

  /** PUT /api/lawyer/profile/change-password */
  changeLawyerPassword(request: ChangePasswordRequest): Observable<void> {
    return this.http.put<void>(`${this.lawyerBase}/change-password`, request);
  }

  // ── Shared helpers ────────────────────────────────────────────────────────

  /** Get initials from full name for avatar */
  getInitials(firstName: string, lastName: string): string {
    return `${firstName?.charAt(0) ?? ''}${lastName?.charAt(0) ?? ''}`.toUpperCase();
  }

  /** Format ISO date → "Member since Jan 2025" */
  formatMemberSince(iso: string): string {
    return 'Member since ' + new Date(iso).toLocaleDateString('en-IN', {
      month: 'short', year: 'numeric'
    });
  }
}