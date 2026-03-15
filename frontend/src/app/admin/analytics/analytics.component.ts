import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-analytics',
  templateUrl: './analytics.component.html',
  styleUrls: ['./analytics.component.scss']
})
export class AnalyticsComponent implements OnInit {
  stats: any = {};
  users: any[] = [];
  cases: any[] = [];

  // Chart data
  casesByStatus: any[] = [];
  casesByType: any[] = [];
  usersByRole: any[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadData();
  }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('authToken');
    return new HttpHeaders({ 'Authorization': `Bearer ${token}` });
  }

  loadData(): void {
    const headers = this.getHeaders();

    this.http.get<any>(`${environment.apiUrl}/admin/dashboard/stats`, { headers })
      .subscribe({
        next: (data) => {
          this.stats = data;
          this.buildChartData();
        },
        error: (err) => console.error('Stats error:', err)
      });

    this.http.get<any[]>(`${environment.apiUrl}/admin/users`, { headers })
      .subscribe({
        next: (data) => { this.users = data; },
        error: (err) => console.error('Users error:', err)
      });

    this.http.get<any[]>(`${environment.apiUrl}/admin/cases`, { headers })
      .subscribe({
        next: (data) => {
          this.cases = data;
          this.buildCaseCharts();
        },
        error: (err) => console.error('Cases error:', err)
      });
  }

  buildChartData(): void {
    this.usersByRole = [
      { label: 'Admins', value: this.stats.totalUsers - this.stats.totalLawyers - this.stats.totalClients, color: '#e53935' },
      { label: 'Lawyers', value: this.stats.totalLawyers, color: '#1976d2' },
      { label: 'Clients', value: this.stats.totalClients, color: '#8e24aa' }
    ];

    this.casesByStatus = [
      { label: 'Open', value: this.stats.openCases, color: '#43a047' },
      { label: 'In Progress', value: this.stats.inProgressCases, color: '#1976d2' },
      { label: 'Closed', value: this.stats.closedCases, color: '#757575' }
    ];
  }

  buildCaseCharts(): void {
    const typeCounts: any = {};
    this.cases.forEach(c => {
      const type = c.caseType || 'OTHER';
      typeCounts[type] = (typeCounts[type] || 0) + 1;
    });

    const colors = ['#1976d2', '#43a047', '#e53935', '#fb8c00', '#8e24aa', '#00897b'];
    this.casesByType = Object.keys(typeCounts).map((key, i) => ({
      label: key,
      value: typeCounts[key],
      color: colors[i % colors.length]
    }));
  }

  getBarWidth(value: number, max: number): number {
    if (max === 0) return 0;
    return Math.round((value / max) * 100);
  }

  getMaxValue(data: any[]): number {
    if (!data || data.length === 0) return 1;
    return Math.max(...data.map(d => d.value), 1);
  }
}