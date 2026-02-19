import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template:`
<div class="layout">

  <aside class="sidebar">
    <div class="brand">
      <div class="logo-circle">L</div>
      <span>Library System</span>
    </div>

    <nav class="nav-group">

      <a routerLink="/" routerLinkActive="active" class="nav-item">
        <span class="icon">📊</span>
        <span>Dashboard</span>
      </a>

      <a routerLink="/books" routerLinkActive="active" class="nav-item">
        <span class="icon">📚</span>
        <span>Books</span>
      </a>

      <a routerLink="/users" routerLinkActive="active" class="nav-item">
        <span class="icon">👤</span>
        <span>Users</span>
      </a>

      <a routerLink="/transactions" routerLinkActive="active" class="nav-item">
        <span class="icon">🔄</span>
        <span>Transactions</span>
      </a>

    </nav>

    <div class="sidebar-footer">
      <small>Library Admin Panel</small>
    </div>
  </aside>

  <main class="main">
    <router-outlet></router-outlet>
  </main>

</div>
`

})
export class AppComponent {}
