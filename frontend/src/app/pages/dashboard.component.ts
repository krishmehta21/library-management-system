import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  imports: [CommonModule],
  template: `
<section class="dashboard">

  <!-- PROJECT HEADER -->
  <div class="hero">
    <h1>Library Management System</h1>
    <p class="subtitle">
      A database-backed web application implementing full CRUD operations 
      using Angular, Node.js (Express), and Cloud PostgreSQL.
    </p>
  </div>

  <!-- PROJECT DETAILS -->
  <div class="info-grid">

    <div class="info-card">
      <h3>Project Details</h3>
      <p><strong>Group:</strong> 7</p>
      <p><strong>Course:</strong> Database Management Systems</p>
      <p><strong>Objective:</strong> Design and implement a full CRUD-based relational system.</p>
    </div>

    <div class="info-card">
      <h3>Tech Stack</h3>
      <p><strong>Frontend:</strong> Angular</p>
      <p><strong>Backend:</strong> Node.js + Express</p>
      <p><strong>Database:</strong> PostgreSQL (Cloud - Supabase)</p>
      <p><strong>Architecture:</strong> REST API</p>
    </div>

    <div class="info-card">
      <h3>Core Features</h3>
      <ul>
        <li>Books Management (CRUD)</li>
        <li>User Management (CRUD)</li>
        <li>Issue & Return Workflow</li>
        <li>Fine Calculation</li>
        <li>Relational Schema with Foreign Keys</li>
      </ul>
    </div>

  </div>

  <!-- DATABASE SCHEMA -->
  <div class="schema-section">
    <h2>Database Schema</h2>
    <p class="schema-desc">
      The following ER/Schema diagram represents the relational structure 
      between Books, Users, and Transactions tables.
    </p>

    <div class="schema-wrapper">
      <img src="/assets/schema.jpeg" alt="Database Schema">


    </div>
  </div>

  <!-- ARCHITECTURE FLOW -->
  <div class="architecture">
    <h2>System Architecture</h2>

    <div class="arch-grid">
      <div class="arch-box">Angular Frontend</div>
      <div class="arrow">→</div>
      <div class="arch-box">Express REST API</div>
      <div class="arrow">→</div>
      <div class="arch-box">PostgreSQL Database</div>
    </div>

    <p class="arch-desc">
      Client-side Angular application communicates with a Node.js REST API, 
      which performs database operations on a cloud-hosted PostgreSQL server.
    </p>
  </div>

</section>
`
})
export class DashboardComponent {}
