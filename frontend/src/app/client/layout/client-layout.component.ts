import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../../shared/services/auth.service';
import { filter } from 'rxjs/operators';
import { Subscription, interval } from 'rxjs';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-client-layout',
  templateUrl: './client-layout.component.html',
  styleUrls: ['./client-layout.component.scss']
})
export class ClientLayoutComponent implements OnInit, OnDestroy {

  isExpanded   = true;
  isMobile     = false;
  mobileOpen   = false;
  userMenuOpen = false;

  today        = new Date();
  userName     = '';
  userInitials = '';
  unreadCount  = 0;
  currentPageLabel = 'Dashboard';

  menuItems = [
    {
      label: 'Dashboard', route: '/client/dashboard', badge: false,
      svg: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75">
              <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
              <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
            </svg>`
    },
    {
      label: 'My Cases', route: '/client/cases', badge: false,
      svg: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
            </svg>`
    },
    {
      label: 'Hearings', route: '/client/hearings', badge: false,
      svg: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>`
    },
    {
      label: 'Messages', route: '/client/messages', badge: true,
      svg: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>`
    }
  ];

  private routerSub?: Subscription;
  private pollSub?:   Subscription;

  constructor(
    private router:      Router,
    private http:        HttpClient,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.checkScreen();
    this.loadUserInfo();
    this.fetchUnreadCount();
    this.updateBreadcrumb(this.router.url);

    this.routerSub = this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe((e: any) => this.updateBreadcrumb(e.urlAfterRedirects));

    // Poll unread count every 30 seconds
    this.pollSub = interval(30000).subscribe(() => this.fetchUnreadCount());
  }

  ngOnDestroy(): void {
    this.routerSub?.unsubscribe();
    this.pollSub?.unsubscribe();
  }

  // ── Screen ────────────────────────────────────────────────────────────────
  @HostListener('window:resize')
  onResize() { this.checkScreen(); }

  checkScreen(): void {
    this.isMobile = window.innerWidth < 768;
    if (this.isMobile) { this.isExpanded = true; this.mobileOpen = false; }
    else { this.isExpanded = true; }
  }

  toggleSidebar(): void {
    if (this.isMobile) this.mobileOpen = !this.mobileOpen;
    else this.isExpanded = !this.isExpanded;
  }

  openMobile():  void { this.mobileOpen = true; }
  closeMobile(): void { this.mobileOpen = false; }

  // ── User menu ─────────────────────────────────────────────────────────────
  toggleUserMenu(): void { this.userMenuOpen = !this.userMenuOpen; }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!(event.target as HTMLElement).closest('.user-menu-wrap')) {
      this.userMenuOpen = false;
    }
  }

  // ── User info ─────────────────────────────────────────────────────────────
  private loadUserInfo(): void {
    const firstName = localStorage.getItem('firstName') || '';
    const lastName  = localStorage.getItem('lastName')  || '';
    this.userName     = firstName ? `${firstName} ${lastName}`.trim() : 'Client';
    this.userInitials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || 'C';
  }

  // ── Unread count ──────────────────────────────────────────────────────────
  private fetchUnreadCount(): void {
    const token = localStorage.getItem('authToken');
    if (!token) return;
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });
    this.http.get<number>(`${environment.apiUrl}/client/messages/unread-count`, { headers })
      .subscribe({ next: (count) => this.unreadCount = count, error: () => {} });
  }

  // ── Breadcrumb ────────────────────────────────────────────────────────────
  private updateBreadcrumb(url: string): void {
    const match = this.menuItems.find(item => url.startsWith(item.route));
    this.currentPageLabel = match ? match.label : 'Dashboard';
  }

  // ── Auth ──────────────────────────────────────────────────────────────────
  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}