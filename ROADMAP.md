# Haggle Arena - Simplified Project Roadmap

This roadmap outlines the steps to strip down the complex MVP and finalize a clean, straightforward university project.

## Phase 1: Complexity Removal (Backend)

- [x] Drop `TrustPoints` and `ArenaParticipants` logic from the database schema entirely.
- [x] Update `/api/auth/register` to just create standard users.
- [x] Update `/api/bids` to let _any_ logged-in user post a bid on an active listing, skipping the escrow phase.
- [x] Remove ghosting/penalty workflows from Match Resolution.

## Phase 2: Frontend Clean-up & Wiring

- [x] **Simplify UI**: Scrub all mentions of "TP" and "Trust Points" from `index.html`, `login.html`, `dashboard.html`, and `transaction.html`.
- [x] **Direct Bidding**: Remove the "Enter Arena / Stake TP" button on `listing-detail.html`. Show the bid input immediately for any authenticated user.
- [x] **Data Hydration**: Ensure `dashboard.html`, `listings.html`, and `seller-panel.html` successfully pull data via JS and construct DOM elements.
- [x] **Tension Bar Visuals**: Build the visual script on `listing-detail.html` that reacts to the `tension` (red/yellow/green) indicator when a bid is placed.

## Phase 3: QA & Polish

- [ ] **Database Seeding**: Create mock users and listings for an instant full site experience.
- [ ] **Timer Synchronization**: Ensure countdown timers elegantly stop accepting bids when the deadline is reached.
- [ ] **Presentation Polish**: Test the flow from end-to-end (Register -> Post Listing -> Log in as someone else -> Bid -> Win).
