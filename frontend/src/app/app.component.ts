import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './shared/services/auth.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'Law Firm Management System';
  isAuthenticated$: Observable<boolean>;
  currentUserRole$: Observable<string | null>;

  constructor(private authService: AuthService, private router: Router) {
    this.isAuthenticated$ = this.authService.currentUser$.pipe(map(user => !!user));
    this.currentUserRole$ = this.authService.currentUser$.pipe(map(user => user ? user.roles[0] : null));
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }

  isAdmin(): boolean {
    return this.authService.isAdmin();
  }

  isLawyer(): boolean {
    return this.authService.isLawyer();
  }

  isClient(): boolean {
    return this.authService.isClient();
  }
}
