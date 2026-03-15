import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { User } from '../models/user.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = environment.apiUrl;

  constructor() {}

  getUserProfile(): Observable<User> {
    // TODO: Implement user profile API call
    throw new Error('Not implemented yet');
  }

  updateUserProfile(user: User): Observable<User> {
    // TODO: Implement user update API call
    throw new Error('Not implemented yet');
  }

  getAllUsers(): Observable<User[]> {
    // TODO: Implement get all users API call
    throw new Error('Not implemented yet');
  }

  getUserById(id: number): Observable<User> {
    // TODO: Implement get user by ID API call
    throw new Error('Not implemented yet');
  }

  createUser(user: Partial<User>): Observable<User> {
    // TODO: Implement create user API call
    throw new Error('Not implemented yet');
  }

  updateUser(id: number, user: Partial<User>): Observable<User> {
    // TODO: Implement update user API call
    throw new Error('Not implemented yet');
  }

  deleteUser(id: number): Observable<void> {
    // TODO: Implement delete user API call
    throw new Error('Not implemented yet');
  }
}
