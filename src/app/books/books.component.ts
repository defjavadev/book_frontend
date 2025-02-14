import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { BookdataService } from '../bookdata.service';
import { storeBookAction } from '../store/actions/app.action';
import { BookData } from '../alldata';
import { Title } from '@angular/platform-browser';
import { UserService } from '../user.service';

@Component({
  selector: 'app-books',
  templateUrl: './books.component.html',
  styleUrls: ['./books.component.css']
})
export class BooksComponent implements OnInit {
  loading: boolean = false;
  bookData: BookData[] = [];
  token: string = '';
  userId: string = '';
  role: string = '';
  showError: boolean = false;
  errorMessage: string = '';
  page: number = 1;
  total: number[] = [];
  title: string = '';
  genre: string = '';
  author_name: string = '';
  userCartData: BookData[] = [];

  constructor(
    private store: Store,
    private bookService: BookdataService,
    private userService: UserService,
    private titleService: Title
  ) {
    this.titleService.setTitle('Books - BookHub Platform');
  }

  ngOnInit(): void {
    this.store.select((state: any) => state.app.users).subscribe(users => {
      if (users) {
        this.token = users.token;
        this.userId = users._id;
        this.role = users.role;
        if (this.role === 'user') {
          this.getUserCartData();
        }
      }
    });

    this.getBookData();
  }

  getBookData(): void {
    this.loading = true;
    this.bookService.getBook(this.page, this.title, this.genre, this.author_name).subscribe({
      next: (response: any) => {
        console.log('Books API response:', response);
        if (response?.books) {
          this.bookData = response.books;
          if (response.total) {
            this.total = new Array(Math.ceil(response.total / 20)).fill(0);
          }
          this.store.dispatch(storeBookAction({ product: response.books }));
        }
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Error fetching books:', error);
        this.showError = true;
        this.errorMessage = error.error?.msg || 'Failed to fetch books';
        this.loading = false;
      }
    });
  }

  getUserCartData(): void {
    if (this.userId && this.token) {
      this.userService.getUserCart(this.userId).subscribe({
        next: (response: any) => {
          this.userCartData = response.cart || [];
        },
        error: (error: any) => {
          console.error('Error fetching user cart:', error);
          this.showError = true;
          this.errorMessage = error.error?.msg || 'Failed to fetch cart';
        }
      });
    }
  }

  onTitle(event: Event): void {
    this.title = (event.target as HTMLInputElement).value;
    this.page = 1;
    this.getBookData();
  }

  onGenre(event: Event): void {
    this.genre = (event.target as HTMLSelectElement).value;
    this.page = 1;
    this.getBookData();
  }

  onAuthor(event: Event): void {
    this.author_name = (event.target as HTMLInputElement).value;
    this.page = 1;
    this.getBookData();
  }

  onPage(i: number): void {
    this.page = i + 1;
    this.getBookData();
  }

  checkCart(id: string): boolean {
    return this.userCartData.some(item => item._id === id);
  }

  addToCart(id: string): void {
    if (!this.userId || !this.token) {
      this.showError = true;
      this.errorMessage = 'Please login first';
      return;
    }

    const bookToAdd = this.bookData.find(book => book._id === id);
    if (!bookToAdd) {
      return;
    }

    const updatedCart = [...this.userCartData, bookToAdd];
    this.loading = true;

    this.userService.updateCart(this.userId, this.token, updatedCart).subscribe({
      next: () => {
        this.getUserCartData();
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Error updating cart:', error);
        this.showError = true;
        this.errorMessage = error.error?.msg || 'Failed to update cart';
        this.loading = false;
      }
    });
  }
}
