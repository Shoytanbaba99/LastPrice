# SOFTWARE ENGINEERING LAB

## Project Proposal

**Course:** Software Engineering Lab  
**Semester:** Autumn 2025  
**Group Members:** [Your Names Here]  
**Submission Date:** [Date]

---

## 1. Project Title

**LastPrice — A Gamified Open Auction Marketplace for Second-Hand Goods**

---

## 2. Problem Statement

The second-hand goods market in Bangladesh, primarily served by platforms like **Bikroy.com**, suffers from several critical inefficiencies:

- **Price Haggling Fatigue:** Sellers and buyers waste significant time in back-and-forth negotiations, often without reaching a deal. On Bikroy.com alone, countless listings expire without a single successful transaction due to failed price negotiation.

- **Lack of Fair Price Discovery:** Sellers often underprice out of desperation or overprice out of greed. There is no structured mechanism for the market to determine a fair price for a used item.

- **Inauthentic Listings:** Open chat systems allow negotiation manipulation — buyers coordinate to lowball sellers, or sellers fake interest to drive price up.

- **No Time-Bounded Urgency:** Traditional classified platforms (like Craigslist or Bikroy.com) have no time pressure, causing listings to stagnate indefinitely.

**The result:** Both buyers and sellers are frustrated, transactions are slow, and neither party trusts that they got the best deal.

**LastPrice** proposes a gamified, time-limited auction system where the market itself determines the final fair price — without any chat or direct negotiation, but with a public leaderboard to create tension.

---

## 3. Objectives

The primary objectives of the **LastPrice** system are:

1. To design and implement a **structured, fair, and transparent second-hand goods marketplace** that eliminates price negotiation.
2. To implement a **time-bounded gamified bidding mechanism** (The Arena) that creates urgency and drives genuine participation.
3. To enable **automatic price discovery** by matching the highest buyer bid against the seller's confidential reserve price.
4. To develop a **secure, web-based platform** accessible to students, individuals, and small businesses in Bangladesh.
5. To demonstrate the application of **software engineering principles** including requirements analysis, system design, implementation, and testing in a real-world context.

---

## 4. Proposal Planning

The project will follow the **Agile Software Development Life Cycle (SDLC)**, broken into the following phases:

| Phase   | Activity                     | Duration   |
| ------- | ---------------------------- | ---------- |
| Phase 1 | Requirements Gathering & SRS | Week 1–2   |
| Phase 2 | System Design (ER, DFD, UML) | Week 3–4   |
| Phase 3 | Database Design & Setup      | Week 5     |
| Phase 4 | Backend API Development      | Week 6–7   |
| Phase 5 | Frontend UI Development      | Week 8–9   |
| Phase 6 | Integration & Testing        | Week 10–11 |
| Phase 7 | Deployment & Documentation   | Week 12    |
| Phase 8 | Final Presentation           | Week 14–15 |

**Team Roles:**
| Member | Role |
|---|---|
| Member 1 | Project Lead & Backend Developer |
| Member 2 | Frontend Developer & UI/UX Designer |
| Member 3 | Database Architect & Tester |
| Member 4 | Documentation, SDLC Planning & QA |

---

## 5. Features

### Core Features

| #   | Feature                          | Description                                                                                                                                              |
| --- | -------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| F1  | **User Registration & Login**    | Buyers and Sellers register with email and password. JWT-based secure session management.                                                                |
| F2  | **Create a Listing**             | Sellers post second-hand items with title, description, display price, reserve price (hidden), photo, and arena start time.                              |
| F3  | **Browse Listings**              | Buyers can browse all live listings with countdown timers showing how much time remains.                                                                 |
| F4  | **The Arena (Gamified Bidding)** | A 6-minute bidding window. Each buyer has exactly **3 chances to bid** and receives visual hot/cold feedback. A live leaderboard shows the top bidders.  |
| F5  | **Automatic Price Matching**     | When the arena ends, the system compares the highest bid to the seller's hidden reserve price. If the bid meets or exceeds it, a transaction is created. |
| F6  | **Transaction Management**       | Matched deals are recorded as transactions. Both buyer and seller are notified of the outcome.                                                           |
| F7  | **Seller Dashboard**             | Sellers can view their listings, check arena status, and see results.                                                                                    |
| F8  | **Buyer Dashboard**              | Buyers can track their active bids, past transactions, and deals won.                                                                                    |
| F9  | **Image Upload**                 | Sellers can upload product images, stored as Base64-encoded data in the database.                                                                        |
| F10 | **Countdown Timer**              | Live countdown timer on every listing showing "Starts in X" or "Ends in X" depending on arena phase.                                                     |

### Non-Functional Features

- **Security:** Passwords hashed with bcrypt. API routes protected with JWT middleware. Reserve price never exposed in any API response.
- **Availability:** Deployed on Vercel (serverless) with Neon PostgreSQL cloud database — 99.9% uptime.
- **Scalability:** Stateless REST API design allows horizontal scaling.

---

## 6. Technology

| Layer               | Technology                       | Justification                                                         |
| ------------------- | -------------------------------- | --------------------------------------------------------------------- |
| **Frontend**        | HTML5, CSS3, Vanilla JavaScript  | Lightweight, no build step required, runs in any browser              |
| **Backend**         | Node.js with Express.js          | Fast, non-blocking I/O ideal for real-time auction logic              |
| **Database**        | PostgreSQL (Neon Cloud)          | Relational DB with strong ACID guarantees for financial/bid data      |
| **Authentication**  | JSON Web Tokens (JWT) + bcryptjs | Industry-standard stateless auth; passwords never stored in plaintext |
| **File Handling**   | Multer (memory storage) + Base64 | Serverless-compatible image handling without disk dependency          |
| **Deployment**      | Vercel (Serverless Functions)    | Free tier, auto-deploy from GitHub, global CDN                        |
| **Version Control** | Git + GitHub                     | Industry-standard; enables team collaboration                         |

