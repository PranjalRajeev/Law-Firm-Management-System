import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../shared/services/auth.service';

@Component({
  selector: 'app-admin-layout',
  templateUrl: './admin-layout.component.html',
  styleUrls: ['./admin-layout.component.scss']
})
export class AdminLayoutComponent implements OnInit {
  isExpanded = true;

  menuItems = [
    { label: 'Dashboard', icon: 'dashboard', route: '/admin/dashboard' },
    { label: 'Manage Users', icon: 'people', route: '/admin/users' },
    { label: 'Manage Cases', icon: 'gavel', route: '/admin/cases' },
    { label: 'Manage Lawyers', icon: 'badge', route: '/admin/lawyers' },
    { label: 'Manage Clients', icon: 'person', route: '/admin/clients' },
    { label: 'Analytics', icon: 'bar_chart', route: '/admin/analytics' },
  ];

  constructor(private router: Router, private authService: AuthService) {}

  ngOnInit(): void {}

  toggleSidebar(): void {
    this.isExpanded = !this.isExpanded;
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}