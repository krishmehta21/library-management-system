import express from "express";
import pkg from "pg";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();
const { Pool } = pkg;

const app = express();
app.use(cors());
app.use(express.json());

/* ===================== DB CONFIG ===================== */

const pool = new Pool({
  connectionString: process.env.DB_URL,
  ssl: { rejectUnauthorized: false },
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000
});

/* ===================== TEST DB ===================== */

(async () => {
  try {
    const client = await pool.connect();
    console.log("✅ Connected to PostgreSQL Cloud DB");
    client.release();
  } catch (err) {
    console.error("❌ DB Error:", err.message);
  }
})();

/* ===================== AUTHORS ===================== */

app.get("/authors", async (_, res) => {
  const r = await pool.query("SELECT * FROM authors ORDER BY author_id");
  res.json(r.rows);
});

app.post("/authors", async (req, res) => {
  const r = await pool.query(
    "INSERT INTO authors(name) VALUES($1) RETURNING *",
    [req.body.name]
  );
  res.json(r.rows[0]);
});

/* ===================== CATEGORIES ===================== */

app.get("/categories", async (_, res) => {
  const r = await pool.query("SELECT * FROM categories ORDER BY category_id");
  res.json(r.rows);
});

app.post("/categories", async (req, res) => {
  const r = await pool.query(
    "INSERT INTO categories(name) VALUES($1) RETURNING *",
    [req.body.name]
  );
  res.json(r.rows[0]);
});

/* =====================================================
   BOOKS (SMART CRUD + AUTO AUTHOR/CATEGORY)
===================================================== */

app.get("/books", async (_, res) => {
  try {
    const r = await pool.query(`
      SELECT b.book_id,
             b.title,
             b.quantity,
             b.available_quantity,
             a.name AS author,
             c.name AS category
      FROM books b
      LEFT JOIN authors a ON b.author_id = a.author_id
      LEFT JOIN categories c ON b.category_id = c.category_id
      ORDER BY b.book_id
    `);

    res.json(r.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch books" });
  }
});


/* ---------- ADD BOOK (AUTO CREATE AUTHOR + CATEGORY) ---------- */

app.post("/books", async (req, res) => {
  const { title, author_name, category_name, quantity } = req.body;

  try {

    /* ===== AUTHOR ===== */
    let author = await pool.query(
      "SELECT author_id FROM authors WHERE LOWER(name)=LOWER($1)",
      [author_name]
    );

    let author_id;

    if (author.rows.length === 0) {
      const a = await pool.query(
        "INSERT INTO authors(name) VALUES($1) RETURNING author_id",
        [author_name]
      );
      author_id = a.rows[0].author_id;
    } else {
      author_id = author.rows[0].author_id;
    }

    /* ===== CATEGORY ===== */
    let category = await pool.query(
      "SELECT category_id FROM categories WHERE LOWER(name)=LOWER($1)",
      [category_name]
    );

    let category_id;

    if (category.rows.length === 0) {
      const c = await pool.query(
        "INSERT INTO categories(name) VALUES($1) RETURNING category_id",
        [category_name]
      );
      category_id = c.rows[0].category_id;
    } else {
      category_id = category.rows[0].category_id;
    }

    /* ===== BOOK ===== */
    const r = await pool.query(
      `INSERT INTO books
       (title, author_id, category_id, quantity, available_quantity)
       VALUES ($1,$2,$3,$4,$4)
       RETURNING *`,
      [title, author_id, category_id, quantity]
    );

    res.json(r.rows[0]);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to add book" });
  }
});


/* ---------- UPDATE BOOK ---------- */

app.put("/books/:id", async (req, res) => {
  const { title, author_id, category_id, quantity } = req.body;

  try {
    await pool.query(
      `UPDATE books
       SET title=$1,
           author_id=$2,
           category_id=$3,
           quantity=$4
       WHERE book_id=$5`,
      [title, author_id, category_id, quantity, req.params.id]
    );

    res.json({ message: "Book updated" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update book" });
  }
});


/* ---------- DELETE BOOK ---------- */

app.delete("/books/:id", async (req, res) => {
  try {
    await pool.query(
      "DELETE FROM books WHERE book_id=$1",
      [req.params.id]
    );

    res.json({ message: "Book deleted" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete book" });
  }
});


/* ===================== USERS ===================== */

app.get("/users", async (_, res) => {
  const r = await pool.query("SELECT * FROM users ORDER BY user_id");
  res.json(r.rows);
});

app.post("/users", async (req, res) => {
  const { name, email } = req.body;

  const r = await pool.query(
    "INSERT INTO users(name,email) VALUES($1,$2) RETURNING *",
    [name, email]
  );

  res.json(r.rows[0]);
});

app.delete("/users/:id", async (req, res) => {
  await pool.query("DELETE FROM users WHERE user_id=$1", [req.params.id]);
  res.json({ message: "User deleted" });
});

/* ===================== ISSUE BOOK ===================== */

app.post("/issue", async (req, res) => {
  const { book_id, user_id } = req.body;

  const due = new Date();
  due.setDate(due.getDate() + 14);

  await pool.query(
    `INSERT INTO transactions(book_id,user_id,issue_date,due_date,returned)
     VALUES($1,$2,CURRENT_DATE,$3,false)`,
    [book_id, user_id, due]
  );

  await pool.query(
    "UPDATE books SET available_quantity=available_quantity-1 WHERE book_id=$1",
    [book_id]
  );

  res.json({ message: "Issued successfully" });
});

/* ===================== RETURN BOOK ===================== */

app.post("/return/:id", async (req, res) => {

  const trx = await pool.query(
    "SELECT * FROM transactions WHERE transaction_id=$1",
    [req.params.id]
  );

  const t = trx.rows[0];
  const today = new Date();
  const due = new Date(t.due_date);

  let fine = 0;
  if (today > due) {
    const days = Math.floor((today - due) / 86400000);
    fine = days * 10;
  }

  await pool.query(
    `UPDATE transactions 
     SET returned=true, return_date=CURRENT_DATE, fine_amount=$1 
     WHERE transaction_id=$2`,
    [fine, req.params.id]
  );

  await pool.query(
    "UPDATE books SET available_quantity=available_quantity+1 WHERE book_id=$1",
    [t.book_id]
  );

  res.json({ message: "Returned", fine });
});

/* ===================== TRANSACTIONS ===================== */

app.get("/transactions", async (_, res) => {
  const r = await pool.query(`
    SELECT t.transaction_id,
           u.name AS user,
           b.title AS book,
           t.issue_date,
           t.due_date,
           t.returned,
           t.fine_amount
    FROM transactions t
    JOIN users u ON t.user_id=u.user_id
    JOIN books b ON t.book_id=b.book_id
    ORDER BY t.transaction_id DESC
  `);

  res.json(r.rows);
});

/* ===================== DASHBOARD ===================== */

app.get("/stats", async (_, res) => {
  const books = await pool.query("SELECT COUNT(*) FROM books");
  const issued = await pool.query("SELECT COUNT(*) FROM transactions WHERE returned=false");
  const fines = await pool.query("SELECT COALESCE(SUM(fine_amount),0) FROM transactions");

  res.json({
    totalBooks: Number(books.rows[0].count),
    issuedBooks: Number(issued.rows[0].count),
    totalFines: Number(fines.rows[0].coalesce)
  });
});

/* ===================== SERVER ===================== */

const PORT = 5000;
app.listen(PORT, () =>
  console.log(`🚀 Library API running at http://localhost:${PORT}`)
);
