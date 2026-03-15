import { Component, OnInit, Inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { MatDialog, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-manage-cases',
  templateUrl: './manage-cases.component.html',
  styleUrls: ['./manage-cases.component.scss']
})
export class ManageCasesComponent implements OnInit {
  cases: any[] = [];
  filteredCases: any[] = [];
  lawyers: any[] = [];
  clients: any[] = [];
  isLoading = true;
  searchText = '';
  filterStatus = '';

  displayedColumns = ['caseNumber', 'title', 'client', 'lawyer', 'type', 'status', 'dateOpened', 'actions'];

  caseStatuses = ['OPEN', 'IN_PROGRESS', 'CLOSED', 'SETTLED', 'DISMISSED', 'APPEALED'];
  caseTypes = ['CRIMINAL', 'CIVIL', 'FAMILY', 'CORPORATE', 'REAL_ESTATE', 'IMMIGRATION', 'TAX', 'LABOR', 'INTELLECTUAL_PROPERTY', 'OTHER'];

  constructor(
    private http: HttpClient,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('authToken');
    return new HttpHeaders({ 'Authorization': `Bearer ${token}` });
  }

  loadData(): void {
    this.isLoading = true;
    const headers = this.getHeaders();

    this.http.get<any[]>(`${environment.apiUrl}/admin/cases`, { headers })
      .subscribe({
        next: (data) => {
          this.cases = data;
          this.filteredCases = data;
          this.isLoading = false;
        },
        error: (err) => { console.error(err); this.isLoading = false; }
      });

    this.http.get<any[]>(`${environment.apiUrl}/admin/users/role/ROLE_LAWYER`, { headers })
      .subscribe({ next: (data) => this.lawyers = data });

    this.http.get<any[]>(`${environment.apiUrl}/admin/users/role/ROLE_CLIENT`, { headers })
      .subscribe({ next: (data) => this.clients = data });
  }

  applyFilter(): void {
    this.filteredCases = this.cases.filter(c => {
      const matchesSearch = !this.searchText ||
        c.title?.toLowerCase().includes(this.searchText.toLowerCase()) ||
        c.caseNumber?.toLowerCase().includes(this.searchText.toLowerCase()) ||
        c.clientName?.toLowerCase().includes(this.searchText.toLowerCase()) ||
        c.lawyerName?.toLowerCase().includes(this.searchText.toLowerCase());

      const matchesStatus = !this.filterStatus || c.status === this.filterStatus;

      return matchesSearch && matchesStatus;
    });
  }

  openCreateDialog(): void {
    const ref = this.dialog.open(CaseDialogComponent, {
      width: '700px',
      maxHeight: '90vh',
      data: { mode: 'create', lawyers: this.lawyers, clients: this.clients }
    });

    ref.afterClosed().subscribe(result => {
      if (result) this.createCase(result);
    });
  }

  openEditDialog(caseItem: any): void {
    const ref = this.dialog.open(CaseDialogComponent, {
      width: '700px',
      maxHeight: '90vh',
      data: { mode: 'edit', case: caseItem, lawyers: this.lawyers, clients: this.clients }
    });

    ref.afterClosed().subscribe(result => {
      if (result) this.updateCase(caseItem.id, result);
    });
  }

  openAssignDialog(caseItem: any): void {
    const ref = this.dialog.open(AssignLawyerDialogComponent, {
      width: '400px',
      data: { case: caseItem, lawyers: this.lawyers }
    });

    ref.afterClosed().subscribe(lawyerId => {
      if (lawyerId) this.assignLawyer(caseItem.id, lawyerId);
    });
  }

  createCase(data: any): void {
    const headers = this.getHeaders();
    this.http.post<any>(`${environment.apiUrl}/admin/cases`, data, { headers })
      .subscribe({
        next: (newCase) => {
          this.cases.unshift(newCase);
          this.applyFilter();
          this.snackBar.open('Case created successfully!', 'Close', { duration: 3000 });
        },
        error: (err) => {
          console.error(err);
          this.snackBar.open('Failed to create case.', 'Close', { duration: 3000 });
        }
      });
  }

