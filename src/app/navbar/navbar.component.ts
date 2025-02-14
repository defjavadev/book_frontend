import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { filter } from 'rxjs';
import { loginAction } from '../store/actions/app.action';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  menuOpen: boolean = false;
  name: string = '';
  username: string = '';
  id: string = '';
  role: string = '';
  userImg: string = '';
  isValidImage: boolean = true;

  constructor(private store: Store) {}

  ngOnInit(): void {
    this.store.select((state: any) => state.app.users)
      .pipe(
        filter(users => users !== null)
      )
      .subscribe((users) => {
        if (users) {
          this.name = users.name || '';
          this.username = users.username || '';
          this.id = users._id || '';
          this.role = users.role || '';
          this.userImg = users.image || '';
          this.isValidImage = !!users.image;
        }
      });
  }

  checkAuth(): boolean {
    return !!(this.name && this.username && this.id);
  }

  checkRole(): boolean {
    return this.role === 'user';
  }

  shortName(): string {
    if (!this.name) return '';
    const names = this.name.split(' ');
    if (names.length >= 2) {
      return (names[0][0] + names[1][0]).toUpperCase();
    }
    return names[0].substring(0, 2).toUpperCase();
  }

  handleImageError(): void {
    this.isValidImage = false;
    this.userImg = '';
    
    // Update the store
    this.store.select((state: any) => state.app.users)
      .pipe(take(1))
      .subscribe(users => {
        if (users) {
          const updatedUser = { ...users, image: null };
          this.store.dispatch(loginAction({ item: updatedUser }));
          // Update localStorage
          localStorage.setItem('users', JSON.stringify(updatedUser));
        }
      });
  }

  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
  }

  closeMenu(){
    this.menuOpen = false;
  }

  doLogout(){
    localStorage.removeItem('users');
    localStorage.removeItem('userImg')
    window.location.reload();
  }
}
