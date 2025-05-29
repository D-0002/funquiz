import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';

export interface User {
  id: number;
  username: string;
  email: string;
  created_at: string; 
  total_score: number;
  profile_picture_url?: string | null;
}

export interface AuthResponse {
  message: string;
  user: User;
}

export interface UpdateScoreResponse {
  message: string;
  user: { 
    id: number;
    username: string;
    total_score: number;
  };
}

export interface LeaderboardPlayer {
  id: number;
  username: string;
  total_score: number;
  rank: number;
  profile_picture_url?: string | null;
}

export interface LeaderboardResponse {
  message: string;
  leaderboard: LeaderboardPlayer[];
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/api';
  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser: Observable<User | null>;
  private defaultProfilePicture = '../../../assets/icon-logo.jfif';

  constructor(private http: HttpClient) {
    const storedUser = sessionStorage.getItem('currentUser');
    this.currentUserSubject = new BehaviorSubject<User | null>(
      storedUser ? JSON.parse(storedUser) : null
    );
    this.currentUser = this.currentUserSubject.asObservable();
  }

  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  private storeUserAndNotify(user: User): User {
    const userToStore = { ...user, profile_picture_url: user.profile_picture_url || null };
    sessionStorage.setItem('currentUser', JSON.stringify(userToStore));
    this.currentUserSubject.next(userToStore);
    return userToStore;
  }

  login(username: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, { username, password })
      .pipe(
        map(response => {
          if (response.user) {
            this.storeUserAndNotify(response.user);
          }
          return response;
        }),
        catchError(this.handleError)
      );
  }

  signup(username: string, email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/signup`, { username, email, password })
      .pipe(
        catchError(this.handleError)
      );
  }

  logout(): void {
    sessionStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
    localStorage.removeItem('easyScore');
    localStorage.removeItem('mediumScore');
    localStorage.removeItem('hardScore');
    localStorage.removeItem('extremeScore');
  }

  isLoggedIn(): boolean {
    return this.currentUserValue !== null;
  }

  updateScore(scoreToAdd: number): Observable<UpdateScoreResponse> {
    const currentUser = this.currentUserValue;
    if (!currentUser || currentUser.id === undefined) { 
      return throwError(() => new Error('User not logged in or user ID not available.'));
    }
    const userId = currentUser.id;
    return this.http.post<UpdateScoreResponse>(`${this.apiUrl}/update-score`, { userId, scoreToAdd })
      .pipe(
        map(response => {
          if (response.user && this.currentUserSubject.value) {
            const updatedLocalUser: User = {
              ...this.currentUserSubject.value, 
              total_score: response.user.total_score 
            };
            this.storeUserAndNotify(updatedLocalUser);
          }
          return response;
        }),
        catchError(this.handleError)
      );
  }

  getLeaderboard(): Observable<LeaderboardPlayer[]> {
    return this.http.get<LeaderboardResponse>(`${this.apiUrl}/leaderboard`)
      .pipe(
        map(response => response.leaderboard),
        catchError(this.handleError)
      );
  }

  updateProfilePicture(userId: number, file: File): Observable<User> {
    const formData = new FormData();
    formData.append('profilePicture', file, file.name);
    formData.append('userId', userId.toString()); 

    return this.http.post<{ message: string, user: User }>(`${this.apiUrl}/user/profile-picture`, formData)
      .pipe(
        map(response => {
          if (response.user) {
            this.storeUserAndNotify(response.user); 
          }
          return response.user;
        }),
        catchError(this.handleError)
      );
  }

  // Fixed updateUserProfile method
  updateUserProfile(userId: number, username: string): Observable<User> {
    const payload = { username: username.trim() }; // Ensure clean payload
    console.log('Sending update request:', payload); // Debug log
    
    return this.http.put<{ message: string, user: User }>(`${this.apiUrl}/user/profile/${userId}`, payload)
      .pipe(
        map(response => {
          console.log('Update response received:', response); // Debug log
          if (response.user) {
            this.storeUserAndNotify(response.user);
          }
          return response.user;
        }),
        catchError(this.handleError)
      );
  }

  getUserById(userId: number): Observable<User | null> {
    return this.http.get<{ user: User }>(`${this.apiUrl}/user/${userId}`).pipe(
      map(response => response.user || null),
      tap(user => {
        if (user && this.currentUserValue && this.currentUserValue.id === user.id) {
          this.storeUserAndNotify(user);
        }
      }),
      catchError(this.handleError)
    );
  }

  getDefaultProfilePicture(): string {
    return this.defaultProfilePicture;
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An unknown error occurred!';
    console.error('HTTP Error details:', error); // Enhanced error logging
    
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    } else {
      if (error.error && error.error.error) {
        errorMessage = `${error.error.error}`;
      } else if (error.error && error.error.details) {
        // Handle validation errors from backend
        const details = error.error.details;
        if (details.username && details.username.length > 0) {
          errorMessage = details.username[0];
        } else {
          errorMessage = 'Validation error occurred';
        }
      } else if (error.message) {
        errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
      } else {
        errorMessage = `Error Code: ${error.status}\nMessage: Server error`;
      }
    }
    console.error('Processed error message:', errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}