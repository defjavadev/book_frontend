import { Component, OnInit, OnDestroy } from '@angular/core';
import { LoginService } from '../login.service';
import { Store } from '@ngrx/store';
import { loginAction } from '../store/actions/app.action';
import { Router, ActivatedRoute } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { NgForm } from '@angular/forms';
import { Subscription, filter } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit, OnDestroy {
  formData = {
    identifier: '',
    password: ''
  };
  showError = false;
  errorMessage = '';
  sessionExpired = false;
  current: string = 'User';
  loading: boolean = false;
  private storeSub: Subscription | undefined;

  constructor(
    private loginService: LoginService,
    private store: Store,
    private router: Router,
    private route: ActivatedRoute,
    private titleService: Title
  ) {
    this.titleService.setTitle('Login - BookHub Platform');
  }

  ngOnInit(): void {
    // Check if redirected due to session expiration
    this.route.queryParams.subscribe(params => {
      this.sessionExpired = params['sessionExpired'] === 'true';
      if (this.sessionExpired) {
        this.showError = true;
        this.errorMessage = 'Your session has expired. Please login again.';
      }
    });

    // Check if user is already logged in
    this.storeSub = this.store
      .select((state: any) => state.app.users)
      .pipe(filter(users => users !== null))
      .subscribe(users => {
        if (users?.token) {
          this.router.navigate(['/']);
        }
      });
  }

  ngOnDestroy(): void {
    if (this.storeSub) {
      this.storeSub.unsubscribe();
    }
  }

  validateForm(): boolean {
    if (!this.formData.identifier || !this.formData.password) {
      this.showError = true;
      this.errorMessage = 'Please fill in all fields';
      return false;
    }
    if (this.formData.identifier.length < 3) {
      this.showError = true;
      this.errorMessage = 'Username/Email must be at least 3 characters long';
      return false;
    }
    if (this.formData.password.length < 6) {
      this.showError = true;
      this.errorMessage = 'Password must be at least 6 characters long';
      return false;
    }
    return true;
  }

  onSubmit(form: NgForm) {
    if (!form.valid || !this.validateForm()) {
      return;
    }

    this.loading = true;
    this.showError = false;

    const loginData = {
      identifier: this.formData.identifier.trim(),
      password: this.formData.password
    };

    const service = this.current === 'User' 
      ? this.loginService.userLogin(loginData)
      : this.loginService.authorLogin(loginData);

    service.subscribe({
      next: (response: any) => {
        console.log('Login response:', response);
        if (response && response.token && response.user) {
          const userData = {
            _id: response.user._id,
            token: response.token,
            name: response.user.name || '',
            username: response.user.username,
            role: this.current.toLowerCase(),
            image: response.user.image || null
          };
          
          this.store.dispatch(loginAction({ item: userData }));
          this.loading = false;
          this.router.navigate(['/']);
        } else {
          this.showError = true;
          this.errorMessage = 'Invalid response from server';
          this.loading = false;
        }
      },
      error: (error: HttpErrorResponse) => {
        console.error('Login error:', error);
        this.showError = true;
        this.errorMessage = error.error?.msg || 'Invalid credentials';
        this.loading = false;
      }
    });
  }

  toggleCurrent() {
    this.current = this.current === 'User' ? 'Author' : 'User';
    this.showError = false;
  }
}
