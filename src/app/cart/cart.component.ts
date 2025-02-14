import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { UserService } from '../user.service';
import { BookData } from '../alldata';
import { Title } from '@angular/platform-browser';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css']
})
export class CartComponent implements OnInit {
  loading: boolean = false;
  userCartData: BookData[] = [];
  userId: string = '';
  token: string = '';
  name: string = '';
  role: string = '';
  showError: boolean = false;
  errorMessage: string = '';
  showSuccess: boolean = false;
  successMessage: string = '';
  paymentLoading: boolean = false;
  paymentData = {
    name: '',
    mobile: '',
    address: '',
    payment: ''
  };

  constructor(
    private store: Store,
    private userService: UserService,
    private router: Router,
    private titleService: Title
  ) {
    this.titleService.setTitle('Cart - BookHub Platform');
  }

  ngOnInit(): void {
    this.store.select((state: any) => state.app.users).subscribe(users => {
      if (users) {
        this.userId = users._id;
        this.token = users.token;
        this.name = users.name;
        this.role = users.role;
        
        if (this.role !== 'user') {
          this.router.navigate(['/']);
          return;
        }
        
        this.getUserCartData();
      }
    });
  }

  getUserCartData(): void {
    if (!this.userId || !this.token) {
      this.showError = true;
      this.errorMessage = 'Please login to view your cart';
      return;
    }

    this.loading = true;
    this.userService.getUserProfile(this.userId, this.token).subscribe({
      next: (response: any) => {
        this.userCartData = response.user.cart || [];
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Error fetching cart:', error);
        this.showError = true;
        this.errorMessage = error.error?.msg || 'Failed to fetch cart';
        this.loading = false;
      }
    });
  }

  removeCart(id: string): void {
    if (!this.userId || !this.token) {
      this.showError = true;
      this.errorMessage = 'Please login to modify your cart';
      return;
    }

    const updatedCart = this.userCartData.filter(item => item._id !== id);
    this.loading = true;

    this.userService.updateCart(this.userId, this.token, updatedCart).subscribe({
      next: () => {
        this.getUserCartData();
        this.showSuccess = true;
        this.successMessage = 'Item removed from cart';
      },
      error: (error: any) => {
        console.error('Error removing from cart:', error);
        this.showError = true;
        this.errorMessage = error.error?.msg || 'Failed to remove item from cart';
        this.loading = false;
      }
    });
  }

  totalPrice(): number {
    return this.userCartData.reduce((total, item) => total + (item.price || 0), 0);
  }

  formSubmit(form: NgForm): void {
    if (!form.valid) {
      return;
    }

    if (!this.userId || !this.token) {
      this.showError = true;
      this.errorMessage = 'Please login to checkout';
      return;
    }

    this.paymentLoading = true;

    // Clear the cart after successful payment
    this.userService.updateCart(this.userId, this.token, []).subscribe({
      next: () => {
        this.paymentLoading = false;
        this.showSuccess = true;
        this.successMessage = 'Order placed successfully!';
        this.router.navigate(['/profile']);
      },
      error: (error: any) => {
        console.error('Error during checkout:', error);
        this.showError = true;
        this.errorMessage = error.error?.msg || 'Failed to complete checkout';
        this.paymentLoading = false;
      }
    });
  }
}
