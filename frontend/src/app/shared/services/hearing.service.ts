// src/app/shared/services/hearing.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { GroupedHearingsDto, HearingDto } from '../models/hearing.model';

@Injectable({ providedIn: 'root' })
export class HearingService {

  private base = `${environment.apiUrl}/client`;

  constructor(private http: HttpClient) {}

  /**
   * GET /api/client/hearings/grouped
   * Main hearings page — upcoming + past split
   */
  getGroupedHearings(): Observable<GroupedHearingsDto> {
    return this.http.get<GroupedHearingsDto>(`${this.base}/hearings/grouped`);
  }

  /**
   * GET /api/client/hearings
   * Flat list of all hearings
   */
  getAllHearings(): Observable<HearingDto[]> {
    return this.http.get<HearingDto[]>(`${this.base}/hearings`);
  }

  /**
   * GET /api/client/hearings/:id
   * Single hearing detail
   */
  getHearingDetail(id: number): Observable<HearingDto> {
    return this.http.get<HearingDto>(`${this.base}/hearings/${id}`);
  }

  /**
   * GET /api/client/cases/:caseId/hearings
   * All hearings for one case
   */
  getHearingsForCase(caseId: number): Observable<HearingDto[]> {
    return this.http.get<HearingDto[]>(`${this.base}/cases/${caseId}/hearings`);
  }
}