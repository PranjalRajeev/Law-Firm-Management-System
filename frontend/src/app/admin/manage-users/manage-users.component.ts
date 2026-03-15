import { Component, OnInit, Inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { MatDialog, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-manage-users',
  templateUrl: './manage-users.component.html',
  styleUrls: ['./manage-users.component.scss']
})
export class ManageUsersComponent implements OnInit {
  users: any[] = [];
  filteredUsers: any[] = [];
  isLoading = true;
  searchText = '';
  filterRole = '';

  displayedColumns = ['avatar', 'name', 'email', 'phone', 'role', 'status', 'createdAt', 'actions'];
  roles = ['ROLE_ADMIN', 'ROLE_LAWYER', 'ROLE_CLIENT'];

  constructor(
    private http: HttpClient,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('authToken');
    return new HttpHeaders({ 'Authorization': `Bearer ${token}` });
  }

  loadUsers(): void {
    this.isLoading = true;
    this.http.get<any[]>(`${environment.apiUrl}/admin/users`, { headers: this.getHeaders() })
      .subscribe({
        next: (data) => {
          this.users = data;
          this.filteredUsers = data;
          this.isLoading = false;
        },
        error: (err) => { console.error(err); this.isLoading = false; }
      });
  }

  applyFilter(): void {
    this.filteredUsers = this.users.filter(u => {
      const matchesSearch = !this.searchText ||
        u.firstName?.toLowerCase().includes(this.searchText.toLowerCase()) ||
        u.lastName?.toLowerCase().includes(this.searchText.toLowerCase()) ||
        u.email?.toLowerCase().includes(this.searchText.toLowerCase()) ||
        u.username?.toLowerCase().includes(this.searchText.toLowerCase());

      const matchesRole = !this.filterRole ||
        u.roles?.includes(this.filterRole);

      return matchesSearch && matchesRole;
    });
  }

  openCreateDialog(): void {
    const ref = this.dialog.open(UserDialogComponent, {
      width: '600px',
      maxHeight: '90vh',
      data: { mode: 'create' }
    });
    ref.afterClosed().subscribe(result => {
      if (result) this.createUser(result);
    });
  }

  openEditDialog(user: any): void {
    const ref = this.dialog.open(UserDialogComponent, {
      width: '600px',
      maxHeight: '90vh',
      data: { mode: 'edit', user }
    });
    ref.afterClosed().subscribe(result => {
      if (result) this.updateUser(user.id, result);
    });
  }

  createUser(data: any): void {
    this.http.post<any>(`${environment.apiUrl}/admin/users`, data, { headers: this.getHeaders() })
      .subscribe({
        next: (newUser) => {
          this.users.unshift(newUser);
          this.applyFilter();
          this.snackBar.open('User created successfully!', 'Close', { duration: 3000 });
        },
        error: (err) => {
          console.error(err);
          this.snackBar.open(err?.error?.message || 'Failed to create user.', 'Close', { duration: 3000 });
        }
      });
  }

  updateUser(id: number, data: any): void {
    this.http.put<any>(`${environment.apiUrl}/admin/users/${id}`, data, { headers: this.getHeaders() })
      .subscribe({
        next: (updated) => {
          const index = this.users.findIndex(u => u.id === id);
          if (index !== -1) this.users[index] = updated;
          this.applyFilter();
          this.snackBar.open('User updated successfully!', 'Close', { duration: 3000 });
        },
        error: (err) => {
          console.error(err);
          this.snackBar.open('Failed to update user.', 'Close', { duration: 3000 });
        }
      });
  }

  deleteUser(id: number): void {
    if (!confirm('Are you sure you want to delete this user?')) return;
    this.http.delete(`${environment.apiUrl}/admin/users/${id}`, { headers: this.getHeaders() })
      .subscribe({
        next: () => {
          this.users = this.users.filter(u => u.id !== id);
          this.applyFilter();
          this.snackBar.open('User deleted.', 'Close', { duration: 3000 });
        },
        error: (err) => console.error(err)
      });
  }

  toggleStatus(user: any): void {
    const newStatus = user.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    this.http.put<any>(
      `${environment.apiUrl}/admin/users/${user.id}/status?status=${newStatus}`,
      {},
      { headers: this.getHeaders() }
    ).subscribe({
      next: (updated) => {
        const index = this.users.findIndex(u => u.id === user.id);
        if (index !== -1) this.users[index] = updated;
        this.applyFilter();
        this.snackBar.open(`User ${newStatus.toLowerCase()}.`, 'Close', { duration: 3000 });
      },
      error: (err) => console.error(err)
    });
  }

  getRoleDisplay(roles: string[]): string {
    if (!roles || roles.length === 0) return 'Unknown';
    if (roles.includes('ROLE_ADMIN')) return 'Admin';
    if (roles.includes('ROLE_LAWYER')) return 'Lawyer';
    return 'Client';
  }

  getRoleColor(roles: string[]): string {
    if (!roles || roles.length === 0) return 'default';
    if (roles.includes('ROLE_ADMIN')) return 'admin';
    if (roles.includes('ROLE_LAWYER')) return 'lawyer';
    return 'client';
  }

  getInitials(user: any): string {
    return `${user.firstName?.charAt(0) || ''}${user.lastName?.charAt(0) || ''}`.toUpperCase();
  }

  getAvatarColor(user: any): string {
    const colors = ['#1976d2', '#388e3c', '#7b1fa2', '#f57c00', '#0097a7', '#c62828'];
    const index = (user.id || 0) % colors.length;
    return colors[index];
  }
}

