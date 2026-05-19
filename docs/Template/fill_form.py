import os
from docx import Document

# Load the original template
template_path = 'Justification Form of project.docx'
doc = Document(template_path)

# Data Definitions
t0_data = {
    1: "Mehedi Hassan Bhuiyan, Md. Masud Rahman, Hasib Al Mahmud Siddique, Rudro Antony Mrong",
    2: "0432320005101080, 0432320005101064, 0432320005101095, 0432320005101059",
    3: "Software Engineering and System Analysis Lab",
    4: "CSE 0613226",
    5: "6B",
    6: "Spring 2024",
    7: "May 20, 2026"
}

t1_data = {
    1: [
        "Conducted requirement gathering through user interviews and market research. Identified key stakeholders: Sellers seeking maximum profit and Buyers seeking minimum price. Addressed pain points like haggling fatigue and scam risks in C2C marketplaces.",
        "Applied system analysis (K2) to clearly define functional and non-functional constraints. Resolved conflicting goals (P6) by outlining a 3-chance restricted bidding system to balance buyer-seller power dynamically.",
        "Notion for documentation, UML Diagrams (Use Case, Sequence) via Draw.io for system scoping."
    ],
    2: [
        "Evaluated high-performance, lightweight tech stacks. Selected a modern JavaScript ecosystem (React/Next.js for Frontend, Node.js/Express for Backend, PostgreSQL for DB) to handle real-time interactivity.",
        "Utilized specialized domain knowledge (K4) to select an architecture capable of real-time countdown synchronization. Handled the unfamiliar dual-pricing problem (P4) with a centralized REST approach.",
        "Figma for UI/UX prototyping, Node.js for backend framework, Git for version control."
    ],
    3: [
        "Designed a Client-Server RESTful architecture. Created a relational schema for Users, Listings, Bids, and Escrows, ensuring data integrity through foreign keys and strict database constraints.",
        "Applied engineering design knowledge (K5) to break down the interconnected sub-problems (P7) of simultaneous auctions and physical handover verifications into modular database components.",
        "ERDPlus for ER Diagram, PostgreSQL (Neon) for database, DBeaver for query management."
    ],
    4: [
        "Developed the core 'Silent 3-Bid Arena' logic, integrating RGB tension feedback (Red/Yellow/Green based on bid percentage) and the Cryptographic Escrow code generation system.",
        "Applied practical engineering skills (K6) to resolve the unfamiliar problem of penny-bidding (P4) by implementing a mathematically restricted 3-chance auction mechanic.",
        "Next.js/React, Express.js, Tailwind CSS for glassmorphism styling, JWT for token-based authentication."
    ],
    5: [
        "Conducted manual and automated edge-case testing, focusing on simultaneous bid handling, client-server timer desynchronization, and strict validation of the 3-chance limit.",
        "Applied domain-specific analytical testing (K4) to ensure reliable handling of concurrent bids (P7) and secure cryptographic escrow matching to prevent fraud.",
        "Postman for API testing, Jest for unit testing, Chrome DevTools for performance profiling."
    ],
    6: [
        "Adopted Agile methodologies (Sprints/Kanban) and maintained a repository-driven knowledge base. Authored comprehensive SRS, KPA mapping, and Project Proposal documents.",
        "Maintained ethical and professional standards (K7) while managing stakeholder requirements (P6) and conflicting technical constraints (P2) throughout the SDLC.",
        "GitHub for version control, Trello for task management, Markdown for documentation, MS Word."
    ]
}

