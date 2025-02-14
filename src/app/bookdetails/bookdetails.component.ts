import { Component, OnInit } from '@angular/core';
import { BookdataService } from '../bookdata.service';
import { Store } from '@ngrx/store';
import { ActivatedRoute } from '@angular/router';
import { BookData } from '../alldata';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-bookdetails',
  templateUrl: './bookdetails.component.html',
  styleUrls: ['./bookdetails.component.css']
})
export class BookdetailsComponent implements OnInit {
  userId: string = '';
  username: string = '';
  token: string = '';
  loading: boolean = false;
  contentLoading: boolean = false;
  reviewLoading: boolean = false;
  role: string = '';
  bookId: string = '';
  bookData: BookData = {
    _id: '',
    title: '',
    genre: '',
    description: '',
    price: 0,
    pages: 0,
    published: 0,
    imageLink: 'assets/default-book.jpg',
    author_id: '',
    author_name: '',
    likes: []
  };
  reviewData: { comments: Array<any>, book_id: string, _id: string }[] = [];
  bookContent: string = '';
  addComment: string = '';
  replyComment: string = '';
  showError: boolean = false;
  errorMessage: string = '';
  showSuccess: boolean = false;
  successMessage: string = '';

  constructor(
    private store: Store,
    private bookdataService: BookdataService,
    private route: ActivatedRoute,
    private titleService: Title
  ) {
    this.titleService.setTitle('BookInfo - BookHub Platform');
  }

  ngOnInit(): void {
    this.store.select((state: any) => state.app.users).subscribe((users) => {
      if (users) {
        this.userId = users._id;
        this.username = users.username;
        this.token = users.token;
        this.role = users.role;
      }
    });

    this.route.params.subscribe(params => {
      this.bookId = params['id'];
      this.getBookData();
      this.getReviewData();
    });
  }

  getBookData = () => {
    this.bookdataService.getSingleBook(this.bookId).subscribe({
      next: (response: any) => {
        this.loading = false;
        if (response && response.book) {
          this.bookData = {
            ...this.bookData,
            ...response.book,
            likes: response.book.likes || []
          };
        } else {
          console.error('Invalid book data format:', response);
          this.showError = true;
          this.errorMessage = 'Failed to load book details';
        }
      },
      error: (error) => {
        console.error('Error fetching book:', error);
        this.showError = true;
        this.errorMessage = 'Failed to load book details';
        this.loading = false;
      }
    });
  };

  getReviewData = () => {
    this.reviewLoading = true;
    this.bookdataService.getReview(this.bookId).subscribe({
      next: (data: any) => {
        this.reviewLoading = false;
        if (data && Array.isArray(data.review)) {
          this.reviewData = data.review;
        } else {
          console.error('Invalid review data format:', data);
          this.reviewData = [];
          this.showError = true;
          this.errorMessage = 'Failed to load reviews';
        }
      },
      error: (error) => {
        console.error('Error fetching reviews:', error);
        this.reviewLoading = false;
        this.reviewData = [];
        this.showError = true;
        this.errorMessage = 'Failed to load reviews';
      }
    });
  };

  addComm = (event: any) => {
    this.addComment = event.target.value;
  };

  replyComm = (event: any) => {
    this.replyComment = event.target.value;
  };

  addRe = () => {
    if (!this.token) {
      this.showError = true;
      this.errorMessage = 'Please login first';
      return;
    }

    if (!this.addComment.trim()) {
      this.showError = true;
      this.errorMessage = 'Please write a comment';
      return;
    }

    const item = {
      comment: this.addComment,
      user_id: this.userId,
      published: new Date().toLocaleString(),
      username: this.username
    };

    this.bookdataService.addComment(this.bookId, this.token, item).subscribe({
      next: (data: any) => {
        this.addComment = '';
        this.getReviewData();
        this.showSuccess = true;
        this.successMessage = 'Comment added successfully';
      },
      error: (error: any) => {
        console.error('Error adding comment:', error);
        this.showError = true;
        this.errorMessage = 'Failed to add comment';
      }
    });
  };

  replyRe = (reviewId: string) => {
    if (!this.token) {
      this.showError = true;
      this.errorMessage = 'Please login first';
      return;
    }

    if (!this.replyComment.trim()) {
      this.showError = true;
      this.errorMessage = 'Please write a reply';
      return;
    }

    const item = {
      comment: this.replyComment,
      user_id: this.userId,
      published: new Date().toLocaleString(),
      username: this.username
    };

    this.bookdataService.replyComment(reviewId, this.token, item).subscribe({
      next: (data: any) => {
        this.replyComment = '';
        this.getReviewData();
        this.showSuccess = true;
        this.successMessage = 'Reply added successfully';
      },
      error: (error: any) => {
        console.error('Error replying to comment:', error);
        this.showError = true;
        this.errorMessage = 'Failed to add reply';
      }
    });
  };

  onImageError = (event: any) => {
    event.target.src = 'assets/default-book.jpg';
  };

  clickLike = () => {
    if (!this.token) {
      this.showError = true;
      this.errorMessage = 'Please login first';
      return;
    }

    this.bookdataService.updateLike(this.bookId, this.token).subscribe({
      next: (data: any) => {
        this.getBookData();
        this.showSuccess = true;
        this.successMessage = 'Book like status updated';
      },
      error: (error) => {
        console.error('Error updating like:', error);
        this.showError = true;
        this.errorMessage = 'Failed to update like status';
      }
    });
  };

  onComment = () => {
    const element = document.getElementById('comments');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  onWhatsapp = () => {
    const text = `Check out this book: ${this.bookData.title} by ${this.bookData.author_name}`;
    const url = `whatsapp://send?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  onFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`;
    window.open(url, '_blank');
  };

  onPrint = () => {
    window.print();
  };
}