// ─── User Dialog Component ────────────────────────────────────────────────────
@Component({
  selector: 'app-user-dialog',
  template: `
    <h2 mat-dialog-title>
      <mat-icon>{{ data.mode === 'create' ? 'person_add' : 'edit' }}</mat-icon>
      {{ data.mode === 'create' ? 'Create New User' : 'Edit User' }}
    </h2>
    <mat-dialog-content>
      <form [formGroup]="form" class="dialog-form">

        <div class="form-row">
          <mat-form-field appearance="outline" class="half">
            <mat-label>First Name</mat-label>
            <input matInput formControlName="firstName">
            <mat-error *ngIf="form.get('firstName')?.hasError('required')">Required</mat-error>
          </mat-form-field>
          <mat-form-field appearance="outline" class="half">
            <mat-label>Last Name</mat-label>
            <input matInput formControlName="lastName">
            <mat-error *ngIf="form.get('lastName')?.hasError('required')">Required</mat-error>
          </mat-form-field>
        </div>

        <mat-form-field appearance="outline" class="full">
          <mat-label>Username</mat-label>
          <input matInput formControlName="username" [readonly]="data.mode === 'edit'">
          <mat-error *ngIf="form.get('username')?.hasError('required')">Required</mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full">
          <mat-label>Email</mat-label>
          <input matInput formControlName="email" type="email">
          <mat-error *ngIf="form.get('email')?.hasError('required')">Required</mat-error>
          <mat-error *ngIf="form.get('email')?.hasError('email')">Invalid email</mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full">
          <mat-label>{{ data.mode === 'create' ? 'Password' : 'New Password (leave blank to keep current)' }}</mat-label>
          <input matInput formControlName="password" type="password">
          <mat-error *ngIf="form.get('password')?.hasError('required')">Required</mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full">
          <mat-label>Role</mat-label>
          <mat-select formControlName="role" (selectionChange)="onRoleChange($event.value)">
            <mat-option value="ROLE_ADMIN">Admin</mat-option>
            <mat-option value="ROLE_LAWYER">Lawyer</mat-option>
            <mat-option value="ROLE_CLIENT">Client</mat-option>
          </mat-select>
          <mat-error *ngIf="form.get('role')?.hasError('required')">Required</mat-error>
        </mat-form-field>

        <div class="form-row">
          <mat-form-field appearance="outline" class="half">
            <mat-label>Phone Number</mat-label>
            <input matInput formControlName="phoneNumber">
          </mat-form-field>
          <mat-form-field appearance="outline" class="half">
            <mat-label>Address</mat-label>
            <input matInput formControlName="address">
          </mat-form-field>
        </div>

        <!-- Lawyer specific fields -->
        <div *ngIf="isLawyer" class="lawyer-fields">
          <mat-divider style="margin: 8px 0 16px"></mat-divider>
          <p class="section-label">Lawyer Details</p>
          <div class="form-row">
            <mat-form-field appearance="outline" class="half">
              <mat-label>Bar Number</mat-label>
              <input matInput formControlName="barNumber">
            </mat-form-field>
            <mat-form-field appearance="outline" class="half">
              <mat-label>Years of Experience</mat-label>
              <input matInput type="number" formControlName="yearsOfExperience">
            </mat-form-field>
          </div>
          <mat-form-field appearance="outline" class="full">
            <mat-label>Specialization</mat-label>
            <input matInput formControlName="specialization">
          </mat-form-field>
        </div>

      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="dialogRef.close()">Cancel</button>
      <button mat-raised-button color="primary"
              (click)="submit()"
              [disabled]="form.invalid">
        {{ data.mode === 'create' ? 'Create User' : 'Update User' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    h2 { display: flex; align-items: center; gap: 8px; }
    .dialog-form { display: flex; flex-direction: column; gap: 4px; padding: 8px 0; }
    .form-row { display: flex; gap: 12px; }
    .half { flex: 1; }
    .full { width: 100%; }
    mat-dialog-content { max-height: 65vh; overflow-y: auto; min-width: 400px; }
    .section-label { font-weight: 600; color: #1a237e; margin: 0 0 8px; font-size: 0.9rem; }
    .lawyer-fields { width: 100%; }
  `]
})
export class UserDialogComponent {
  form: FormGroup;
  isLawyer = false;

  constructor(
    public dialogRef: MatDialogRef<UserDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder
  ) {
    const existingRole = data.user?.roles?.[0] || 'ROLE_CLIENT';
    this.isLawyer = existingRole === 'ROLE_LAWYER';

    this.form = this.fb.group({
      firstName: [data.user?.firstName || '', Validators.required],
      lastName: [data.user?.lastName || '', Validators.required],
      username: [data.user?.username || '', Validators.required],
      email: [data.user?.email || '', [Validators.required, Validators.email]],
      password: [
        '',
        data.mode === 'create' ? [Validators.required, Validators.minLength(6)] : []
      ],
      role: [existingRole, Validators.required],
      phoneNumber: [data.user?.phoneNumber || ''],
      address: [data.user?.address || ''],
      barNumber: [data.user?.barNumber || ''],
      specialization: [data.user?.specialization || ''],
      yearsOfExperience: [data.user?.yearsOfExperience || null]
    });
  }

  onRoleChange(role: string): void {
    this.isLawyer = role === 'ROLE_LAWYER';
  }

  submit(): void {
    if (this.form.valid) {
      const value = this.form.value;
      if (!value.password) delete value.password;
      this.dialogRef.close(value);
    }
  }
}