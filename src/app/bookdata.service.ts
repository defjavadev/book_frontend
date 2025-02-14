import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { environment } from '../environments/environment';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { BookData } from './alldata';

@Injectable({
  providedIn: 'root'
})
export class BookdataService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An error occurred';
    if (error.error instanceof ErrorEvent) {
      errorMessage = error.error.message;
    } else {
      switch (error.status) {
        case 404:
          errorMessage = 'Book not found';
          break;
        case 401:
          errorMessage = 'Unauthorized - Please login again';
          break;
        case 403:
          errorMessage = 'Access forbidden';
          break;
        default:
          errorMessage = error.error?.msg || 'Server error';
      }
    }
    return throwError(() => ({ ...error, msg: errorMessage }));
  }

  getBook(page: number = 1, title: string = '', genre: string = '', author_name: string = ''): Observable<{msg: string, total: number, books: BookData[]}> {
    const params = new URLSearchParams({
      page: page.toString(),
      ...(title && { title }),
      ...(genre && { genre }),
      ...(author_name && { author_name })
    });
    return this.http.get<{msg: string, total: number, books: BookData[]}>(`${this.baseUrl}/api/book?${params.toString()}`);
  }

  getSingleBook(id: string): Observable<{msg: string, book: BookData}> {
    return this.http.get<{msg: string, book: BookData}>(`${this.baseUrl}/api/book/${id}`);
  }

  addBook(bookData: any, token: string): Observable<any> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.post(`${this.baseUrl}/api/book`, bookData, { headers });
  }

  updateLike(bookId: string, token: string): Observable<any> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.post(`${this.baseUrl}/api/book/${bookId}/like`, {}, { headers })
      .pipe(catchError(this.handleError));
  }

  bookContent(booktitle: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/api/book/bookcontent`, { booktitle });
  }

  getReview(id: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/api/book/review/get/${id}`);
  }

  addComment(id: string, token: string, item: {
    comment: string,
    user_id: string,
    published: string,
    username: string
  }): Observable<any> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.post(`${this.baseUrl}/api/book/review/add/${id}`, item, { headers });
  }

  replyComment(reviewId: string, token: string, item: {
    comment: string,
    user_id: string,
    published: string,
    username: string
  }): Observable<any> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.patch(`${this.baseUrl}/api/book/review/reply/${reviewId}`, item, { headers });
  }
}
