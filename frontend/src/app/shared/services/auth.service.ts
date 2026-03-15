import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { AuthResponse, LoginRequest, RegisterRequest, User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}`;
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  private tokenKey = 'authToken';

  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadStoredUser();
  }

  private loadStoredUser(): void {
    const token = localStorage.getItem(this.tokenKey);
    if (token) {
      this.currentUserSubject.next(null);
    }
  }

  login(credentials: LoginRequest): Observable<AuthResponse> {
    console.log('LOGIN CALLED with:', credentials);
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/login`, credentials).pipe(
      tap(response => {
        console.log('LOGIN SUCCESS:', response);
        localStorage.setItem(this.tokenKey, response.token);
        this.currentUserSubject.next({
          id: response.id,
          username: response.username,
          email: response.email,
          firstName: response.firstName,
          lastName: response.lastName,
          roles: [response.role],
          status: 'ACTIVE',
          createdAt: '',
          updatedAt: ''
        });
      })
    );
  }

  register(userData: RegisterRequest): Observable<AuthResponse> {
    console.log('REGISTER CALLED with:', userData);
    console.log('Posting to URL:', `${this.apiUrl}/auth/register`);
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/register`, userData).pipe(
      tap(response => {
        console.log('REGISTER RESPONSE:', response);
        localStorage.setItem(this.tokenKey, response.token);
        this.currentUserSubject.next({
          id: response.id,
          username: response.username,
          email: response.email,
          firstName: response.firstName,
          lastName: response.lastName,
          roles: [response.role],
          status: 'ACTIVE',
          createdAt: '',
          updatedAt: ''
        });
      })
    );
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    this.currentUserSubject.next(null);
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem(this.tokenKey);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  getUserRole(): string | null {
    const user = this.currentUserSubject.value;
    return user && user.roles.length > 0 ? user.roles[0] : null;
  }

  isAdmin(): boolean {
    return this.getUserRole() === 'ROLE_ADMIN';
  }

  isLawyer(): boolean {
    return this.getUserRole() === 'ROLE_LAWYER';
  }

  isClient(): boolean {
    return this.getUserRole() === 'ROLE_CLIENT';
  }

  getCurrentUser(): User | null {
  return this.currentUserSubject.value;
   }
   
  getAuthHeaders(): HttpHeaders {
    const token = this.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }
}