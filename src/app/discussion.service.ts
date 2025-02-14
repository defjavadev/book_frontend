import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

interface DiscussionData {
  book_id: string;
  comment: string;
}

interface ReplyData {
  reply: string;
}

@Injectable({
  providedIn: 'root'
})
export class DiscussionService {
  private apiUrl = 'https://book-backend-uz4g.onrender.com/api/discussion';

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
          errorMessage = 'Discussion not found';
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
    
    console.error('Discussion API Error:', error);
    return throwError(() => new Error(errorMessage));
  }

  getDiscussions(token: string): Observable<any> {
    const headers = this.getHeaders(token);
    return this.http.get(`${this.apiUrl}/get`, { headers }).pipe(
      catchError(this.handleError)
    );
  }

  addDiscussion(data: DiscussionData, token: string): Observable<any> {
    const headers = this.getHeaders(token);
    return this.http.post(`${this.apiUrl}/add`, data, { headers }).pipe(
      catchError(this.handleError)
    );
  }

  addReply(discussionId: string, data: ReplyData, token: string): Observable<any> {
    const headers = this.getHeaders(token);
    return this.http.patch(`${this.apiUrl}/reply/${discussionId}`, data, { headers }).pipe(
      catchError(this.handleError)
    );
  }

  deleteDiscussion(discussionId: string, token: string): Observable<any> {
    const headers = this.getHeaders(token);
    return this.http.delete(`${this.apiUrl}/delete/${discussionId}`, { headers }).pipe(
      catchError(this.handleError)
    );
  }
}
