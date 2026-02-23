# LastPrice

A second-hand marketplace where buyers silently bid on items. No buyer-seller chat before match. Reserve price is never revealed.

🌐 **Live Demo:** [https://last-price-phi.vercel.app/](https://last-price-phi.vercel.app/)

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

- **Background**: `#0D0D0D` / `#1A1510`
- **Headings/Titles**: `#FFF5E6` (Cream)
- **Body Text**: `#B9986F` (Sepia)
- **Accents**: Gold (`#E6C07B`) and Terra (`#D5805E`)
- **Buttons**: Cream text on Terra backgrounds

---

## 🚀 Deployment

This project is deployed on **Vercel** via `vercel.json`.

**Live URL:** [https://last-price-phi.vercel.app/](https://last-price-phi.vercel.app/)

### ⚠️ Note for Deployment

If you are deploying this yourself, you **MUST** add your `DATABASE_URL` and `JWT_SECRET` manually in the Vercel Dashboard (Settings > Environment Variables) for the API to work.

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

---

## 🎓 Academic Project

This project was developed as part of a **Software Engineering Lab** course. It demonstrates a complete software development lifecycle, from requirement analysis to cloud deployment.

### 👥 Team Members

- **[Shoytanbaba99](https://github.com/Shoytanbaba99)** — Project Refactoring, PostgreSQL/Neon Integration & Cloud Deployment.
- **[Mehedi032003](https://github.com/Mehedi032003)** — Original Frontend UI/UX Design & Implementation.
- Member 3 — Documentation & System Requirements.
- Member 4 — Quality Assurance & Testing.
