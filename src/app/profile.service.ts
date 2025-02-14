import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  private readonly API_URL = 'http://localhost:7700/api';

  constructor(private http: HttpClient) {}

  updateUserProfile(formData: FormData, token: string): Observable<any> {
    return this.http.put(`${this.API_URL}/user/profile`, formData, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }

  updateAuthorProfile(formData: FormData, token: string): Observable<any> {
    return this.http.put(`${this.API_URL}/author/profile`, formData, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }

  updateUserPassword(token: string, currentPassword: string, newPassword: string): Observable<any> {
    return this.http.put(`${this.API_URL}/user/password`, 
      { currentPassword, newPassword },
      { headers: { Authorization: `Bearer ${token}` } }
    );
  }

  updateAuthorPassword(token: string, currentPassword: string, newPassword: string): Observable<any> {
    return this.http.put(`${this.API_URL}/author/password`,
      { currentPassword, newPassword },
      { headers: { Authorization: `Bearer ${token}` } }
    );
  }
}
