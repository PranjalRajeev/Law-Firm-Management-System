import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { environment } from '../../../environments/environment';

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────
@Component({
  selector: 'app-manage-cases',
  templateUrl: './manage-cases.component.html',
  styleUrls: ['./manage-cases.component.scss']
})
export class ManageCasesComponent implements OnInit {

  // ── Data ────────────────────────────────────────────────────────────────────
  cases:         any[] = [];
  filteredCases: any[] = [];
  lawyers:       any[] = [];
  clients:       any[] = [];
  isLoading = true;

  // ── Filters ─────────────────────────────────────────────────────────────────
  searchText   = '';
  filterStatus = '';

  // ── Reference lists ──────────────────────────────────────────────────────────
  caseStatuses = ['OPEN', 'IN_PROGRESS', 'CLOSED', 'SETTLED', 'DISMISSED', 'APPEALED'];
  caseTypes    = ['CRIMINAL', 'CIVIL', 'FAMILY', 'CORPORATE', 'REAL_ESTATE',
                  'IMMIGRATION', 'TAX', 'LABOR', 'INTELLECTUAL_PROPERTY', 'OTHER'];

  // ── Case modal state ─────────────────────────────────────────────────────────
  caseDialogOpen    = false;
  caseDialogMode:   'create' | 'edit' = 'create';
  caseDialogLoading = false;
  editingCase:      any = null;
  caseForm!:        FormGroup;

  // ── Assign lawyer modal state ─────────────────────────────────────────────────
  assignDialogOpen  = false;
  assigningCase:    any = null;
  selectedLawyerId: number | null = null;

  constructor(
    private http:     HttpClient,
    private snackBar: MatSnackBar,
    private fb:       FormBuilder
  ) {}

  ngOnInit(): void { this.loadData(); }

