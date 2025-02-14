import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { environment } from '../environments/environment';
import { BookData } from './alldata';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'https://book-backend-uz4g.onrender.com';

  constructor(private http: HttpClient) { }

  private getHeaders(token: string): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An error occurred';
    
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    } else {
      switch (error.status) {
        case 404:
          errorMessage = 'Resource not found';
          break;
        case 401:
          errorMessage = 'Unauthorized - Please login again';
          break;
        case 403:
          errorMessage = 'Access forbidden';
          break;
        case 500:
          errorMessage = 'Internal server error';
          break;
        default:
          errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
      }
    }
    
    console.error('API Error:', error);
    return throwError(() => new Error(errorMessage));
  }

  getUserProfile(userId: string, token: string, role: string = 'user'): Observable<any> {
    const endpoint = role === 'author' 
      ? `${this.apiUrl}/api/author/author/${userId}`
      : `${this.apiUrl}/api/user/user/${userId}`;
    const headers = this.getHeaders(token);
    return this.http.get(endpoint, { headers }).pipe(
      catchError(this.handleError)
    );
  }

  updateProfile(userId: string, token: string, data: any, role: string = 'user'): Observable<any> {
    const endpoint = role === 'author'
      ? `${this.apiUrl}/api/author/update/${userId}`
      : `${this.apiUrl}/api/user/update/${userId}`;
    const headers = this.getHeaders(token);
    return this.http.patch(endpoint, data, { headers }).pipe(
      catchError(this.handleError)
    );
  }

  updateCart(userId: string, token: string, cart: BookData[]): Observable<any> {
    const headers = this.getHeaders(token);
    return this.http.patch(`${this.apiUrl}/api/user/update/${userId}`, { cart }, { headers }).pipe(
      catchError(this.handleError)
    );
  }

  getAuthorBooks(userId: string, token: string): Observable<any> {
    const headers = this.getHeaders(token);
    return this.http.get(`${this.apiUrl}/api/book/author/${userId}`, { headers }).pipe(
      catchError(this.handleError)
    );
  }

  addBook(userId: string, token: string, bookData: any): Observable<any> {
    const headers = this.getHeaders(token);
    const data = { ...bookData, author_id: userId };
    return this.http.post(`${this.apiUrl}/api/book/add`, data, { headers }).pipe(
      catchError(this.handleError)
    );
  }

  deleteBook(userId: string, token: string, bookId: string): Observable<any> {
    const headers = this.getHeaders(token);
    return this.http.delete(`${this.apiUrl}/api/book/delete/${bookId}`, { headers }).pipe(
      catchError(this.handleError)
    );
  }

  addToCart(userId: string, token: string, bookId: string): Observable<any> {
    const headers = this.getHeaders(token);
    return this.http.post(`${this.apiUrl}/api/user/cart/add/${userId}`, { bookId }, { headers }).pipe(
      catchError(this.handleError)
    );
  }

  removeFromCart(userId: string, token: string, bookId: string): Observable<any> {
    const headers = this.getHeaders(token);
    return this.http.delete(`${this.apiUrl}/api/user/cart/remove/${userId}/${bookId}`, { headers }).pipe(
      catchError(this.handleError)
    );
  }

  checkout(userId: string, token: string, paymentData: any): Observable<any> {
    const headers = this.getHeaders(token);
    return this.http.post(`${this.apiUrl}/api/user/checkout/${userId}`, paymentData, { headers }).pipe(
      catchError(this.handleError)
    );
  }

  getPurchaseHistory(userId: string, token: string): Observable<any> {
    return this.getUserProfile(userId, token, 'user');
  }

  updatePurchased(userId: string, token: string, purchased: BookData[]): Observable<any> {
    const headers = this.getHeaders(token);
    return this.http.patch(`${this.apiUrl}/api/user/update/${userId}`, { purchased }, { headers }).pipe(
      catchError(this.handleError)
    );
  }

  getUserCart(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/api/user/cart/${id}`);
  }
}
