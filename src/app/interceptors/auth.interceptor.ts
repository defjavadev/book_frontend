import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { logoutAction } from '../store/actions/app.action';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(
    private router: Router,
    private store: Store
  ) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const userData = localStorage.getItem('users');
    let token = null;
    
    if (userData) {
      try {
        const parsedData = JSON.parse(userData);
        token = parsedData.token;
      } catch {
        // Invalid user data in localStorage
        localStorage.removeItem('users');
      }
    }
    
    if (token) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }

    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          // Handle session expiration
          localStorage.removeItem('users');
          this.store.dispatch(logoutAction());
          this.router.navigate(['/login'], { 
            queryParams: { sessionExpired: 'true' }
          });
        }
        return throwError(() => error);
      })
    );
  }
}