  updateCase(id: number, data: any): void {
    const headers = this.getHeaders();
    this.http.put<any>(`${environment.apiUrl}/admin/cases/${id}`, data, { headers })
      .subscribe({
        next: (updated) => {
          const index = this.cases.findIndex(c => c.id === id);
          if (index !== -1) this.cases[index] = updated;
          this.applyFilter();
          this.snackBar.open('Case updated successfully!', 'Close', { duration: 3000 });
        },
        error: (err) => {
          console.error(err);
          this.snackBar.open('Failed to update case.', 'Close', { duration: 3000 });
        }
      });
  }

  deleteCase(id: number): void {
    if (!confirm('Are you sure you want to delete this case?')) return;
    const headers = this.getHeaders();
    this.http.delete(`${environment.apiUrl}/admin/cases/${id}`, { headers })
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
    const headers = this.getHeaders();
    this.http.put<any>(`${environment.apiUrl}/admin/cases/${caseId}/assign-lawyer/${lawyerId}`, {}, { headers })
      .subscribe({
        next: (updated) => {
          const index = this.cases.findIndex(c => c.id === caseId);
          if (index !== -1) this.cases[index] = updated;
          this.applyFilter();
          this.snackBar.open('Lawyer assigned!', 'Close', { duration: 3000 });
        },
        error: (err) => console.error(err)
      });
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'OPEN': return '#43a047';
      case 'IN_PROGRESS': return '#1976d2';
      case 'CLOSED': return '#757575';
      case 'SETTLED': return '#fb8c00';
      case 'DISMISSED': return '#e53935';
      case 'APPEALED': return '#8e24aa';
      default: return '#757575';
    }
  }
}

// ─── Case Dialog Component ────────────────────────────────────────────────────
@Component({
  selector: 'app-case-dialog',
  template: `
    <h2 mat-dialog-title>{{ data.mode === 'create' ? 'Create New Case' : 'Edit Case' }}</h2>
    <mat-dialog-content>
      <form [formGroup]="form" class="dialog-form">
        <div class="form-row">
          <mat-form-field appearance="outline" class="half">
            <mat-label>Case Number</mat-label>
            <input matInput formControlName="caseNumber" placeholder="e.g. CASE-2024-001">
          </mat-form-field>
          <mat-form-field appearance="outline" class="half">
            <mat-label>Case Type</mat-label>
            <mat-select formControlName="caseType">
              <mat-option *ngFor="let t of caseTypes" [value]="t">{{ t }}</mat-option>
            </mat-select>
          </mat-form-field>
        </div>

        <mat-form-field appearance="outline" class="full">
          <mat-label>Title</mat-label>
          <input matInput formControlName="title" placeholder="Case title">
        </mat-form-field>

        <mat-form-field appearance="outline" class="full">
          <mat-label>Description</mat-label>
          <textarea matInput formControlName="description" rows="3" placeholder="Case description"></textarea>
        </mat-form-field>

        <div class="form-row">
          <mat-form-field appearance="outline" class="half">
            <mat-label>Status</mat-label>
            <mat-select formControlName="status">
              <mat-option *ngFor="let s of caseStatuses" [value]="s">{{ s }}</mat-option>
            </mat-select>
          </mat-form-field>
          <mat-form-field appearance="outline" class="half">
            <mat-label>Fees Charged</mat-label>
            <input matInput type="number" formControlName="feesCharged" placeholder="0.00">
            <span matPrefix>₹ </span>
          </mat-form-field>
        </div>

        <div class="form-row">
          <mat-form-field appearance="outline" class="half">
            <mat-label>Assign Client</mat-label>
            <mat-select formControlName="clientId">
              <mat-option [value]="null">-- None --</mat-option>
              <mat-option *ngFor="let c of data.clients" [value]="c.id">
                {{ c.firstName }} {{ c.lastName }}
              </mat-option>
            </mat-select>
          </mat-form-field>
          <mat-form-field appearance="outline" class="half">
            <mat-label>Assign Lawyer</mat-label>
            <mat-select formControlName="lawyerId">
              <mat-option [value]="null">-- None --</mat-option>
              <mat-option *ngFor="let l of data.lawyers" [value]="l.id">
                {{ l.firstName }} {{ l.lastName }}
              </mat-option>
            </mat-select>
          </mat-form-field>
        </div>

        <div class="form-row">
          <mat-form-field appearance="outline" class="half">
            <mat-label>Court Name</mat-label>
            <input matInput formControlName="courtName">
          </mat-form-field>
          <mat-form-field appearance="outline" class="half">
            <mat-label>Judge Name</mat-label>
            <input matInput formControlName="judgeName">
          </mat-form-field>
        </div>

        <mat-form-field appearance="outline" class="full">
          <mat-label>Opposing Counsel</mat-label>
          <input matInput formControlName="opposingCounsel">
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="dialogRef.close()">Cancel</button>
      <button mat-raised-button color="primary"
              (click)="submit()"
              [disabled]="form.invalid">
        {{ data.mode === 'create' ? 'Create' : 'Update' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .dialog-form { display: flex; flex-direction: column; gap: 8px; padding: 8px 0; }
    .form-row { display: flex; gap: 12px; }
    .half { flex: 1; }
    .full { width: 100%; }
    mat-dialog-content { max-height: 65vh; overflow-y: auto; }
  `]
})
export class CaseDialogComponent {
  form: FormGroup;
  caseStatuses = ['OPEN', 'IN_PROGRESS', 'CLOSED', 'SETTLED', 'DISMISSED', 'APPEALED'];
  caseTypes = ['CRIMINAL', 'CIVIL', 'FAMILY', 'CORPORATE', 'REAL_ESTATE', 'IMMIGRATION', 'TAX', 'LABOR', 'INTELLECTUAL_PROPERTY', 'OTHER'];

