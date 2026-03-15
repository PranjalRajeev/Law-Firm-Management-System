import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {
  
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const expectedRole = route.data['role'];
    const userRole = this.authService.getUserRole();
    
    if (userRole === expectedRole) {
      return true;
    } else {
      // Redirect based on current role or to login
      if (this.authService.isAdmin()) {
        this.router.navigate(['/admin/dashboard']);
      } else if (this.authService.isLawyer()) {
        this.router.navigate(['/lawyer/dashboard']);
      } else if (this.authService.isClient()) {
        this.router.navigate(['/client/dashboard']);
      } else {
        this.router.navigate(['/auth/login']);
      }
      return false;
    }
  }
}
