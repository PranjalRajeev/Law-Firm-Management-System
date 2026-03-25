// src/app/shared/services/lawyer-profile.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  ChangePasswordRequest, UpdateProfileRequest, UserDto
} from '../models/profile.model';

@Injectable({ providedIn: 'root' })
export class LawyerProfileService {

  private base = `${environment.apiUrl}/lawyer/profile`;

  constructor(private http: HttpClient) {}

  /** GET /api/lawyer/profile */
  getProfile(): Observable<UserDto> {
    return this.http.get<UserDto>(this.base);
  }

  /** PUT /api/lawyer/profile */
  updateProfile(request: UpdateProfileRequest): Observable<UserDto> {
    return this.http.put<UserDto>(this.base, request);
  }

  /** PUT /api/lawyer/profile/change-password */
  changePassword(request: ChangePasswordRequest): Observable<void> {
    return this.http.put<void>(`${this.base}/change-password`, request);
  }

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