  constructor(
    public dialogRef: MatDialogRef<CaseDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder
  ) {
    this.form = this.fb.group({
      caseNumber: [data.case?.caseNumber || '', Validators.required],
      title: [data.case?.title || '', Validators.required],
      description: [data.case?.description || ''],
      caseType: [data.case?.caseType || ''],
      status: [data.case?.status || 'OPEN'],
      feesCharged: [data.case?.feesCharged || null],
      clientId: [data.case?.clientId || null],
      lawyerId: [data.case?.lawyerId || null],
      courtName: [data.case?.courtName || ''],
      judgeName: [data.case?.judgeName || ''],
      opposingCounsel: [data.case?.opposingCounsel || '']
    });
  }

  submit(): void {
    if (this.form.valid) {
      this.dialogRef.close(this.form.value);
    }
  }
}

// ─── Assign Lawyer Dialog ─────────────────────────────────────────────────────
@Component({
  selector: 'app-assign-lawyer-dialog',
  template: `
    <h2 mat-dialog-title>Assign Lawyer</h2>
    <mat-dialog-content>
      <p>Case: <strong>{{ data.case.title }}</strong></p>
      <mat-form-field appearance="outline" style="width:100%">
        <mat-label>Select Lawyer</mat-label>
        <mat-select [(ngModel)]="selectedLawyerId">
          <mat-option *ngFor="let l of data.lawyers" [value]="l.id">
            {{ l.firstName }} {{ l.lastName }}
          </mat-option>
        </mat-select>
      </mat-form-field>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="dialogRef.close()">Cancel</button>
      <button mat-raised-button color="primary"
              (click)="dialogRef.close(selectedLawyerId)"
              [disabled]="!selectedLawyerId">
        Assign
      </button>
    </mat-dialog-actions>
  `
})
export class AssignLawyerDialogComponent {
  selectedLawyerId: number | null = null;

  constructor(
    public dialogRef: MatDialogRef<AssignLawyerDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}
}