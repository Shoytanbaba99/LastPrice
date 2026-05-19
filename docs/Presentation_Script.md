# LastPrice Final Defense - Presentation Script

## Part 1: Introduction & Market Gap
**Speaker:** Mehedi

### Slide 1: Title & Cover
**Mehedi:** "Good morning/afternoon, respected faculty members. We are here to present **LastPrice**, a frictionless silent auction and escrow marketplace. My name is Mehedi, and along with Masud, Hasib, and Rudro, we're excited to show you what we've built under the supervision of Dhrubo Barua and Md. Faysal."

### Slide 2: The Market Gap & Our Challenge
**Mehedi:** "So, why did we build LastPrice? Current peer-to-peer e-commerce platforms suffer from negotiation friction and drop-out rates.
1. **Haggling Fatigue:** People hate endless texting and low-ball offers found on platforms like Facebook Marketplace.
2. **Handover Fraud:** Physical meetups often lack proof of transaction, leading to scams.
3. **The Penny-Bid Problem:** Initially, when we tested a silent auction, buyers would just bid $1 incrementally until they found the seller's minimum limit. Our unique solution? We created a double-blind, 3-chance restricted bidding system. No other platform does this. This limits the frustration, prevents reserve-sniffing exploits, and forces buyers to bid fairly."

---

## Part 2: Simulated Walkthrough & Core Logic
**Speaker:** Masud

### Slide 3: A Real Scenario: Selling a MacBook
**Masud:** "Let's look at a real scenario. Imagine you want to sell a MacBook. You hope to get $1,500, but you absolutely won't take less than $1,200. In LastPrice, you set two prices. The Display Price of $1,500 is what everyone sees. The Secret Reserve Price of $1,200 is completely hidden. This automates the bargaining phase. The buyer feels they are negotiating down from $1,500, while the seller knows they are protected by the $1,200 floor."

### Slide 4: A Real Scenario: The Buyer's Journey
**Masud:** "Now, let's look at the buyer. They see $1,500 and know they have 3 chances. 
- In Round 1, they try to low-ball at $800. The system says RED—it's too low. 
- Realizing they only have two chances left, in Round 2, they adjust to $1,100. The system says YELLOW—meaning they are very close.
- For their final chance, they bid $1,250. The system flashes GREEN! The hidden $1,200 reserve is breached. 
If multiple buyers breach the reserve, our background engine applies a first-mover advantage to resolve ties automatically. Both parties are satisfied without a single text message sent."

### Slide 5: Final Step: Escrow & Handover
**Masud:** "Once the bid matches, we initiate a dual-key validation handshake. The system generates distinct 6-digit cryptographic codes—one for the buyer, one for the seller. When they meet physically to exchange the MacBook, they enter both keys into the portal. The system instantly validates them, creating a tamper-proof record of mutual consent. No scams, no disputes."

---

## Part 3: Technical Details & Visual Walkthrough
**Speaker:** Hasib

### Slide 6: Technical Details: The RGB Feedback System
**Hasib:** "Technically, how do we handle the tension in the bidding arena? We use an RGB Feedback System based on a strict algorithmic calculation: Percentage = (Bid / Reserve Price) * 100.
- If the bid is under 70%, the UI glows **RED** and shakes.
- If it's between 70% and 99%, the UI pulses **YELLOW**.
- If it hits 100% or more, the screen flashes **GREEN**, triggering confetti and locking the escrow process. It's a psychological tension mechanic that keeps buyers engaged."

### Slides 7-10: Platform Walkthrough
**Hasib:** *(Click through the screenshots briefly)* 
"Here are some snapshots of our implementation. You can see our landing page, the marketplace showing current active auctions, the simplified creation form where sellers set their dual pricing, and finally, the actual Bidding Arena where the UI color-codes the user's bids as they play their 3 chances."

---

## Part 4: Limitations, Future Scope & Conclusion
**Speaker:** Rudro

### Slide 11: Limitations & What We Learned
**Rudro:** "Every system has room for growth. A few limitations we encountered:
1. Our UI is currently best optimized for Desktop.
2. We used REST polling for the timers, which sometimes causes slight desyncs. 
3. Escrow currently only handles one item per physical meeting. 
Looking back, we realize we should have used WebSockets for real-time bid updates and prioritized more automated testing for the edge cases in our auction logic."

### Slide 12: Future Scope
**Rudro:** "For the future, we envision:
1. **Customizable Limits:** Letting sellers choose whether they want to allow 2 to 5 bid chances.
2. **Buyer Selection:** If multiple buyers match the reserve, allowing the seller to pick the winner.
3. **Trust Points:** A gamified reputation system based entirely on successful cryptographic handovers."

### Slide 13: Thank You & Q/A
**Rudro:** "That concludes our presentation. LastPrice completely reinvents the peer-to-peer selling experience by removing the chatbox and adding a layer of secure, game-like tension. We'd now like to open the floor to any questions."
