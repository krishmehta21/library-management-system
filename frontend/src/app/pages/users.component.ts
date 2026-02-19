import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BookService } from '../book.service';

@Component({
  standalone:true,
  imports:[CommonModule,FormsModule],
  template: `
<section class="users-page">

  <div class="page-header">
    <div>
      <h1>Users</h1>
      <p class="subtitle">Manage library members</p>
    </div>

    <input
      [(ngModel)]="search"
      placeholder="Search users..."
      class="search-box"
    >
  </div>

  <!-- Toast -->
  <div *ngIf="message" class="toast" [class.error]="isError">
    {{message}}
  </div>

  <!-- Add User -->
  <div class="panel">
    <h3>Add New User</h3>

    <div class="form modern-form">
      <input [(ngModel)]="name" placeholder="Full name">
      <input [(ngModel)]="email" placeholder="Email address">
      <button (click)="add()">Add User</button>
    </div>
  </div>

  <!-- Users Table -->
  <div class="panel">
    <table>
      <thead>
        <tr>
          <th>Name</th>
          <th>Email</th>
          <th></th>
        </tr>
      </thead>

      <tbody>
        <tr *ngFor="let u of filteredUsers()">
          <td>{{u.name}}</td>
          <td>{{u.email}}</td>
          <td>
            <button class="danger small" (click)="confirmDelete(u)">
              Delete
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>

</section>

<!-- CONFIRM MODAL -->
<div class="modal-overlay" *ngIf="deleteTarget">
  <div class="modal-box">
    <h3>Confirm Delete</h3>
    <p>Are you sure you want to delete <strong>{{deleteTarget.name}}</strong>?</p>

    <div class="modal-actions">
      <button class="danger" (click)="del(deleteTarget.user_id)">Yes, Delete</button>
      <button (click)="deleteTarget=null">Cancel</button>
    </div>
  </div>
</div>
`
})
export class UsersComponent implements OnInit {

  users:any[]=[];
  name='';
  email='';
  search='';

  message='';
  isError=false;

  deleteTarget:any=null;

  constructor(private service:BookService){}

  ngOnInit(){
    this.load();
  }

  load(){
    this.service.getUsers().subscribe((u:any)=>this.users=u);
  }

  add(){
    if(!this.name || !this.email){
      this.showMessage("Please fill all fields", true);
      return;
    }

    this.service.addUser({
      name:this.name,
      email:this.email
    }).subscribe({
      next: ()=>{
        this.name='';
        this.email='';
        this.load();
        this.showMessage("User added successfully");
      },
      error: ()=>{
        this.showMessage("Error adding user (maybe duplicate email?)", true);
      }
    });
  }

  confirmDelete(user:any){
    this.deleteTarget = user;
  }

  del(id:number){
    this.service.deleteUser(id).subscribe({
      next: ()=>{
        this.deleteTarget=null;
        this.load();
        this.showMessage("User deleted");
      },
      error: ()=>{
        this.showMessage("Error deleting user", true);
      }
    });
  }

  filteredUsers(){
    return this.users.filter(u =>
      u.name.toLowerCase().includes(this.search.toLowerCase()) ||
      u.email.toLowerCase().includes(this.search.toLowerCase())
    );
  }

  showMessage(msg:string, error=false){
    this.message = msg;
    this.isError = error;

    setTimeout(()=>{
      this.message='';
    },3000);
  }
}
