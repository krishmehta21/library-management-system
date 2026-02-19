import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BookService } from '../book.service';

@Component({
  standalone:true,
  imports:[CommonModule,FormsModule],
  template: `
<section class="transactions-page">

  <div class="page-header">
    <div>
      <h1>Transactions</h1>
      <p class="subtitle">Issue and return books</p>
    </div>
  </div>

  <!-- ISSUE BOOK -->
  <div class="panel">

    <h3>Issue Book</h3>

    <div class="form modern-form">

      <select [(ngModel)]="selectedUser">
        <option [ngValue]="null">Select user</option>
        <option *ngFor="let u of users" [ngValue]="u.user_id">
          {{u.name}}
        </option>
      </select>

      <select [(ngModel)]="selectedBook">
        <option [ngValue]="null">Select book</option>
        <option *ngFor="let b of books" [ngValue]="b.book_id">
          {{b.title}}
        </option>
      </select>

      <button (click)="issue()">Issue</button>

    </div>

  </div>

  <!-- HISTORY -->
  <div class="panel">

    <h3>Transaction History</h3>

    <table>
      <thead>
        <tr>
          <th>User</th>
          <th>Book</th>
          <th>Issued</th>
          <th>Status</th>
          <th>Fine</th>
          <th></th>
        </tr>
      </thead>

      <tbody>
        <tr *ngFor="let t of transactions">
          <td>{{t.user}}</td>
          <td>{{t.book}}</td>
          <td>{{t.issue_date | date}}</td>
          <td>{{t.returned ? 'Returned' : 'Issued'}}</td>
          <td>₹{{t.fine_amount}}</td>
          <td>
            <button 
              *ngIf="!t.returned" 
              class="small"
              (click)="returnBook(t.transaction_id)"
            >
              Return
            </button>
          </td>
        </tr>
      </tbody>
    </table>

  </div>

</section>
`
})
export class TransactionsComponent implements OnInit {

  users:any[]=[];
  books:any[]=[];
  transactions:any[]=[];

  selectedUser:any=null;
  selectedBook:any=null;

  constructor(private service:BookService){}

  ngOnInit(){
    this.loadAll();
  }

  loadAll(){
    this.service.getUsers().subscribe((u:any)=>this.users=u);
    this.service.getBooks().subscribe((b:any)=>this.books=b);
    this.service.getTransactions().subscribe((t:any)=>this.transactions=t);
  }

  issue(){
    if(!this.selectedUser || !this.selectedBook) return;

    this.service.issueBook({
      user_id:this.selectedUser,
      book_id:this.selectedBook
    }).subscribe(()=>{
      this.selectedUser=null;
      this.selectedBook=null;
      this.loadAll();
    });
  }

  returnBook(id:number){
    this.service.returnBook(id).subscribe(()=>this.loadAll());
  }
}
