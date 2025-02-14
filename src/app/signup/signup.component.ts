import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { SignupService } from '../signup.service';
import { SignupData } from '../alldata';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Title } from '@angular/platform-browser';
import { filter } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent implements OnInit {
  data: SignupData = {username:'',name:'',email:'',password:''};
  current: string = 'User';
  usernameAvailabiliy: boolean = true;
  loading: boolean = false;
  showError: boolean = false;
  errorMessage: string = '';
  showSuccess: boolean = false;
  successMessage: string = '';

  constructor(
    private signupService: SignupService,
    private store: Store,
    private router: Router,
    private titleService: Title
  ) {
    this.titleService.setTitle('Signup - BookHub Platform');
  }

  ngOnInit(): void {
    // Check if user is already logged in
    this.store.select((state: any) => state.app?.users?.token)
      .pipe(
        filter(token => token !== undefined)
      )
      .subscribe({
        next: (token) => {
          if (token) {
            this.router.navigate(['']);
          }
        },
        error: (error: Error) => {
          console.error('Error accessing store:', error);
        }
      });

    window.scrollTo({top: 0});
  }

  onToggle(event: Event): void {
    const checkbox = event.target as HTMLInputElement;
    this.current = checkbox.checked ? 'User' : 'Author';
  }

  onSubmit(form: NgForm): void {
    if (form.valid) {
      this.loading = true;
      this.showError = false;
      this.showSuccess = false;
      this.checkUsername();
    } else {
      this.showError = true;
      this.errorMessage = 'Please fill all required fields correctly';
    }
  }

  checkUsername = () => {
    const value = this.data.username;
    
    if (!value) {
      this.showError = true;
      this.errorMessage = 'Username is required';
      this.loading = false;
      return;
    }

    if (this.current === 'User') {
      this.signupService.checkUsername(value).subscribe({
        next: (data: any) => {
          if (data.available) {
            this.usernameAvailabiliy = true;
            this.doSignup();
          } else {
            this.usernameAvailabiliy = false;
            this.loading = false;
            this.showError = true;
            this.errorMessage = 'Username is not available';
          }
        },
        error: (error: HttpErrorResponse) => {
          console.error('Username check error:', error);
          this.usernameAvailabiliy = false;
          this.loading = false;
          this.showError = true;
          this.errorMessage = error.error?.msg || 'Username check failed';
        }
      });
    } else if (this.current === 'Author') {
      this.signupService.checkAuthorusername(value).subscribe({
        next: (data: any) => {
          if (data.available) {
            this.usernameAvailabiliy = true;
            this.doSignup();
          } else {
            this.usernameAvailabiliy = false;
            this.loading = false;
            this.showError = true;
            this.errorMessage = 'Username is not available';
          }
        },
        error: (error: HttpErrorResponse) => {
          console.error('Author username check error:', error);
          this.usernameAvailabiliy = false;
          this.loading = false;
          this.showError = true;
          this.errorMessage = error.error?.msg || 'Username check failed';
        }
      });
    }
  }

  doSignup = () => {
    if (this.current === 'User') {
      this.signupService.userSignup(this.data).subscribe({
        next: (response: any) => {
          this.showSuccess = true;
          this.successMessage = response.msg || 'Signup successful';
          this.loading = false;
          this.router.navigate(['login']);
        },
        error: (error: HttpErrorResponse) => {
          console.error('User signup error:', error);
          this.showError = true;
          this.errorMessage = error.error?.msg || 'Signup failed';
          this.loading = false;
        }
      });
    } else {
      this.signupService.authorSignup(this.data).subscribe({
        next: (response: any) => {
          this.showSuccess = true;
          this.successMessage = response.msg || 'Author signup successful';
          this.loading = false;
          this.router.navigate(['login']);
        },
        error: (error: HttpErrorResponse) => {
          console.error('Author signup error:', error);
          this.showError = true;
          this.errorMessage = error.error?.msg || 'Author signup failed';
          this.loading = false;
        }
      });
    }
  }
}