t2_data = {
    1: [
        "Client-Server RESTful Architecture",
        "Simplifies separation of concerns, allowing independent scaling of frontend and backend services.",
        "Low latency due to lightweight JSON payloads and stateless nodes.",
        "High availability and fault tolerance through decentralized client rendering.",
        "Cost-effective, utilizing free-tier cloud platforms for hosting."
    ],
    2: [
        "Node.js / Express.js",
        "Non-blocking asynchronous I/O is ideal for handling concurrent bidding requests without blocking the event loop.",
        "High concurrency handling with low overhead, ensuring fast bid validations.",
        "Robust, mature ecosystem (npm) ensuring stable runtime performance.",
        "Open-source and entirely free to use."
    ],
    3: [
        "PostgreSQL (Neon Serverless)",
        "Relational integrity is mandatory for financial/auction data to prevent double-bidding and state corruption.",
        "Optimized indexing on active queries; Neon provides auto-scaling serverless resources.",
        "Strict ACID compliance guarantees that bids and escrow states remain consistent.",
        "Generous free tiers available for academic and small-scale projects."
    ],
    4: [
        "React (Next.js) with Tailwind CSS",
        "Component-based architecture allows rapid development of the custom 'Chinese Minimal Drama' aesthetic and complex UI feedback.",
        "Client-side rendering offloads processing from the server, resulting in a snappy user experience.",
        "Predictable component lifecycle management prevents UI state desynchronization during bidding.",
        "Open-source and free."
    ],
    5: [
        "JWT (JSON Web Tokens)",
        "Stateless, scalable, and secure authentication mechanism essential for generating tamper-proof escrow codes.",
        "Avoids database lookups for every route, significantly speeding up API request validation.",
        "Cryptographically signed tokens prevent forgery and unauthorized access.",
        "Built-in libraries available at zero cost."
    ],
    6: [
        "Vercel (Frontend) & Render (Backend)",
        "Native support for Node.js environments with seamless CI/CD integration directly from GitHub repositories.",
        "Global edge network caching ensures fast asset delivery and low latency globally.",
        "Automated rollbacks on deployment failures ensure high uptime.",
        "Free tier perfectly suits academic project requirements."
    ]
}

t3_data = {
    1: "Applied computing fundamentals to calculate relative bid percentages dynamically: (Bid / Reserve) * 100. This math drives the real-time RGB tension feedback system (Red < 70%, Yellow 70-99%, Green >= 100%).",
    2: "Utilized core software engineering principles, including the Software Development Life Cycle (SDLC) and Model-View-Controller (MVC) patterns, to architect a robust and maintainable marketplace platform.",
    3: "Leveraged specialized domain knowledge in modern web development (React, Node.js, REST APIs) and cryptographic security (JWT) to build a secure, real-time bidding application.",
    4: "Applied engineering design knowledge to formulate the relational database schema and system architecture necessary to support the novel 3-chance dual-pricing auction logic.",
    5: "Demonstrated practical engineering skills by adopting industry-standard tools and practices, including Git version control, Postman API testing, and Tailwind CSS for rapid UI development.",
    6: "Ensured ethical engineering by designing a trustless Escrow mechanism that prevents real-world meetup fraud, prioritizing public safety and secure data handling in C2C transactions."
}

t4_data = {
    1: "Addressed the requirement for deep engineering knowledge by building a synchronized real-time countdown and strict mathematical bid validation system that operates reliably over a stateless REST API.",
    2: "Resolved conflicting technical issues by balancing the need for a frictionless, chat-free user experience with the necessity of highly secure, verified transaction handovers using Cryptographic Escrow codes.",
    3: "Tackled the lack of an obvious solution to 'penny-bidding' and 'haggling fatigue' by engineering a novel 3-chance restricted bidding system, discarding the standard open-auction model entirely.",
    4: "Navigated unfamiliar issues by developing the 'Display vs Secret Reserve' dual-pricing logic, a non-standard market model that required custom state management and database constraints.",
    5: "Managed multiple stakeholder requirements by designing an automated system that dynamically balances the opposing goals of Sellers (maximizing profit) and Buyers (minimizing cost), ensuring mutual satisfaction.",
    6: "Solved multiple interconnected sub-problems by perfectly integrating the isolated, high-tension 'Bidding Arena' logic with the physical, real-world 'Handover Escrow' verification module."
}

try:
    # Fill Table 0
    for r, val in t0_data.items():
        doc.tables[0].rows[r].cells[1].text = val

    # Fill Table 1
    for r, vals in t1_data.items():
        doc.tables[1].rows[r].cells[4].text = vals[0]
        doc.tables[1].rows[r].cells[5].text = vals[1]
        doc.tables[1].rows[r].cells[6].text = vals[2]

    # Fill Table 2
    for r, vals in t2_data.items():
        doc.tables[2].rows[r].cells[1].text = vals[0]
        doc.tables[2].rows[r].cells[2].text = vals[1]
        doc.tables[2].rows[r].cells[3].text = vals[2]
        doc.tables[2].rows[r].cells[4].text = vals[3]
        doc.tables[2].rows[r].cells[5].text = vals[4]

    # Fill Table 3
    for r, val in t3_data.items():
        doc.tables[3].rows[r].cells[1].text = val

    # Fill Table 4
    for r, val in t4_data.items():
        doc.tables[4].rows[r].cells[1].text = val

    output_path = 'LastPrice_Justification_Form.docx'
    doc.save(output_path)
    print(f"Successfully generated populated justification form: {output_path}")
except Exception as e:
    print(f"Error while processing docx: {e}")
