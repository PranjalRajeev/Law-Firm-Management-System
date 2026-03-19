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

  today          = new Date();
  userName       = '';
  userInitials   = '';
  unreadCount    = 0;
  activeCaseCount = 0;   // shows on My Cases nav item
  currentPageLabel = 'Dashboard';

  // ── Nav items mapped to routes for breadcrumb lookup ─────────────────────
  private navRoutes = [
    { label: 'Dashboard',  route: '/client/dashboard'  },
    { label: 'My Cases',   route: '/client/cases'       },
    { label: 'Hearings',   route: '/client/hearings'    },
    { label: 'Documents',  route: '/client/documents'   },
    { label: 'Messages',   route: '/client/messages'    },
    { label: 'Billing',    route: '/client/billing'     },
    { label: 'My Profile', route: '/client/profile'     },
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
    this.fetchActiveCaseCount();
    this.updateBreadcrumb(this.router.url);

    // Keep breadcrumb in sync on every navigation
    this.routerSub = this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe((e: any) => this.updateBreadcrumb(e.urlAfterRedirects));

    // Poll unread messages count every 30 seconds
    this.pollSub = interval(30000).subscribe(() => this.fetchUnreadCount());
  }

  ngOnDestroy(): void {
    this.routerSub?.unsubscribe();
    this.pollSub?.unsubscribe();
  }

  // ── Screen size ───────────────────────────────────────────────────────────
  @HostListener('window:resize')
  onResize(): void { this.checkScreen(); }

  checkScreen(): void {
    this.isMobile = window.innerWidth < 768;
    if (this.isMobile) {
      this.isExpanded = true;
      this.mobileOpen = false;
    } else {
      this.isExpanded = true;
    }
  }

  // ── Sidebar toggle ────────────────────────────────────────────────────────
  toggleSidebar(): void {
    if (this.isMobile) this.mobileOpen = !this.mobileOpen;
    else               this.isExpanded = !this.isExpanded;
  }

  openMobile():  void { this.mobileOpen = true; }
  closeMobile(): void { this.mobileOpen = false; }

  // ── User dropdown ─────────────────────────────────────────────────────────
  toggleUserMenu(): void { this.userMenuOpen = !this.userMenuOpen; }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!(event.target as HTMLElement).closest('.user-menu-wrap')) {
      this.userMenuOpen = false;
    }
  }

  // ── User info from localStorage ───────────────────────────────────────────
  private loadUserInfo(): void {
    const firstName = localStorage.getItem('firstName') || '';
    const lastName  = localStorage.getItem('lastName')  || '';
    this.userName     = firstName ? `${firstName} ${lastName}`.trim() : 'Client';
    this.userInitials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || 'C';
  }

  // ── Unread message count (topbar bell + Messages badge) ───────────────────
  private fetchUnreadCount(): void {
    const token = localStorage.getItem('authToken');
    if (!token) return;
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });
    this.http.get<number>(`${environment.apiUrl}/client/messages/unread-count`, { headers })
      .subscribe({ next: (count) => this.unreadCount = count, error: () => {} });
  }

  // ── Active case count (badge on My Cases nav item) ────────────────────────
  private fetchActiveCaseCount(): void {
    const token = localStorage.getItem('authToken');
    if (!token) return;
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });
    this.http.get<any[]>(`${environment.apiUrl}/client/cases`, { headers })
      .subscribe({
        next: (cases) => {
          this.activeCaseCount = cases.filter(
            c => c.status === 'OPEN' || c.status === 'IN_PROGRESS'
          ).length;
        },
        error: () => {}
      });
  }

  // ── Breadcrumb ────────────────────────────────────────────────────────────
  private updateBreadcrumb(url: string): void {
    const match = this.navRoutes.find(item => url.startsWith(item.route));
    this.currentPageLabel = match ? match.label : 'Dashboard';
  }

  // ── Logout ────────────────────────────────────────────────────────────────
  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}