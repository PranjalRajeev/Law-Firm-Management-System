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

  // Chart data arrays
  casesByStatus: any[] = [];
  casesByType:   any[] = [];
  usersByRole:   any[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit(): void { this.loadData(); }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('authToken');
    return new HttpHeaders({ 'Authorization': `Bearer ${token}` });
  }

  loadData(): void {
    const headers = this.getHeaders();

    this.http.get<any>(`${environment.apiUrl}/admin/dashboard/stats`, { headers })
      .subscribe({
        next:  (data) => { this.stats = data; this.buildChartData(); },
        error: (err)  => console.error('Stats error:', err)
      });

    this.http.get<any[]>(`${environment.apiUrl}/admin/users`, { headers })
      .subscribe({
        next:  (data) => { this.users = data; },
        error: (err)  => console.error('Users error:', err)
      });

    this.http.get<any[]>(`${environment.apiUrl}/admin/cases`, { headers })
      .subscribe({
        next:  (data) => { this.cases = data; this.buildCaseCharts(); },
        error: (err)  => console.error('Cases error:', err)
      });
  }

  buildChartData(): void {
    const admins = Math.max(
      0,
      (this.stats.totalUsers || 0) - (this.stats.totalLawyers || 0) - (this.stats.totalClients || 0)
    );

    this.usersByRole = [
      { label: 'Admins',  value: admins,                       color: '#d46060' },
      { label: 'Lawyers', value: this.stats.totalLawyers || 0, color: '#6FA3D4' },
      { label: 'Clients', value: this.stats.totalClients || 0, color: '#b09ddd' }
    ];

    this.casesByStatus = [
      { label: 'Open',        value: this.stats.openCases        || 0, color: '#4EB87A' },
      { label: 'In Progress', value: this.stats.inProgressCases  || 0, color: '#6FA3D4' },
      { label: 'Closed',      value: this.stats.closedCases      || 0, color: '#6B6560' }
    ];
  }

  buildCaseCharts(): void {
    const typeCounts: Record<string, number> = {};
    this.cases.forEach(c => {
      const type = c.caseType || 'OTHER';
      typeCounts[type] = (typeCounts[type] || 0) + 1;
    });

    // Colours aligned with the LexFirma palette
    const colors = ['#C9A84C', '#4EB87A', '#6FA3D4', '#d46060', '#b09ddd', '#E2C47A', '#ABA49A'];
    this.casesByType = Object.keys(typeCounts).map((key, i) => ({
      label: key,
      value: typeCounts[key],
      color: colors[i % colors.length]
    }));
  }

  getBarWidth(value: number, max: number): number {
    if (!max || max === 0) return 0;
    return Math.round((value / max) * 100);
  }

  getMaxValue(data: any[]): number {
    if (!data || data.length === 0) return 1;
    return Math.max(...data.map(d => d.value), 1);
  }
}