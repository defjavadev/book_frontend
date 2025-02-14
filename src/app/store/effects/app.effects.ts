import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { loginAction, logoutAction } from '../actions/app.action';

@Injectable()
export class AppEffects {
  login$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loginAction),
      tap(action => {
        console.log('Login effect:', action);
        localStorage.setItem('users', JSON.stringify(action.item));
      })
    ),
    { dispatch: false }
  );

  logout$ = createEffect(() =>
    this.actions$.pipe(
      ofType(logoutAction),
      tap(() => {
        console.log('Logout effect');
        localStorage.removeItem('users');
        this.router.navigate(['/login']);
      })
    ),
    { dispatch: false }
  );

  constructor(
    private actions$: Actions,
    private router: Router
  ) {}
}
