# HaggleArena

A second-hand marketplace where buyers silently bid on items. No buyer-seller chat before match. Reserve price is never revealed.

---

## ⚡ Quick Start

### 1. Prerequisites

- **Node.js** v18+
- **PostgreSQL** (Neon Cloud recommended)

### 2. Set Up Environment

Create a `.env` file and add your credentials:

```env
DATABASE_URL=your_postgresql_url
JWT_SECRET=your_random_secret
PORT=3005
```

### 3. Install & Start

```bash
npm install
npm run dev
```

Open **http://localhost:3005** in your browser.

---

## 🎨 Theme: SepiaDog

The application features a premium **SepiaDog** theme with:

- **Background**: `#0D0D0D` / `#1C1C1C`
- **Text**: `#B9986F` (Sepia)
- **Accents**: Gold (`#E6C07B`) and Terra (`#D5805E`)

---

## � Deployment

This project is configured for **Vercel** via `vercel.json`.

---

## �🔌 API Reference

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

| Method | Route                  | Description                   |
| ------ | ---------------------- | ----------------------------- |
| POST   | `/api/bids`            | Place bid → returns `tension` |
| GET    | `/api/bids/:listingId` | Own bid history               |

---

## 🔒 Security Highlights

- **Reserve floor**: Stripped from every API response.
- **SQL Injection**: Fully parameterized queries via `pg`.
- **Passwords**: `bcryptjs` with 12 rounds.
- **JWT**: Secure tokens for session management.
- **Vercel Routing**: Protected SPA endpoints.
