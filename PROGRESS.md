# Haggle Arena - Current Progress (Simplified MVP)

## Backend Status: 🟨 Refactoring Required

The backend is currently over-engineered for our simplified scope and contains features we are planning to remove.

**What is completed & operational:**

1.  **Authentication (`routes/auth.js`)**: JWT-based registration and login.
2.  **Listings Management (`routes/listings.js`)**: Creating listings with photo uploads, Display Price, and hidden Reserve Floor.
3.  **Silent Bidding Engine (`routes/bids.js`)**: Secure bidding validation and dynamic "Price Tension" (red/yellow/green) indicator without exposing the reserve floor.
4.  **Match Resolution**: Basic Highest Bid vs Reserve Floor calculation.

**Completed (Simplification Tasks):**

- [x] Removed all `TrustPointLedger` and `ArenaParticipants` database tables.
- [x] Removed Escrow and TP deduction requirements to place a bid.
- [x] Simplified transactions to just track "Matched" deals without ghosting penalties.

## Frontend Status: 🟨 Refactoring Required

The frontend UI is largely built but needs to be streamlined to match the new simple flow.

**What is completed & connected:**

1.  **Layout & UI**: Premium UI/UX using TailwindCSS.
2.  **API Handlers (`public/js/api.js`, `public/js/auth.js`)**: JWT token management and fetch wrappers are complete.
3.  **Authentication Flows**: Login and registration work.

**Completed (Simplification Tasks):**

- [x] Removed all visual references to "Trust Points" across landing pages (`index.html`), `login.html`, and `dashboard.html`.
- [x] On `listing-detail.html`, removed the "Join Arena" step. Buyers should immediately see the bidding input box once logged in.
- [x] Connected the frontend JS to feed the dynamic pages with real data from the simplified APIs.

## Tech Stack

- **Node.js** v18+
- **PostgreSQL** (Neon Cloud)

## Setup Instructions

### 1. Environment Variables

Create a `.env` file in the root directory with the following:

```
DATABASE_URL=your_neon_postgresql_url
JWT_SECRET=your_secure_random_secret
PORT=3005
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Run the Application

```bash
npm run dev
```

Open **http://localhost:3005** in your browser.

## Current Progress (Refined)

- [x] **Presentation Polish**: Test the flow from end-to-end (Register -> Post Listing -> Log in as someone else -> Bid -> Win).
- [x] **Theme Overhaul**: Implemented **SepiaDog** brand identity.
- [x] **Deployment Ready**: Configured for Vercel with automated routing.
- [x] Initialized Git repository and cleaned up development artifacts.
