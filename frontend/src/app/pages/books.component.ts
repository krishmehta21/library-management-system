import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BookService } from '../book.service';

// 1. Define strict interfaces for better Type Safety
export interface Book {
  book_id: number;
  title: string;
  author: string;
  category: string;
  quantity: number;
  available_quantity: number;
}

export interface Author {
  name: string;
}

export interface Category {
  name: string;
}

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
<section class="books-page">

  <div class="page-header">
    <div>
      <h1>Books</h1>
      <p class="subtitle">Manage library inventory</p>
    </div>

    <input
      [(ngModel)]="search"
      placeholder="Search by title, author or category..."
      class="search-box"
    >
  </div>

  <div class="panel add-panel">
    <h3>Add New Book</h3>

    <div class="add-form">
      <div class="row">
        <input [(ngModel)]="title" placeholder="Book title" [disabled]="isSaving">
        <input [(ngModel)]="quantity" type="number" min="1" placeholder="Quantity" [disabled]="isSaving">
      </div>

      <div class="row">
        <select [(ngModel)]="selectedAuthor" [disabled]="isSaving">
          <option [ngValue]="null">Select author</option>
          <option *ngFor="let a of authors" [ngValue]="a.name">
            {{a.name}}
          </option>
        </select>

        <input [(ngModel)]="author_name" placeholder="Or add new author" [disabled]="isSaving">
      </div>

      <div class="row">
        <select [(ngModel)]="selectedCategory" [disabled]="isSaving">
          <option [ngValue]="null">Select category</option>
          <option *ngFor="let c of categories" [ngValue]="c.name">
            {{c.name}}
          </option>
        </select>

        <input [(ngModel)]="category_name" placeholder="Or add new category" [disabled]="isSaving">
      </div>

      <button 
        class="primary-btn full" 
        (click)="add()" 
        [disabled]="isSaving || !title || (!selectedAuthor && !author_name) || (!selectedCategory && !category_name)"
        [class.loading]="isSaving"
      >
        {{ isSaving ? 'Adding...' : 'Add Book' }}
      </button>
    </div>
  </div>

  <div class="panel">
    <table>
      <thead>
        <tr>
          <th>Title</th>
          <th>Author</th>
          <th>Category</th>
          <th>Total</th>
          <th>Available</th>
          <th></th>
        </tr>
      </thead>

      <tbody>
        <tr *ngFor="let b of filteredBooksList">
          <td>{{b.title}}</td>
          <td>{{b.author}}</td>
          <td>{{b.category}}</td>
          <td>{{b.quantity}}</td>
          <td>{{b.available_quantity}}</td>
          <td>
            <button class="danger small" (click)="del(b.book_id)">
              Delete
            </button>
          </td>
        </tr>
        
        <tr *ngIf="filteredBooksList.length === 0">
          <td colspan="6" style="text-align: center; color: #94a3b8; padding: 20px;">
            No books found.
          </td>
        </tr>
      </tbody>
    </table>
  </div>

</section>
`
})
export class BooksComponent implements OnInit {
  // Data arrays
  books: Book[] = [];
  authors: Author[] = [];
  categories: Category[] = [];
  filteredBooksList: Book[] = []; 

  // Form states
  title = '';
  quantity = 1;
  selectedAuthor: string | null = null;
  selectedCategory: string | null = null;
  author_name = '';
  category_name = '';
  
  // UI states
  isSaving = false;

  // Search logic utilizing Getter/Setter to prevent performance issues
  private _search = '';
  get search(): string {
    return this._search;
  }
  set search(value: string) {
    this._search = value;
    this.applyFilter();
  }

  constructor(private service: BookService) {}

  ngOnInit() {
    this.loadAll();
  }

  loadAll() {
    // Ideally, these could be wrapped in a forkJoin for better control, 
    // but keeping it simple and functional here:
    this.service.getBooks().subscribe({
      next: (b) => {
        this.books = b;
        this.applyFilter(); // Update list whenever new data comes in
      },
      error: (err) => console.error('Failed to load books', err)
    });

    this.service.getAuthors().subscribe(a => this.authors = a);
    this.service.getCategories().subscribe(c => this.categories = c);
  }

  applyFilter() {
    const searchTerm = this._search.toLowerCase().trim();
    if (!searchTerm) {
      this.filteredBooksList = [...this.books];
      return;
    }

    this.filteredBooksList = this.books.filter(b => 
      b.title?.toLowerCase().includes(searchTerm) ||
      b.author?.toLowerCase().includes(searchTerm) ||
      b.category?.toLowerCase().includes(searchTerm)
    );
  }

  add() {
    const author = this.selectedAuthor || this.author_name;
    const category = this.selectedCategory || this.category_name;

    if (!this.title || !author || !category) return;

    this.isSaving = true;

    this.service.addBook({
      title: this.title,
      author_name: author,
      category_name: category,
      quantity: this.quantity
    }).subscribe({
      next: () => {
        this.reset();
        this.loadAll();
        this.isSaving = false;
      },
      error: (err) => {
        console.error('Failed to add book', err);
        this.isSaving = false;
        // Optional: Show error toast here
      }
    });
  }

  reset() {
    this.title = '';
    this.quantity = 1;
    this.selectedAuthor = null;
    this.selectedCategory = null;
    this.author_name = '';
    this.category_name = '';
  }

  del(id: number) {
    if (confirm('Are you sure you want to delete this book?')) {
      this.service.deleteBook(id).subscribe({
        next: () => this.loadAll(),
        error: (err) => console.error('Failed to delete book', err)
      });
    }
  }
}