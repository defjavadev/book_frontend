import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, catchError, tap, throwError } from 'rxjs';
import { Store } from '@ngrx/store';
import { UserState, loginAction, logoutAction } from './store/actions/app.action';

interface LoginResponse {
  token: string;
  user: {
    _id: string;
    name: string;
    username: string;
    image?: string;
  };
  msg?: string;
}

interface LoginData {
  identifier: string;
  password: string;
}

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  private readonly API_URL = 'https://book-backend-uz4g.onrender.com/api';
  private isLoggedInSubject = new BehaviorSubject<boolean>(false);
  isLoggedIn$ = this.isLoggedInSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router,
    private store: Store
  ) {
    this.checkInitialAuth();
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An error occurred';
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = error.error.message;
    } else {
      // Server-side error
      if (error.status === 400) {
        errorMessage = error.error?.msg || 'Invalid credentials';
      } else if (error.status === 401) {
        errorMessage = 'Unauthorized access';
      } else if (error.status === 404) {
        errorMessage = 'User not found';
      } else {
        errorMessage = 'Server error, please try again later';
      }
    }
    return throwError(() => ({ ...error, msg: errorMessage }));
  }

  private checkInitialAuth() {
    const userData = localStorage.getItem('users');
    if (userData) {
      try {
        const parsedData = JSON.parse(userData);
        if (parsedData.token) {
          this.http.get(`${this.API_URL}/user/verify-token`, {
            headers: { Authorization: `Bearer ${parsedData.token}` }
          }).subscribe({
            next: () => {
              console.log('Token verified, restoring session');
              this.store.dispatch(loginAction({ item: parsedData }));
              this.isLoggedInSubject.next(true);
              if (this.router.url === '/login') {
                this.router.navigate(['/']);
              }
            },
            error: () => {
              console.log('Token invalid, clearing session');
              this.handleSessionExpired();
            }
          });
        }
      } catch (error) {
        console.error('Error parsing stored auth data:', error);
        this.handleSessionExpired();
      }
    }
  }

  userLogin(data: LoginData): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.API_URL}/user/login`, data).pipe(
      tap(response => {
        if (response.token) {
          const userData: UserState = {
            _id: response.user._id,
            token: response.token,
            name: response.user.name || response.user.username, // Fallback to username if name is not provided
            username: response.user.username,
            role: 'user',
            image: response.user.image || null
          };
          console.log('Storing user data:', userData);
          localStorage.setItem('users', JSON.stringify(userData));
          this.store.dispatch(loginAction({ item: userData }));
          this.isLoggedInSubject.next(true);
        }
      }),
      catchError(this.handleError)
    );
  }

  authorLogin(data: LoginData): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.API_URL}/author/login`, data).pipe(
      tap(response => {
        if (response.token) {
          const userData: UserState = {
            _id: response.user._id,
            token: response.token,
            name: response.user.name || response.user.username, // Fallback to username if name is not provided
            username: response.user.username,
            role: 'author',
            image: response.user.image || null
          };
          console.log('Storing author data:', userData);
          localStorage.setItem('users', JSON.stringify(userData));
          this.store.dispatch(loginAction({ item: userData }));
          this.isLoggedInSubject.next(true);
        }
      }),
      catchError(this.handleError)
    );
  }

  logout() {
    localStorage.removeItem('users');
    this.store.dispatch(logoutAction());
    this.isLoggedInSubject.next(false);
    this.router.navigate(['/login']);
  }

  handleSessionExpired() {
    localStorage.removeItem('users');
    this.store.dispatch(logoutAction());
    this.isLoggedInSubject.next(false);
    this.router.navigate(['/login'], { 
      queryParams: { sessionExpired: 'true' } 
    });
  }
}