  // ── HTTP helper ───────────────────────────────────────────────────────────────
  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('authToken');
    return new HttpHeaders({ 'Authorization': `Bearer ${token}` });
  }

  // ── Load ──────────────────────────────────────────────────────────────────────
  loadData(): void {
    this.isLoading = true;
    const headers = this.getHeaders();

    this.http.get<any[]>(`${environment.apiUrl}/admin/cases`, { headers })
      .subscribe({
        next: (data) => { this.cases = data; this.filteredCases = data; this.isLoading = false; },
        error: (err)  => { console.error(err); this.isLoading = false; }
      });

    this.http.get<any[]>(`${environment.apiUrl}/admin/users/role/ROLE_LAWYER`, { headers })
      .subscribe({ next: (data) => this.lawyers = data });

    this.http.get<any[]>(`${environment.apiUrl}/admin/users/role/ROLE_CLIENT`, { headers })
      .subscribe({ next: (data) => this.clients = data });
  }

  // ── Filter ────────────────────────────────────────────────────────────────────
  applyFilter(): void {
    this.filteredCases = this.cases.filter(c => {
      const s = this.searchText.toLowerCase();
      const matchesSearch = !s ||
        c.title?.toLowerCase().includes(s)      ||
        c.caseNumber?.toLowerCase().includes(s) ||
        c.clientName?.toLowerCase().includes(s) ||
        c.lawyerName?.toLowerCase().includes(s);

      const matchesStatus = !this.filterStatus || c.status === this.filterStatus;
      return matchesSearch && matchesStatus;
    });
  }

  // ── Case modal ────────────────────────────────────────────────────────────────
  private buildCaseForm(c?: any): void {
    this.caseForm = this.fb.group({
      caseNumber:      [c?.caseNumber      || '', Validators.required],
      title:           [c?.title           || '', Validators.required],
      description:     [c?.description     || ''],
      caseType:        [c?.caseType        || ''],
      status:          [c?.status          || 'OPEN'],
      feesCharged:     [c?.feesCharged     || null],
      clientId:        [c?.clientId        ?? null],
      lawyerId:        [c?.lawyerId        ?? null],
      courtName:       [c?.courtName       || ''],
      judgeName:       [c?.judgeName       || ''],
      opposingCounsel: [c?.opposingCounsel || '']
    });
  }

  openCreateDialog(): void {
    this.caseDialogMode = 'create';
    this.editingCase    = null;
    this.buildCaseForm();
    this.caseDialogOpen = true;
  }

  openEditDialog(caseItem: any): void {
    this.caseDialogMode = 'edit';
    this.editingCase    = caseItem;
    this.buildCaseForm(caseItem);
    this.caseDialogOpen = true;
  }

  closeCaseDialog(): void { this.caseDialogOpen = false; }

  submitCaseDialog(): void {
    if (this.caseForm.invalid) { this.caseForm.markAllAsTouched(); return; }

    if (this.caseDialogMode === 'create') {
      this.createCase(this.caseForm.value);
    } else {
      this.updateCase(this.editingCase.id, this.caseForm.value);
    }
  }

  // ── Assign lawyer modal ───────────────────────────────────────────────────────
  openAssignDialog(caseItem: any): void {
    this.assigningCase    = caseItem;
    this.selectedLawyerId = caseItem.lawyerId ?? null;
    this.assignDialogOpen = true;
  }

  closeAssignDialog(): void { this.assignDialogOpen = false; }

  submitAssign(): void {
    if (!this.selectedLawyerId || !this.assigningCase) return;
    this.assignLawyer(this.assigningCase.id, this.selectedLawyerId);
    this.assignDialogOpen = false;
  }

  // ── CRUD ──────────────────────────────────────────────────────────────────────
  createCase(data: any): void {
    this.caseDialogLoading = true;
    this.http.post<any>(`${environment.apiUrl}/admin/cases`, data, { headers: this.getHeaders() })
      .subscribe({
        next: (newCase) => {
          this.cases.unshift(newCase);
          this.applyFilter();
          this.caseDialogLoading = false;
          this.caseDialogOpen    = false;
          this.snackBar.open('Case created successfully!', 'Close', { duration: 3000 });
        },
        error: (err) => {
          this.caseDialogLoading = false;
          this.snackBar.open('Failed to create case.', 'Close', { duration: 3000 });
          console.error(err);
        }
      });
  }

  updateCase(id: number, data: any): void {
    this.caseDialogLoading = true;
    this.http.put<any>(`${environment.apiUrl}/admin/cases/${id}`, data, { headers: this.getHeaders() })
      .subscribe({
        next: (updated) => {
          const i = this.cases.findIndex(c => c.id === id);
          if (i !== -1) this.cases[i] = updated;
          this.applyFilter();
          this.caseDialogLoading = false;
          this.caseDialogOpen    = false;
          this.snackBar.open('Case updated successfully!', 'Close', { duration: 3000 });
        },
        error: (err) => {
          this.caseDialogLoading = false;
          this.snackBar.open('Failed to update case.', 'Close', { duration: 3000 });
          console.error(err);
        }
      });
  }

  deleteCase(id: number): void {
    if (!confirm('Are you sure you want to delete this case?')) return;
    this.http.delete(`${environment.apiUrl}/admin/cases/${id}`, { headers: this.getHeaders() })
      .subscribe({
        next: () => {
          this.cases = this.cases.filter(c => c.id !== id);
          this.applyFilter();
          this.snackBar.open('Case deleted.', 'Close', { duration: 3000 });
        },
        error: (err) => console.error(err)
      });
  }

  assignLawyer(caseId: number, lawyerId: number): void {
    this.http.put<any>(
      `${environment.apiUrl}/admin/cases/${caseId}/assign-lawyer/${lawyerId}`,
      {},
      { headers: this.getHeaders() }
    ).subscribe({
      next: (updated) => {
        const i = this.cases.findIndex(c => c.id === caseId);
        if (i !== -1) this.cases[i] = updated;
        this.applyFilter();
        this.snackBar.open('Lawyer assigned!', 'Close', { duration: 3000 });
      },
      error: (err) => console.error(err)
    });
  }

  // ── Display helper ────────────────────────────────────────────────────────────
  getStatusColor(status: string): string {
    switch (status) {
      case 'OPEN':        return '#4EB87A';
      case 'IN_PROGRESS': return '#6FA3D4';
      case 'CLOSED':      return '#6B6560';
      case 'SETTLED':     return '#C9A84C';
      case 'DISMISSED':   return '#d46060';
      case 'APPEALED':    return '#b09ddd';
      default:            return '#6B6560';
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Stub classes kept so admin.module.ts declarations compile without changes.
// These are empty shells — all UI is now inline in the main component template.
// ─────────────────────────────────────────────────────────────────────────────
import { Component as Comp, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Comp({ selector: 'app-case-dialog', template: '' })
export class CaseDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<CaseDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}
}

@Comp({ selector: 'app-assign-lawyer-dialog', template: '' })
export class AssignLawyerDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<AssignLawyerDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}
}