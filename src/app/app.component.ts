import { Component, OnInit } from '@angular/core';
import { initFlowbite } from 'flowbite';
import { Store } from '@ngrx/store';
import { Router } from '@angular/router';
import { loginAction } from './store/actions/app.action';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  constructor(
    private store: Store,
    private router: Router
  ) {
    this.restoreUserState();
  }

  ngOnInit(): void {
    initFlowbite();
  }

  private restoreUserState(): void {
    const userData = localStorage.getItem('users');
    if (userData) {
      try {
        const parsedData = JSON.parse(userData);
        if (parsedData.token) {
          // Restore user state immediately
          this.store.dispatch(loginAction({ item: parsedData }));
          
          // If we're on the login page, redirect to home
          if (this.router.url === '/login') {
            this.router.navigate(['/']);
          }
        }
      } catch (error) {
        console.error('Error restoring user state:', error);
        localStorage.removeItem('users');
      }
    }
  }
}
