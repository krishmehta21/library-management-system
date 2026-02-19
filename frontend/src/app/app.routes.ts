import { Routes } from '@angular/router';

import { DashboardComponent } from './pages/dashboard.component';
import { BooksComponent } from './pages/books.component';
import { UsersComponent } from './pages/users.component';
import { TransactionsComponent } from './pages/transactions.component';

export const routes: Routes = [
  { path: '', component: DashboardComponent },
  { path: 'books', component: BooksComponent },
  { path: 'users', component: UsersComponent },
  { path: 'transactions', component: TransactionsComponent },
  { path: '**', redirectTo: '' }
];
