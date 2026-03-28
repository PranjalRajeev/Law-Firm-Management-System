import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-manage-users',
  templateUrl: './manage-users.component.html',
  styleUrls: ['./manage-users.component.scss']
})
export class ManageUsersComponent implements OnInit {

  // ── Data ────────────────────────────────────────────────────────────────────
  users:         any[] = [];
  filteredUsers: any[] = [];
  isLoading = true;

  // ── Filters ─────────────────────────────────────────────────────────────────
  searchText = '';
  filterRole = '';

  // ── Inline modal state ───────────────────────────────────────────────────────
  dialogOpen    = false;
  dialogMode:   'create' | 'edit' = 'create';
  dialogLoading = false;
  editingUser:  any = null;

  userForm!:   FormGroup;
  isLawyerRole = false;
  hideDialogPw = true;

  // ── Delete confirmation state (replaces browser confirm()) ───────────────────
  deleteConfirmOpen   = false;
  userToDelete:  any  = null;   // holds the full user object so we can show their name
  deleteLoading       = false;

  constructor(
    private http:     HttpClient,
    private snackBar: MatSnackBar,
    private fb:       FormBuilder
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  // ── HTTP helpers ─────────────────────────────────────────────────────────────
  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('authToken');
    return new HttpHeaders({ 'Authorization': `Bearer ${token}` });
  }

  // ── Load ─────────────────────────────────────────────────────────────────────
  loadUsers(): void {
    this.isLoading = true;
    this.http.get<any[]>(`${environment.apiUrl}/admin/users`, { headers: this.getHeaders() })
      .subscribe({
        next: (data) => {
          this.users         = data;
          this.filteredUsers = data;
          this.isLoading     = false;
        },
        error: (err) => { console.error(err); this.isLoading = false; }
      });
  }

  // ── Filter ───────────────────────────────────────────────────────────────────
  applyFilter(): void {
    this.filteredUsers = this.users.filter(u => {
      const s = this.searchText.toLowerCase();
      const matchesSearch = !s ||
        u.firstName?.toLowerCase().includes(s) ||
        u.lastName?.toLowerCase().includes(s)  ||
        u.email?.toLowerCase().includes(s)     ||
        u.username?.toLowerCase().includes(s);
      const matchesRole = !this.filterRole || u.roles?.includes(this.filterRole);
      return matchesSearch && matchesRole;
    });
  }

  // ── Modal helpers ─────────────────────────────────────────────────────────────
  private buildForm(user?: any, mode: 'create' | 'edit' = 'create'): void {
    const role = user?.roles?.[0] || 'ROLE_CLIENT';
    this.isLawyerRole = role === 'ROLE_LAWYER';

    this.userForm = this.fb.group({
      firstName:         [user?.firstName         || '', Validators.required],
      lastName:          [user?.lastName          || '', Validators.required],
      username:          [user?.username          || '', Validators.required],
      email:             [user?.email             || '', [Validators.required, Validators.email]],
      password:          ['', mode === 'create'
                                ? [Validators.required, Validators.minLength(6)]
                                : []],
      role:              [role,                          Validators.required],
      phoneNumber:       [user?.phoneNumber        || ''],
      address:           [user?.address            || ''],
      barNumber:         [user?.barNumber          || ''],
      specialization:    [user?.specialization     || ''],
      yearsOfExperience: [user?.yearsOfExperience  || null]
    });
  }

  openCreateDialog(): void {
    this.dialogMode   = 'create';
    this.editingUser  = null;
    this.hideDialogPw = true;
    this.buildForm(undefined, 'create');
    this.dialogOpen   = true;
  }

  openEditDialog(user: any): void {
    this.dialogMode   = 'edit';
    this.editingUser  = user;
    this.hideDialogPw = true;
    this.buildForm(user, 'edit');
    this.dialogOpen   = true;
  }

  closeDialog(): void {
    this.dialogOpen = false;
  }

  onRoleChange(role: string): void {
    this.isLawyerRole = role === 'ROLE_LAWYER';
  }

