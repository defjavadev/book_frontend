import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, map, take } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private store: Store, private router: Router) {}

  canActivate(): Observable<boolean> {
    return this.store.select((state: any) => state.app.users).pipe(
      take(1),
      map(users => {
        if (users?.token) {
          return true;
        }
        this.router.navigate(['/login']);
        return false;
      })
    );
  }
}
