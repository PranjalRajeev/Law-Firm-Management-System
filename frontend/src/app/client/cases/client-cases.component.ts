import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-client-cases',
  templateUrl: './client-cases.component.html',
  styleUrls:  ['./client-cases.component.scss']
})
export class ClientCasesComponent implements OnInit {

  // ── Tabs ──────────────────────────────────────────────────────────────────
  activeTab: 'cases' | 'requests' = 'cases';

  // ── Cases ─────────────────────────────────────────────────────────────────
  cases:         any[] = [];
  filteredCases: any[] = [];
  isLoadingCases = true;
  filterStatus   = '';

  caseStatuses = ['OPEN', 'IN_PROGRESS', 'CLOSED', 'SETTLED', 'DISMISSED', 'APPEALED'];

  // ── Case detail panel ─────────────────────────────────────────────────────
  selectedCase:   any    = null;
  caseDocuments:  any[]  = [];
  isLoadingDetail = false;
  detailOpen      = false;

  // ── Requests ──────────────────────────────────────────────────────────────
  requests:         any[] = [];
  isLoadingRequests = true;
  pendingCount      = 0;

  // ── Raise request modal ───────────────────────────────────────────────────
  raiseModalOpen = false;
  raiseForm!:    FormGroup;
  isSubmitting   = false;

  caseTypes  = ['CRIMINAL','CIVIL','FAMILY','CORPORATE','REAL_ESTATE',
                'IMMIGRATION','TAX','LABOR','INTELLECTUAL_PROPERTY','OTHER'];
  urgencies  = ['LOW','MEDIUM','HIGH','CRITICAL'];

  constructor(
    private http:     HttpClient,
    private fb:       FormBuilder,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.buildRaiseForm();
    this.loadCases();
    this.loadRequests();
  }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('authToken');
    return new HttpHeaders({ 'Authorization': `Bearer ${token}` });
  }

  // ── Load cases ────────────────────────────────────────────────────────────
  loadCases(): void {
    this.isLoadingCases = true;
    this.http.get<any[]>(`${environment.apiUrl}/client/cases/my`, { headers: this.getHeaders() })
      .subscribe({
        next: (data) => {
          this.cases         = data;
          this.filteredCases = data;
          this.isLoadingCases = false;
        },
        error: (err) => { console.error(err); this.isLoadingCases = false; }
      });
  }

  applyFilter(): void {
    this.filteredCases = this.filterStatus
      ? this.cases.filter(c => c.status === this.filterStatus)
      : [...this.cases];
  }

  clearFilter(): void {
    this.filterStatus  = '';
    this.filteredCases = [...this.cases];
  }

  // ── Case detail panel ─────────────────────────────────────────────────────
  openDetail(c: any): void {
    this.selectedCase   = c;
    this.caseDocuments  = [];
    this.detailOpen     = true;
    this.isLoadingDetail = true;

    this.http.get<any[]>(
      `${environment.apiUrl}/client/cases/my/${c.id}/documents`,
      { headers: this.getHeaders() }
    ).subscribe({
      next:  (docs) => { this.caseDocuments = docs; this.isLoadingDetail = false; },
      error: ()     => { this.isLoadingDetail = false; }
    });
  }

  closeDetail(): void {
    this.detailOpen   = false;
    this.selectedCase = null;
  }

  // ── Status timeline helpers ───────────────────────────────────────────────
  getTimelineSteps(): { label: string; done: boolean; active: boolean }[] {
    const order = ['OPEN', 'IN_PROGRESS', 'CLOSED'];
    const status = this.selectedCase?.status;
    const idx    = order.indexOf(status);
    return order.map((s, i) => ({
      label:  s.replace('_', ' '),
      done:   i < idx,
      active: i === idx
    }));
  }

  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      OPEN: 'csb--open', IN_PROGRESS: 'csb--in_progress',
      CLOSED: 'csb--closed', SETTLED: 'csb--settled',
      DISMISSED: 'csb--dismissed', APPEALED: 'csb--appealed'
    };
    return map[status] || '';
  }

  getUrgencyClass(urgency: string): string {
    const map: Record<string, string> = {
      LOW: 'urg--low', MEDIUM: 'urg--medium',
      HIGH: 'urg--high', CRITICAL: 'urg--critical'
    };
    return map[urgency] || '';
  }

  getRequestStatusClass(status: string): string {
    const map: Record<string, string> = {
      PENDING: 'req--pending', ACCEPTED: 'req--accepted', REJECTED: 'req--rejected'
    };
    return map[status] || '';
  }

  formatFileSize(bytes: number): string {
    if (!bytes) return '—';
    if (bytes < 1024)       return `${bytes} B`;
    if (bytes < 1048576)    return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1048576).toFixed(1)} MB`;
  }

  // ── Load requests ─────────────────────────────────────────────────────────
  loadRequests(): void {
    this.isLoadingRequests = true;
    this.http.get<any[]>(`${environment.apiUrl}/client/requests`, { headers: this.getHeaders() })
      .subscribe({
        next: (data) => {
          this.requests          = data;
          this.pendingCount      = data.filter(r => r.status === 'PENDING').length;
          this.isLoadingRequests = false;
        },
        error: (err) => { console.error(err); this.isLoadingRequests = false; }
      });
  }

  // ── Raise request modal ───────────────────────────────────────────────────
  private buildRaiseForm(): void {
    this.raiseForm = this.fb.group({
      title:       ['', [Validators.required, Validators.maxLength(200)]],
      description: ['', [Validators.required, Validators.minLength(20)]],
      caseType:    ['', Validators.required],
      urgency:     ['MEDIUM', Validators.required]
    });
  }

  openRaiseModal(): void {
    this.raiseForm.reset({ urgency: 'MEDIUM' });
    this.raiseModalOpen = true;
  }

  closeRaiseModal(): void { this.raiseModalOpen = false; }

  submitRequest(): void {
    if (this.raiseForm.invalid) { this.raiseForm.markAllAsTouched(); return; }
    this.isSubmitting = true;

    this.http.post<any>(
      `${environment.apiUrl}/client/requests`,
      this.raiseForm.value,
      { headers: this.getHeaders() }
    ).subscribe({
      next: (req) => {
        this.requests.unshift(req);
        this.pendingCount++;
        this.isSubmitting   = false;
        this.raiseModalOpen = false;
        this.snackBar.open('Case request submitted! Lawyers will be notified.', 'Close', { duration: 4000 });
        this.activeTab = 'requests'; // switch to requests tab so user sees it
      },
      error: (err) => {
        this.isSubmitting = false;
        this.snackBar.open(err?.error?.message || 'Failed to submit request.', 'Close', { duration: 4000 });
      }
    });
  }

  // ── Cancel request ────────────────────────────────────────────────────────
  cancelRequest(id: number): void {
    if (!confirm('Cancel this request? This cannot be undone.')) return;
    this.http.delete(`${environment.apiUrl}/client/requests/${id}`, { headers: this.getHeaders() })
      .subscribe({
        next: () => {
          this.requests    = this.requests.filter(r => r.id !== id);
          this.pendingCount = this.requests.filter(r => r.status === 'PENDING').length;
          this.snackBar.open('Request cancelled.', 'Close', { duration: 3000 });
        },
        error: (err) => console.error(err)
      });
  }
}