  submitDialog(): void {
    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      return;
    }
    const value = { ...this.userForm.value };
    if (!value.password) delete value.password;
    if (this.dialogMode === 'create') {
      this.createUser(value);
    } else {
      this.updateUser(this.editingUser.id, value);
    }
  }

  // ── Delete confirmation (inline — no browser popup) ──────────────────────────

  /** Called when the trash icon is clicked — opens the in-app confirm modal */
  confirmDelete(user: any): void {
    this.userToDelete       = user;
    this.deleteConfirmOpen  = true;
    this.deleteLoading      = false;
  }

  /** Called when user clicks "Cancel" inside the confirm modal */
  cancelDelete(): void {
    this.deleteConfirmOpen = false;
    this.userToDelete      = null;
  }

  /** Called when user clicks "Delete" inside the confirm modal */
  confirmDeleteExecute(): void {
    if (!this.userToDelete) return;
    this.deleteLoading = true;

    this.http.delete(
      `${environment.apiUrl}/admin/users/${this.userToDelete.id}`,
      { headers: this.getHeaders() }
    ).subscribe({
      next: () => {
        this.users = this.users.filter(u => u.id !== this.userToDelete.id);
        this.applyFilter();
        this.deleteLoading     = false;
        this.deleteConfirmOpen = false;
        this.userToDelete      = null;
        this.snackBar.open('User deleted successfully.', 'Close', { duration: 3000 });
      },
      error: (err) => {
        console.error(err);
        this.deleteLoading = false;
        this.snackBar.open('Failed to delete user.', 'Close', { duration: 3000 });
      }
    });
  }

  // ── CRUD ─────────────────────────────────────────────────────────────────────
  createUser(data: any): void {
    this.dialogLoading = true;
    this.http.post<any>(`${environment.apiUrl}/admin/users`, data, { headers: this.getHeaders() })
      .subscribe({
        next: (newUser) => {
          this.users.unshift(newUser);
          this.applyFilter();
          this.dialogLoading = false;
          this.dialogOpen    = false;
          this.snackBar.open('User created successfully!', 'Close', { duration: 3000 });
        },
        error: (err) => {
          this.dialogLoading = false;
          this.snackBar.open(err?.error?.message || 'Failed to create user.', 'Close', { duration: 3000 });
        }
      });
  }

  updateUser(id: number, data: any): void {
    this.dialogLoading = true;
    this.http.put<any>(`${environment.apiUrl}/admin/users/${id}`, data, { headers: this.getHeaders() })
      .subscribe({
        next: (updated) => {
          const i = this.users.findIndex(u => u.id === id);
          if (i !== -1) this.users[i] = updated;
          this.applyFilter();
          this.dialogLoading = false;
          this.dialogOpen    = false;
          this.snackBar.open('User updated successfully!', 'Close', { duration: 3000 });
        },
        error: (err) => {
          this.dialogLoading = false;
          this.snackBar.open('Failed to update user.', 'Close', { duration: 3000 });
        }
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
        const i = this.users.findIndex(u => u.id === user.id);
        if (i !== -1) this.users[i] = { ...this.users[i], ...updated };
        this.applyFilter();
        this.snackBar.open(`User ${newStatus.toLowerCase()}.`, 'Close', { duration: 3000 });
      },
      error: (err) => console.error(err)
    });
  }

  // ── Display helpers ───────────────────────────────────────────────────────────
  getRoleDisplay(roles: string[]): string {
    if (!roles?.length)                return 'Unknown';
    if (roles.includes('ROLE_ADMIN'))  return 'Admin';
    if (roles.includes('ROLE_LAWYER')) return 'Lawyer';
    return 'Client';
  }

  getRoleColor(roles: string[]): string {
    if (!roles?.length)                return 'default';
    if (roles.includes('ROLE_ADMIN'))  return 'admin';
    if (roles.includes('ROLE_LAWYER')) return 'lawyer';
    return 'client';
  }

  getInitials(user: any): string {
    return `${user.firstName?.charAt(0) || ''}${user.lastName?.charAt(0) || ''}`.toUpperCase();
  }
}