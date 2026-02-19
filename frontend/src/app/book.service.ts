import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class BookService {

  private base = 'http://localhost:5000';

  constructor(private http: HttpClient) {}

  /* ===================== BOOKS ===================== */

  getBooks() {
    return this.http.get<any[]>(`${this.base}/books`);
  }

  addBook(book:any) {
    return this.http.post(`${this.base}/books`, book);
  }

  updateBook(book:any) {
    return this.http.put(`${this.base}/books/${book.book_id}`, book);
  }

  deleteBook(id:number) {
    return this.http.delete(`${this.base}/books/${id}`);
  }

  /* ===================== USERS ===================== */

  getUsers() {
    return this.http.get<any[]>(`${this.base}/users`);
  }

  addUser(user:any) {
    return this.http.post(`${this.base}/users`, user);
  }

  deleteUser(id:number) {
    return this.http.delete(`${this.base}/users/${id}`);
  }

  /* ===================== TRANSACTIONS ===================== */

  getTransactions() {
    return this.http.get<any[]>(`${this.base}/transactions`);
  }

  issueBook(data:{user_id:number, book_id:number}) {
    return this.http.post(`${this.base}/issue`, data);
  }

  returnBook(id:number) {
    return this.http.post(`${this.base}/return/${id}`, {});
  }

  /* ===================== DASHBOARD ===================== */

  getStats() {
    return this.http.get(`${this.base}/stats`);
  }
  /* AUTHORS */
getAuthors() {
  return this.http.get<any[]>(`${this.base}/authors`);
}

/* CATEGORIES */
getCategories() {
  return this.http.get<any[]>(`${this.base}/categories`);
}

}
