import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-client-dashboard',
  templateUrl: './client-dashboard.component.html',
  styleUrls: ['./client-dashboard.component.scss']
})
export class ClientDashboardComponent implements OnInit {

  dashboard: any = null;
  isLoading = true;

  fullName = '';   // "Elena Hargrove"
  greeting = '';   // "morning" | "afternoon" | "evening"

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.greeting = this.getGreeting();
    this.fullName = this.getFullName();
    this.loadDashboard();
  }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('authToken');
    return new HttpHeaders({ 'Authorization': `Bearer ${token}` });
  }

  loadDashboard(): void {
    this.isLoading = true;
    this.http.get<any>(`${environment.apiUrl}/client/dashboard`, { headers: this.getHeaders() })
      .subscribe({
        next:  (data) => { this.dashboard = data; this.isLoading = false; },
        error: (err)  => { console.error(err);    this.isLoading = false; }
      });
  }

  // Builds "Elena Hargrove" from localStorage — falls back to username, then "Client"
  private getFullName(): string {
    const firstName = (localStorage.getItem('firstName') || '').trim();
    const lastName  = (localStorage.getItem('lastName')  || '').trim();

    if (firstName && lastName) return `${firstName} ${lastName}`;
    if (firstName)             return firstName;

    const username = (localStorage.getItem('username') || '').trim();
    return username || 'Client';
  }

  private getGreeting(): string {
    const h = new Date().getHours();
    if (h < 12) return 'morning';
    if (h < 17) return 'afternoon';
    return 'evening';
  }
}