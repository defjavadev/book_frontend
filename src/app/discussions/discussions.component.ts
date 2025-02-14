import { Component, OnInit } from '@angular/core';
import { DiscussionService } from '../discussion.service';
import { Store } from '@ngrx/store';
import { BookData } from '../alldata';
import { BookdataService } from '../bookdata.service';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-discussions',
  templateUrl: './discussions.component.html',
  styleUrls: ['./discussions.component.css']
})
export class DiscussionsComponent implements OnInit {
  userId: string = '';
  username: string = '';
  token: string = '';
  loading: boolean = false;
  error: string = '';
  bookData: BookData[] = [];
  selectedBook: string = '';
  addComment: string = '';
  replyComment: string = '';
  discussionData: any = [];

  constructor(
    private titleService: Title,
    private discussionService: DiscussionService,
    private store: Store,
    private bookService: BookdataService,
    private router: Router
  ) {
    this.titleService.setTitle('Discussions - BookHub Platform');
  }

  ngOnInit(): void {
    // Get user data from store
    this.store.select((state: any) => state.app.users)
      .pipe(
        filter(users => users !== null) // Only proceed if users exists
      )
      .subscribe({
        next: (users) => {
          if (users) {
            this.userId = users._id;
            this.token = users.token;
            this.username = users.username;
            
            // Only fetch data if we have user authentication
            this.getBookData();
            this.getDiscussion();
          } else {
            console.warn('No user data found in store');
            this.router.navigate(['/login']);
          }
        },
        error: (error) => {
          console.error('Error accessing store:', error);
          this.error = 'Error accessing user data';
          this.router.navigate(['/login']);
        }
      });

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  getBookData(): void {
    this.loading = true;
    this.bookService.getBook(1, '', '', '').subscribe({
      next: (response: any) => {
        if (response && response.books) {
          this.bookData = response.books;
        } else {
          console.error('Invalid books response format:', response);
          this.bookData = [];
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error fetching books:', error);
        this.error = 'Failed to load books';
        this.bookData = [];
        this.loading = false;
      }
    });
  }

  getDiscussion(): void {
    if (!this.token) {
      console.warn('No auth token available');
      return;
    }

    this.loading = true;
    this.discussionService.getDiscussions(this.token).subscribe({
      next: (response: any) => {
        this.discussionData = response.discussions || [];
        this.loading = false;
      },
      error: (error) => {
        console.error('Error fetching discussions:', error);
        this.error = 'Failed to load discussions';
        this.discussionData = [];
        this.loading = false;
      }
    });
  }

  onSelect(event: any): void {
    this.selectedBook = event.target.value;
  }

  onComment(event: any): void {
    this.addComment = event.target.value;
  }

  onReply(event: any): void {
    this.replyComment = event.target.value;
  }

  onAdd(): void {
    if (!this.token || !this.selectedBook || !this.addComment.trim()) {
      this.error = 'Please select a book and add a comment';
      return;
    }

    this.loading = true;
    const data = {
      book_id: this.selectedBook,
      comment: this.addComment.trim()
    };

    this.discussionService.addDiscussion(data, this.token).subscribe({
      next: () => {
        this.getDiscussion();
        this.selectedBook = '';
        this.addComment = '';
        this.error = '';
      },
      error: (error) => {
        console.error('Error adding discussion:', error);
        this.error = 'Failed to add discussion';
        this.loading = false;
      }
    });
  }

  addReply(id: string): void {
    if (!this.token || !this.replyComment.trim()) {
      this.error = 'Please add a reply comment';
      return;
    }

    this.loading = true;
    const data = {
      reply: this.replyComment.trim()
    };

    this.discussionService.addReply(id, data, this.token).subscribe({
      next: () => {
        this.getDiscussion();
        this.replyComment = '';
        this.error = '';
      },
      error: (error) => {
        console.error('Error adding reply:', error);
        this.error = 'Failed to add reply';
        this.loading = false;
      }
    });
  }
}
