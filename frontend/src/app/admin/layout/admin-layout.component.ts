import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { AuthService } from '../../shared/services/auth.service';
import { filter } from 'rxjs/operators';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-admin-layout',
  templateUrl: './admin-layout.component.html',
  styleUrls: ['./admin-layout.component.scss']
})
export class AdminLayoutComponent implements OnInit, OnDestroy {

  isExpanded  = true;   // desktop sidebar expand/collapse
  isMobile    = false;
  mobileOpen  = false;  // mobile drawer open flag
  userMenuOpen = false;

  today = new Date();

  // ── Menu items with inline SVG strings ─────────────────────────────────────
  menuItems = [
    {
      label: 'Dashboard',
      route: '/admin/dashboard',
      svg: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75">
              <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
              <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
            </svg>`
    },
    {
      label: 'Manage Users',
      route: '/admin/users',
      svg: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>`
    },
    {
      label: 'Manage Cases',
      route: '/admin/cases',
      svg: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
              <polyline points="10 9 9 9 8 9"/>
            </svg>`
    },

    {
      label: 'Analytics',
      route: '/admin/analytics',
      svg: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75">
              <line x1="18" y1="20" x2="18" y2="10"/>
              <line x1="12" y1="20" x2="12" y2="4"/>
              <line x1="6"  y1="20" x2="6"  y2="14"/>
            </svg>`
    }
  ];

  // ── Derived: current page label for breadcrumb ──────────────────────────────
  currentPageLabel = 'Dashboard';

  private routerSub?: Subscription;

  constructor(
    private router:      Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.checkScreen();
    this.updateBreadcrumb(this.router.url);

    // Keep breadcrumb in sync on navigation
    this.routerSub = this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe((e: any) => this.updateBreadcrumb(e.urlAfterRedirects));
  }

  ngOnDestroy(): void {
    this.routerSub?.unsubscribe();
  }

  // ── Screen size ─────────────────────────────────────────────────────────────
  @HostListener('window:resize')
  onResize() { this.checkScreen(); }

  checkScreen(): void {
    this.isMobile = window.innerWidth < 768;
    if (this.isMobile) {
      this.isExpanded = true;  // always full width when it slides over
      this.mobileOpen = false;
    } else {
      this.isExpanded = true;
    }
  }

  // ── Sidebar ─────────────────────────────────────────────────────────────────
  toggleSidebar(): void {
    if (this.isMobile) {
      this.mobileOpen = !this.mobileOpen;
    } else {
      this.isExpanded = !this.isExpanded;
    }
  }

  openMobile():  void { this.mobileOpen = true; }
  closeMobile(): void { this.mobileOpen = false; }

  // ── User menu ────────────────────────────────────────────────────────────────
  toggleUserMenu(): void { this.userMenuOpen = !this.userMenuOpen; }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.user-menu-wrap')) {
      this.userMenuOpen = false;
    }
  }

  // ── Breadcrumb ───────────────────────────────────────────────────────────────
  private updateBreadcrumb(url: string): void {
    const match = this.menuItems.find(item => url.startsWith(item.route));
    this.currentPageLabel = match ? match.label : 'Dashboard';
  }

  // ── Auth ─────────────────────────────────────────────────────────────────────
  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}