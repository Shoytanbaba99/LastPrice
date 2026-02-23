# HaggleArena

A second-hand marketplace where buyers silently bid on items. No buyer-seller chat before match. Reserve price is never revealed.

---

## ⚡ Quick Start

### 1. Prerequisites

- **Node.js** v18+
- **MySQL** 8.0+

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment

Edit `.env` with your MySQL credentials:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASS=your_password_here
DB_NAME=haggle_arena
JWT_SECRET=change_this_super_long_secret_string_here
```

### 4. Create the Database

```bash
node init-db.js
```

### 5. Start the Server

```bash
npm start
```

Open **http://localhost:3000** in your browser.

---

## 🔌 API Reference

All protected routes require: `Authorization: Bearer <token>`

### Auth

| Method | Route                | Description |
| ------ | -------------------- | ----------- |
| POST   | `/api/auth/register` | Register    |
| POST   | `/api/auth/login`    | Login → JWT |
| GET    | `/api/auth/me`       | Get profile |

### Listings _(reserve_floor NEVER returned)_

| Method | Route               | Description                          |
| ------ | ------------------- | ------------------------------------ |
| GET    | `/api/listings`     | All live listings                    |
| POST   | `/api/listings`     | Create listing (multipart/form-data) |
| GET    | `/api/listings/:id` | Single listing                       |
| GET    | `/api/listings/my`  | Seller's own listings                |

### Bids

| Method | Route                  | Description                       |
| ------ | ---------------------- | --------------------------------- | ------ | ------ |
| POST   | `/api/bids`            | Place bid → returns `tension: red | yellow | green` |
| GET    | `/api/bids/:listingId` | Own bid history + latest tension  |

### Transactions

| Method | Route                   | Description                            |
| ------ | ----------------------- | -------------------------------------- |
| GET    | `/api/transactions/my`  | All transactions                       |
| GET    | `/api/transactions/:id` | Single transaction (buyer/seller only) |

---

## 🔒 Security Highlights

- **Reserve floor**: Selected only for internal resolution logic; stripped from every API response.
- **SQL Injection**: Fully parameterized queries via `mysql2`.
- **Passwords**: `bcryptjs` with 12 rounds.
- **JWT**: HS256, 7-day expiry.
- **Input sanitization**: HTML-encoded user inputs before DB writes.
- **File uploads**: Type-checked, size-limited (5MB), stored locally.

---

## 🗄️ Database Tables

| Table          | Purpose                                       |
| -------------- | --------------------------------------------- |
| `Users`        | Accounts                                      |
| `Listings`     | Items for sale; `reserve_floor` internal only |
| `Bids`         | All bids with amount and timestamp            |
| `Transactions` | Post-match deal records                       |
