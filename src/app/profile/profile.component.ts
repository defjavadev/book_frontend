import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { UserService } from '../user.service';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { BookData } from '../alldata';
import { take } from 'rxjs/operators';
import { loginAction } from '../store/actions/app.action';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  loading: boolean = false;
  showError: boolean = false;
  errorMessage: string = '';
  showSuccess: boolean = false;
  successMessage: string = '';
  update: boolean = false;
  userId: string = '';
  token: string = '';
  role: string = '';
  userData: any = {};
  authorData: BookData[] = [];
  purchasedBooks: BookData[] = [];
  updateData = {
    name: '',
    image: ''
  };
  newBook = {
    title: '',
    genre: '',
    description: '',
    price: 0,
    pages: 0,
    imageLink: ''
  };

  constructor(
    private store: Store,
    private userService: UserService,
    private router: Router,
    private titleService: Title
  ) {
    this.titleService.setTitle('Profile - BookHub Platform');
  }

  ngOnInit(): void {
    this.store.select((state: any) => state.app.users).subscribe(users => {
      if (users) {
        console.log('Store Users:', users);
        this.userId = users._id;
        this.token = users.token;
        this.role = users.role;
        this.getUserData();
      } else {
        this.router.navigate(['/login']);
      }
    });
  }

  getUserData(): void {
    this.loading = true;
    this.userService.getUserProfile(this.userId, this.token, this.role).subscribe({
      next: (response: any) => {
        console.log('User Profile Response:', response);
        if (this.role === 'user') {
          this.userData = response.user;
          // Check if purchased exists in userData
          if (this.userData.purchased) {
            console.log('Found purchased books:', this.userData.purchased);
            this.purchasedBooks = this.userData.purchased;
          } else {
            console.log('No purchased books found in user data');
            this.purchasedBooks = [];
          }
        } else {
          this.userData = response.author;
          this.getAuthorBooks();
        }
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Error fetching user data:', error);
        this.showError = true;
        this.errorMessage = error.error?.msg || 'Failed to fetch user data';
        this.loading = false;
      }
    });
  }

  getAuthorBooks(): void {
    this.loading = true;
    this.userService.getAuthorBooks(this.userId, this.token).subscribe({
      next: (response: any) => {
        console.log('Author books response:', response);
        if (response && response.books) {
          this.authorData = response.books;
          this.loading = false;
        } else {
          console.warn('No books found in response');
          this.authorData = [];
          this.loading = false;
        }
      },
      error: (error: any) => {
        console.error('Error fetching author books:', error);
        this.showError = true;
        this.errorMessage = error.message || 'Failed to fetch author books';
        this.loading = false;
        this.authorData = []; // Reset author data on error
      }
    });
  }

  shortName(): string {
    if (!this.userData.name) return '';
    const names = this.userData.name.split(' ');
    if (names.length >= 2) {
      return (names[0][0] + names[1][0]).toUpperCase();
    }
    return names[0].substring(0, 2).toUpperCase();
  }

  onToggle(): void {
    this.update = !this.update;
    if (this.update) {
      this.updateData.name = this.userData.name;
      this.updateData.image = this.userData.image || '';
    }
  }

  updateName(event: any): void {
    this.updateData.name = event.target.value;
  }

  updateImage(event: any) {
    this.updateData.image = event.target.value;
    // Basic URL validation
    if (this.updateData.image && !this.isValidUrl(this.updateData.image)) {
      this.showError = true;
      this.errorMessage = 'Please enter a valid image URL';
      return;
    }
    this.showError = false;
  }

  private isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  handleImageError(event: any) {
    // If image fails to load, remove it from userData to show initials instead
    this.userData.image = null;
    // Update the store
    this.store.select((state: any) => state.app.users).pipe(take(1)).subscribe(users => {
      if (users) {
        const updatedUser = { ...users, image: null };
        this.store.dispatch(loginAction({ item: updatedUser }));
        // Update localStorage
        localStorage.setItem('users', JSON.stringify(updatedUser));
      }
    });
  }

  formSubmit(event: Event): void {
    event.preventDefault();
    this.loading = true;
    this.showError = false;
    this.showSuccess = false;

    if (this.updateData.image && !this.isValidUrl(this.updateData.image)) {
      this.showError = true;
      this.errorMessage = 'Please enter a valid image URL';
      this.loading = false;
      return;
    }

    this.userService.updateProfile(this.userId, this.token, this.updateData, this.role).subscribe({
      next: () => {
        this.getUserData();
        this.update = false;
        this.showSuccess = true;
        this.successMessage = 'Profile updated successfully';
        
        // Update store with new data
        this.store.select((state: any) => state.app.users)
          .pipe(take(1))
          .subscribe(users => {
            if (users) {
              const updatedUser = {
                ...users,
                name: this.updateData.name || users.name,
                image: this.updateData.image || users.image
              };
              this.store.dispatch(loginAction({ item: updatedUser }));
              localStorage.setItem('users', JSON.stringify(updatedUser));
            }
          });
      },
      error: (error: any) => {
        console.error('Error updating profile:', error);
        this.showError = true;
        this.errorMessage = error.message || 'Failed to update profile';
        this.loading = false;
        
        if (error.status === 401) {
          // Handle unauthorized error - redirect to login
          this.router.navigate(['/login']);
        }
      }
    });
  }

  // Book management methods for authors
  bookTitle(event: any): void {
    this.newBook.title = event.target.value;
  }

  bookGenre(event: any): void {
    this.newBook.genre = event.target.value;
  }

  bookDes(event: any): void {
    this.newBook.description = event.target.value;
  }

  bookPrice(event: any): void {
    this.newBook.price = parseFloat(event.target.value);
  }

  bookPage(event: any): void {
    this.newBook.pages = parseInt(event.target.value);
  }

  bookImage(event: any): void {
    this.newBook.imageLink = event.target.value;
  }

  addBook(): void {
    if (!this.newBook.title || !this.newBook.genre || !this.newBook.description || 
        !this.newBook.price || !this.newBook.pages || !this.newBook.imageLink) {
      this.showError = true;
      this.errorMessage = 'Please fill in all fields';
      return;
    }

    this.loading = true;
    this.userService.addBook(this.userId, this.token, this.newBook).subscribe({
      next: () => {
        this.getAuthorBooks();
        this.update = false;
        this.showSuccess = true;
        this.successMessage = 'Book added successfully';
        this.newBook = {
          title: '',
          genre: '',
          description: '',
          price: 0,
          pages: 0,
          imageLink: ''
        };
      },
      error: (error: any) => {
        console.error('Error adding book:', error);
        this.showError = true;
        this.errorMessage = error.error?.msg || 'Failed to add book';
        this.loading = false;
      }
    });
  }

  deleteBook(bookId: string): void {
    if (confirm('Are you sure you want to delete this book?')) {
      this.loading = true;
      this.userService.deleteBook(this.userId, this.token, bookId).subscribe({
        next: () => {
          this.getAuthorBooks();
          this.showSuccess = true;
          this.successMessage = 'Book deleted successfully';
        },
        error: (error: any) => {
          console.error('Error deleting book:', error);
          this.showError = true;
          this.errorMessage = error.error?.msg || 'Failed to delete book';
          this.loading = false;
        }
      });
    }
  }
}
