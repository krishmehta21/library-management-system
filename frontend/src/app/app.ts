import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { BookService } from './book.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  template: `
    <h1>📚 Library Management</h1>

    <input [(ngModel)]="title" placeholder="Title">
    <input [(ngModel)]="author" placeholder="Author">
    <input [(ngModel)]="quantity" type="number" placeholder="Qty">

    <button (click)="add()">Add Book</button>

    <ul>
      <li *ngFor="let b of books">
        {{b.title}} - {{b.author}}
        <button (click)="del(b.book_id)">❌</button>
      </li>
    </ul>
  `
})
export class App {
  books:any[]=[];
  title='';
  author='';
  quantity=1;

  constructor(private service: BookService) {
    this.load();
  }

  load() {
    this.service.getBooks().subscribe((d:any)=> this.books = d);
  }

  add() {
    this.service.addBook({
      title: this.title,
      author: this.author,
      quantity: this.quantity
    }).subscribe(()=> this.load());
  }

  del(id:number) {
    this.service.deleteBook(id).subscribe(()=> this.load());
  }
}