**Similar Existing Systems for Reference:**

- **Bikroy.com** (Bangladesh): General classified ads, no bidding mechanism.
- **Craigslist** (USA): Peer-to-peer classifieds, negotiation-based.
- **eBay** (USA): Open auction, endless bidding — LastPrice improves on this with restricted bid chances and target-oriented feedback.
- **OLX** (Global): Classified ads with chat-based negotiation.

**LastPrice differentiates itself** by combining the reach of Bikroy with the structured fairness of eBay's auction system, while eliminating the manipulative dynamics of open bidding.

---

## 7. Estimated Cost

| Item                                           | Type            | Cost (BDT)                      |
| ---------------------------------------------- | --------------- | ------------------------------- |
| Neon PostgreSQL (Free Tier)                    | Cloud Database  | ৳0                              |
| Vercel Deployment (Free Tier)                  | Hosting         | ৳0                              |
| GitHub (Free)                                  | Version Control | ৳0                              |
| Domain Name (optional, e.g., lastprice.com.bd) | Domain          | ~৳1,500/year                    |
| Development Laptops (already owned)            | Hardware        | ৳0 (existing)                   |
| Internet & Data                                | Connectivity    | ~৳500/month × 4 months = ৳2,000 |
| Design Tools (Figma – Free)                    | UI/UX           | ৳0                              |
| **Total Estimated Cost**                       |                 | **~৳3,500**                     |

> **Note:** The project is designed to be deployable at near-zero operational cost using free-tier cloud services, making it a highly cost-effective solution suitable for a startup context.

---

## 8. SWOT Analysis

### Strengths

- **Unique Mechanism:** Gamified restricted bidding eliminates negotiation fatigue, a significant pain point in existing platforms like Bikroy.com.
- **Fair Price Discovery:** The system is mathematically fair — the market sets the price without collusion or manipulation.
- **Low Cost:** Entire infrastructure runs on free cloud services during development and early deployment.
- **Modern Tech Stack:** Node.js + PostgreSQL + Vercel is a production-grade, industry-standard stack.
- **Security:** Reserve price is cryptographically hidden; robust JWT authentication prevents unauthorized access.
- **No External Dependencies:** No third-party payment gateway or SMS API required for the core system.

### Weaknesses

- **Team Familiarity:** The codebase involves backend development which may be unfamiliar to some team members, requiring a learning curve.
- **No Mobile App:** The system is web-only; no native Android/iOS app, limiting reach on mobile-first users.
- **Cold Start Problem:** Like all marketplaces, the platform needs both buyers and sellers simultaneously to create value — hard to demonstrate without real users.
- **Image Storage:** Base64 in database is functional but not optimal for large-scale systems compared to dedicated object storage (e.g., AWS S3).

### Opportunities

- **Growing Second-Hand Market:** The sustainable goods and second-hand economy is growing globally, especially among students and young adults.
- **Bangladesh E-commerce Growth:** Bangladesh's e-commerce sector is expanding rapidly. Bikroy.com's model has proved demand exists.
- **Gamification:** The "Arena" concept adds a game-like experience that can drive higher user engagement compared to passive listing platforms.
- **Niche Markets:** Can be adapted for specific categories (e.g., university book exchanges, electronics auctions for students).

### Threats

- **Established Competitors:** Bikroy.com and OLX have large existing user bases and brand recognition.
- **Trust Issue:** Users may be unfamiliar with the limited 3-chance bid concept and be hesitant to participate correctly at first.
- **Scope Creep:** As a student project, adding too many features risks missing deadlines.
- **Internet Reliability:** Bangladesh's inconsistent internet connectivity may cause users to miss auction windows.

---

## 9. Conclusion

**LastPrice** is a well-scoped, technically feasible, and practically relevant software engineering project. It addresses a real problem faced daily by millions of users of marketplace platforms like Bikroy.com — the inefficiency and frustration of price negotiation.

The project fully aligns with the course learning outcomes:

- It requires **requirements analysis** (CLO1) through the definition of a unique bidding system.
- It exercises **modern engineering tools** (CLO2) including Node.js, PostgreSQL, REST APIs, and Git.
- It enables **software quality assurance** (CLO3) through unit testing of the bid resolution logic.
- It demands **teamwork and problem solving** (CLO4) across frontend, backend, and database layers.
- It demonstrates **economic decision-making** (CLO5) through cost estimation and SWOT analysis.

By submitting this proposal, our team commits to delivering a working, deployed, and fully documented gamified auction web application by the end of the semester.

---

## 10. References

1. Bikroy.com — Bangladesh's Online Classifieds Marketplace. https://bikroy.com
2. Craigslist Inc. — Online Classified Advertisements. https://craigslist.org
3. eBay Inc. — Online Auction and Shopping Website. https://ebay.com
4. OLX Group — Online Classifieds Platform. https://olx.com
5. Sommerville, I. (2016). _Software Engineering_ (10th ed.). Pearson Education.
6. Pressman, R. S., & Maxim, B. (2015). _Software Engineering: A Practitioner's Approach_ (8th ed.). McGraw-Hill.
7. Node.js Foundation. _Node.js Documentation_. https://nodejs.org/docs
8. PostgreSQL Global Development Group. _PostgreSQL Documentation_. https://www.postgresql.org/docs
9. Vercel Inc. _Vercel Platform Documentation_. https://vercel.com/docs
10. Bangladesh E-commerce Association (BASIS). _E-Commerce Sector Report 2024_. https://basis.org.bd

---

_Prepared by: [Group Name] | Software Engineering Lab | [University Name] | Autumn 2025_
