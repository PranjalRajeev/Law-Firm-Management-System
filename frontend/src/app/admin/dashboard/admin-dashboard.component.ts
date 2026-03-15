import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss']
})
export class AdminDashboardComponent implements OnInit {
  stats: any = {
    totalUsers: 0,
    totalLawyers: 0,
    totalClients: 0,
    totalCases: 0,
    openCases: 0,
    closedCases: 0,
    inProgressCases: 0
  };

  users: any[] = [];
  cases: any[] = [];
  isLoading = true;

  displayedUserColumns = ['name', 'email', 'role', 'status', 'actions'];
  displayedCaseColumns = ['caseNumber', 'title', 'client', 'lawyer', 'status', 'dateOpened'];

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('authToken');
    console.log('Token found:', token ? 'YES' : 'NO');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  loadDashboardData(): void {
    this.isLoading = true;
    const headers = this.getHeaders();

    this.http.get<any>(`${environment.apiUrl}/admin/dashboard/stats`, { headers })
      .subscribe({
        next: (data) => {
          console.log('✅ Stats loaded:', data);
          this.stats = data;
        },
        error: (err) => console.error('❌ Stats error:', err.status, err.message)
      });

    this.http.get<any[]>(`${environment.apiUrl}/admin/users`, { headers })
      .subscribe({
        next: (data) => {
          console.log('✅ Users loaded:', data);
          this.users = data;
          this.isLoading = false;
        },
        error: (err) => {
          console.error('❌ Users error:', err.status, err.message);
          this.isLoading = false;
        }
      });

    this.http.get<any[]>(`${environment.apiUrl}/admin/cases`, { headers })
      .subscribe({
        next: (data) => {
          console.log('✅ Cases loaded:', data);
          this.cases = data;
        },
        error: (err) => console.error('❌ Cases error:', err.status, err.message)
      });
  }

  deleteUser(id: number): void {
    if (!confirm('Are you sure you want to delete this user?')) return;
    const headers = this.getHeaders();
    this.http.delete(`${environment.apiUrl}/admin/users/${id}`, { headers })
      .subscribe({
        next: () => {
          console.log('✅ User deleted');
          this.users = this.users.filter(u => u.id !== id);
          this.stats.totalUsers--;
        },
        error: (err) => console.error('❌ Delete error:', err)
      });
  }

  updateUserStatus(id: number, status: string): void {
    const headers = this.getHeaders();
    this.http.put(
      `${environment.apiUrl}/admin/users/${id}/status?status=${status}`,
      {},
      { headers }
    ).subscribe({
      next: (updated: any) => {
        console.log('✅ Status updated:', updated);
        const index = this.users.findIndex(u => u.id === id);
        if (index !== -1) this.users[index] = updated;
      },
      error: (err) => console.error('❌ Status update error:', err)
    });
  }

  getRoleBadgeColor(roles: string[]): string {
    if (!roles || roles.length === 0) return 'default';
    if (roles.includes('ROLE_ADMIN')) return 'warn';
    if (roles.includes('ROLE_LAWYER')) return 'primary';
    return 'accent';
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'OPEN': return '#4caf50';
      case 'IN_PROGRESS': return '#2196f3';
      case 'CLOSED': return '#9e9e9e';
      case 'SETTLED': return '#ff9800';
      default: return '#9e9e9e';
    }
  }

  getRoleDisplay(roles: string[]): string {
    if (!roles || roles.length === 0) return 'Unknown';
    if (roles.includes('ROLE_ADMIN')) return 'Admin';
    if (roles.includes('ROLE_LAWYER')) return 'Lawyer';
    return 'Client';
  }
}