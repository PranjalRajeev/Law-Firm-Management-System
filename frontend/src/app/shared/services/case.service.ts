import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Case, CreateCaseRequest } from '../models/case.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CaseService {
  private apiUrl = environment.apiUrl;

  constructor() {}

  getCases(): Observable<Case[]> {
    // TODO: Implement get cases API call
    throw new Error('Not implemented yet');
  }

  getCaseById(id: number): Observable<Case> {
    // TODO: Implement get case by ID API call
    throw new Error('Not implemented yet');
  }

  createCase(caseData: CreateCaseRequest): Observable<Case> {
    // TODO: Implement create case API call
    throw new Error('Not implemented yet');
  }

  updateCase(id: number, caseData: Partial<Case>): Observable<Case> {
    // TODO: Implement update case API call
    throw new Error('Not implemented yet');
  }

  deleteCase(id: number): Observable<void> {
    // TODO: Implement delete case API call
    throw new Error('Not implemented yet');
  }

  getCasesByLawyer(lawyerId: number): Observable<Case[]> {
    // TODO: Implement get cases by lawyer API call
    throw new Error('Not implemented yet');
  }

  getCasesByClient(clientId: number): Observable<Case[]> {
    // TODO: Implement get cases by client API call
    throw new Error('Not implemented yet');
  }

  searchCases(keyword: string): Observable<Case[]> {
    // TODO: Implement search cases API call
    throw new Error('Not implemented yet');
  }
}
