import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

export interface User {
  id: number;
  username: string;
  email: string;
  created_at: string;
  total_score: number;
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
}

export interface LeaderboardResponse {
  message: string;
  leaderboard: LeaderboardPlayer[];
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/api'; // Ensure this is your backend URL
  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser: Observable<User | null>;

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

  login(username: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, { username, password })
      .pipe(map(response => {
        if (response.user) {
          sessionStorage.setItem('currentUser', JSON.stringify(response.user));
          this.currentUserSubject.next(response.user);
        }
        return response;
      }));
  }

  signup(username: string, email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/signup`, { username, email, password })
      .pipe(map(response => {
        if (response.user) {
          sessionStorage.setItem('currentUser', JSON.stringify(response.user));
          this.currentUserSubject.next(response.user);
        }
        return response;
      }));
  }

  logout(): void {
    sessionStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
  }

  isLoggedIn(): boolean {
    return this.currentUserValue !== null;
  }

  updateScore(scoreToAdd: number): Observable<UpdateScoreResponse> {
    const currentUser = this.currentUserValue;
    if (!currentUser || !currentUser.id) {
      return throwError(() => new Error('User not logged in or user ID not available. Cannot update score.'));
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
            this.currentUserSubject.next(updatedLocalUser);
            sessionStorage.setItem('currentUser', JSON.stringify(updatedLocalUser));
          }
          return response;
        }),
        catchError(error => {
          console.error('Error updating score on backend:', error);
          return throwError(() => new Error('Failed to update score on backend.'));
        })
      );
  }

  getLeaderboard(): Observable<LeaderboardPlayer[]> {
    return this.http.get<LeaderboardResponse>(`${this.apiUrl}/leaderboard`)
      .pipe(
        map(response => response.leaderboard),
        catchError(error => {
            console.error('Error fetching leaderboard from backend:', error);
            return throwError(() => new Error('Failed to fetch leaderboard data.'));
        })
      );
  }
}