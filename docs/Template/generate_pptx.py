#!/usr/bin/env python3.12
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN
import os

IMAGES = os.path.join(os.path.dirname(__file__), "Images")
OUT = os.path.join(os.path.dirname(__file__), "LastPrice_Presentation.pptx")

DARK = RGBColor(0x12, 0x0e, 0x0c)
CHARCOAL = RGBColor(0x1a, 0x15, 0x12)
GOLD = RGBColor(0xC5, 0xA8, 0x80)
WHITE = RGBColor(0xFF, 0xFF, 0xFF)
MUTED = RGBColor(0xa6, 0x9c, 0x8e)
RED = RGBColor(0xFF, 0x5e, 0x5e)
YELLOW = RGBColor(0xFF, 0xb8, 0x5e)
GREEN = RGBColor(0x5e, 0xFF, 0xc4)

prs = Presentation()
prs.slide_width = Inches(13.33)
prs.slide_height = Inches(7.5)
BLANK = prs.slide_layouts[6]

def new_slide():
    s = prs.slides.add_slide(BLANK)
    s.background.fill.solid()
    s.background.fill.fore_color.rgb = DARK
    return s

def txt(slide, text, left, top, width, height, size=20, bold=False, italic=False, color=WHITE, align=PP_ALIGN.LEFT):
    txBox = slide.shapes.add_textbox(Inches(left), Inches(top), Inches(width), Inches(height))
    tf = txBox.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.alignment = align
    run = p.add_run()
    run.text = text
    run.font.size = Pt(size)
    run.font.bold = bold
    run.font.italic = italic
    run.font.color.rgb = color
    return txBox

def gold_line(slide, top):
    ln = slide.shapes.add_shape(1, Inches(0.5), Inches(top), Inches(12.33), Inches(0.02))
    ln.fill.solid()
    ln.fill.fore_color.rgb = GOLD
    ln.line.fill.background()

def card(slide, left, top, width, height, title, title_color, body):
    box = slide.shapes.add_shape(1, Inches(left), Inches(top), Inches(width), Inches(height))
    box.fill.solid()
    box.fill.fore_color.rgb = CHARCOAL
    box.line.color.rgb = GOLD
    box.line.width = Pt(1.5)
    txt(slide, title, left+0.2, top+0.2, width-0.4, 0.45, size=18, bold=True, color=title_color)
    txt(slide, body, left+0.2, top+0.8, width-0.4, height-1.0, size=14, color=WHITE)

def slide_header(slide, heading, subtitle=None, speaker=None):
    txt(slide, heading, 0.5, 0.25, 10.0, 0.7, size=32, bold=True, color=WHITE)
    gold_line(slide, 1.0)
    if subtitle:
        txt(slide, subtitle, 0.5, 1.05, 12.33, 0.4, size=16, italic=True, color=MUTED)
    if speaker:
        box = slide.shapes.add_shape(1, Inches(11.0), Inches(0.25), Inches(1.8), Inches(0.5))
        box.fill.solid(); box.fill.fore_color.rgb = CHARCOAL; box.line.color.rgb = GOLD
        txt(slide, f"🎤 {speaker}", 11.0, 0.32, 1.8, 0.5, size=14, bold=True, color=GOLD, align=PP_ALIGN.CENTER)

# ===============================
# MEHEDI: Introduction
# ===============================
s = new_slide()
path = os.path.join(IMAGES, "UITS.png")
if os.path.exists(path):
    pic = s.shapes.add_picture(path, Inches(0.4), Inches(0.2), height=Inches(1.5))
txt(s, "LastPrice", 2.2, 0.2, 8, 1.3, size=60, bold=True, color=GOLD)
txt(s, "Frictionless Silent Auction & Escrow Marketplace", 2.2, 1.4, 9, 0.6, size=18, color=MUTED)
gold_line(s, 2.2)

team_box = s.shapes.add_shape(1, Inches(0.4), Inches(2.5), Inches(6.0), Inches(2.6))
team_box.fill.solid(); team_box.fill.fore_color.rgb = CHARCOAL
team_box.line.color.rgb = GOLD
txt(s, "Presented By", 0.6, 2.55, 5.6, 0.4, size=13, bold=True, color=GOLD)
team = "Mehedi Hassan Bhuiyan (0432320005101080)\nMd. Masud Rahman (0432320005101064)\nHasib Al Mahmud Siddique (0432320005101095)\nRudro Antony Mrong (0432320005101059)"
txt(s, team, 0.6, 3.05, 5.6, 1.8, size=13, color=WHITE)

sup_box = s.shapes.add_shape(1, Inches(6.8), Inches(2.5), Inches(6.1), Inches(2.6))
sup_box.fill.solid(); sup_box.fill.fore_color.rgb = CHARCOAL
sup_box.line.color.rgb = GOLD
txt(s, "Supervised By", 7.0, 2.55, 5.7, 0.4, size=13, bold=True, color=GOLD)
sup = "Dhrubo Barua & Md. Faysal\nFaculty Members, Dept. of CSE\nUniversity of Information Technology & Sciences\nSoftware Engineering & System Analysis Lab"
txt(s, sup, 7.0, 3.05, 5.7, 1.8, size=13, color=WHITE)
txt(s, "UITS • CSE Department • 2024", 0.4, 7.0, 12.33, 0.35, size=11, color=MUTED, align=PP_ALIGN.CENTER)

box = s.shapes.add_shape(1, Inches(11.0), Inches(0.25), Inches(1.8), Inches(0.5))
box.fill.solid(); box.fill.fore_color.rgb = CHARCOAL; box.line.color.rgb = GOLD
txt(s, "🎤 Mehedi", 11.0, 0.32, 1.8, 0.5, size=14, bold=True, color=GOLD, align=PP_ALIGN.CENTER)

# Mehedi: Market Gap
s = new_slide()
slide_header(s, "The Market Gap & Our Challenge", "Why we built LastPrice and the hurdles we faced", speaker="Mehedi")
card(s, 0.4, 1.6, 3.9, 3.5, "💬 Haggling Fatigue", RED, "Traditional marketplaces rely on endless texts, low-ball offers, and uncommitted buyers, causing huge frustration.")
card(s, 4.7, 1.6, 3.9, 3.5, "🛡️ Handover Fraud", RED, "Physical peer-to-peer meetups provide zero proof of exchange, leaving parties vulnerable to scams.")
card(s, 9.0, 1.6, 3.9, 3.5, "⚖️ The Penny-Bid Problem", YELLOW, "When we designed the silent auction, buyers just bid $1 incrementally to find the reserve. This broke the system. Our solution? Cap bids to exactly 3 chances.")

# ===============================
# MASUD: Simulated Walkthrough
# ===============================
# Simulated Story - Part 1
s = new_slide()
slide_header(s, "A Real Scenario: Selling a MacBook", "How Display Price and Reserve Price work together", speaker="Masud")
txt(s, "The Seller's Setup", 0.5, 1.6, 6.0, 0.5, size=24, bold=True, color=GOLD)
txt(s, "• You want to sell a MacBook Pro.\n• You hope to get $1,500 for it.\n• But you're willing to accept $1,200 as your absolute minimum.\n\nIn LastPrice, you set TWO prices:\n\n1. Display Price ($1,500): What everyone sees on the marketplace.\n2. Secret Reserve Price ($1,200): The vault threshold hidden from buyers.", 0.5, 2.3, 6.0, 3.5, size=16, color=WHITE)
box = s.shapes.add_shape(1, Inches(7.0), Inches(2.0), Inches(5.5), Inches(3.5))
box.fill.solid(); box.fill.fore_color.rgb = CHARCOAL; box.line.color.rgb = GOLD
txt(s, "Why two prices?", 7.2, 2.2, 5.1, 0.5, size=18, bold=True, color=GOLD)
txt(s, "It mimics real-life bargaining but automates it.\nThe buyer thinks they are negotiating down from $1,500, while the seller is guaranteed to never sell below $1,200.", 7.2, 2.8, 5.1, 2.0, size=16, color=WHITE)

# Simulated Story - Part 2
s = new_slide()
slide_header(s, "A Real Scenario: The Buyer's Journey", "Bidding in the 3-Chance Arena", speaker="Masud")
txt(s, "The Buyer's Perspective", 0.5, 1.6, 12.0, 0.5, size=24, bold=True, color=GOLD)
txt(s, "A buyer sees the MacBook listed for $1,500. They know they have 3 chances to find the secret reserve.", 0.5, 2.2, 12.0, 0.5, size=16, color=WHITE)
card(s, 0.4, 2.9, 3.9, 2.5, "Round 1: The Low-ball", RED, "Buyer bids $800.\nSystem says: RED (Cold).\nThe buyer realizes they need to be serious.")
card(s, 4.7, 2.9, 3.9, 2.5, "Round 2: The Adjustment", YELLOW, "Buyer bids $1,100.\nSystem says: YELLOW (Hot!).\nThey are within 70% of the hidden reserve!")
card(s, 9.0, 2.9, 3.9, 2.5, "Round 3: The Win", GREEN, "Buyer bids $1,250.\nSystem says: GREEN (Matched!).\nThe $1,200 floor is breached.")
txt(s, "Mutual Satisfaction: The buyer feels great for negotiating $250 off the display price. The seller is happy because they got $50 more than their minimum floor without ever replying to a single message.", 0.4, 5.8, 12.5, 1.0, size=16, bold=True, color=GOLD, align=PP_ALIGN.CENTER)

# Escrow
s = new_slide()
slide_header(s, "Final Step: Escrow & Handover", "Securing the physical exchange", speaker="Masud")
box = s.shapes.add_shape(1, Inches(1.5), Inches(1.6), Inches(10.3), Inches(4.5))
box.fill.solid(); box.fill.fore_color.rgb = CHARCOAL; box.line.color.rgb = GOLD
txt(s, "🤝", 6.3, 1.8, 1.0, 0.8, size=40, align=PP_ALIGN.CENTER)
txt(s, "How it works:", 1.8, 2.6, 9.7, 0.5, size=18, bold=True, color=GOLD)
steps = [
    "1. Once the bid matches, unique 6-digit cryptographic codes are generated for both parties.",
    "2. They meet up in person to exchange the MacBook.",
    "3. Both parties open the LastPrice portal and enter their respective codes.",
    "4. The system validates both codes instantly, confirming the exchange is genuine and complete."
]
for i, step in enumerate(steps):
    txt(s, step, 1.8, 3.1 + i * 0.62, 9.7, 0.55, size=14, color=WHITE)
txt(s, "Result: Tamper-proof proof of exchange. No scams. No disputes.", 1.8, 5.65, 9.7, 0.4, size=16, bold=True, italic=True, color=GREEN)

# ===============================
# HASIB: Technical Details / RGB
# ===============================
s = new_slide()
slide_header(s, "Technical Details: The RGB Feedback System", "How the Arena calculates and displays tension", speaker="Hasib")
txt(s, "The Core Algorithm:", 0.5, 1.6, 6.0, 0.5, size=24, bold=True, color=GOLD)
txt(s, "Instead of a simple pass/fail, the system calculates the percentage of the buyer's bid relative to the Secret Reserve Price.\n\nPercentage = (Bid / Reserve Price) * 100", 0.5, 2.3, 6.0, 2.0, size=16, color=WHITE)

card(s, 7.0, 1.6, 5.5, 1.5, "🔴 RED (Cold)", RED, "Bid < 70% of Reserve. UI shakes, screen glows red, indicating the bid is significantly too low.")
card(s, 7.0, 3.3, 5.5, 1.5, "🟡 YELLOW (Hot)", YELLOW, "Bid >= 70% and < 100% of Reserve. UI pulses yellow, indicating the buyer is getting very close.")
card(s, 7.0, 5.0, 5.5, 1.5, "🟢 GREEN (Matched)", GREEN, "Bid >= 100% of Reserve. Screen flashes green, confetti triggers, and the escrow process initiates.")

# Walkthrough Slides
walkthroughs = [
    ("1_landing_page.png",    "Platform Walkthrough — Landing Page"),
    ("3_marketplace.png",     "Platform Walkthrough — Marketplace"),
    ("4_create_listing.png",  "Platform Walkthrough — Creating an Auction"),
    ("5_bidding_arena.png",   "Platform Walkthrough — The Bidding Arena")
]

for fname, title in walkthroughs:
    s = new_slide()
    slide_header(s, title, speaker="Hasib")
    path = os.path.join(IMAGES, fname)
    if os.path.exists(path):
        pic = s.shapes.add_picture(path, Inches(0), Inches(1.6), height=Inches(5.5))
        pic.left = int((prs.slide_width - pic.width) / 2)

# ===============================
# RUDRO: Limitations & Future
# ===============================
s = new_slide()
slide_header(s, "Limitations & What We Learned", "Challenges faced during development", speaker="Rudro")
card(s, 0.4, 1.6, 5.8, 4.0, "⚠️ Current Limitations", RED, "1. Front-End Responsiveness: The UI is currently optimized for desktop; mobile scaling needs further refinement.\n\n2. Real-Time Sync: The countdown timer occasionally desyncs between client and server due to latency.\n\n3. Single-Item Checkout: Escrow currently only supports one item at a time per meeting.")
card(s, 6.7, 1.6, 5.8, 4.0, "💡 What We Could Have Done Better", YELLOW, "1. WebSockets: We relied heavily on REST polling. We should have used WebSockets for real-time bid updates.\n\n2. User Onboarding: More in-app tooltips explaining the 3-bid rule would prevent initial user confusion.\n\n3. Test Coverage: We should have prioritized automated testing for edge cases in the auction logic.")

s = new_slide()
slide_header(s, "Future Scope", "Where LastPrice goes next", speaker="Rudro")
card(s, 0.4, 1.6, 3.9, 2.8, "⚙️ Customizable Limits", GOLD, "Let sellers choose exactly how many bid chances to allow (e.g. 2 to 5), giving them full control over the speed.")
card(s, 4.7, 1.6, 3.9, 2.8, "👤 Buyer Selection", GOLD, "Allow sellers to manually pick the winning buyer from the matched pool based on reputation or location.")
card(s, 9.0, 1.6, 3.9, 2.8, "⭐ Trust Points", GOLD, "A gamified reputation system that awards points to users for every successful verified physical handover.")

# Thank You
s = new_slide()
path = os.path.join(IMAGES, "UITS.png")
if os.path.exists(path):
    pic = s.shapes.add_picture(path, Inches(0), Inches(0.3), height=Inches(1.9))
    pic.left = int((prs.slide_width - pic.width) / 2)
txt(s, "Thank You!", 0.4, 2.2, 12.5, 1.4, size=56, bold=True, color=GOLD, align=PP_ALIGN.CENTER)
txt(s, "LASTPRICE MARKETPLACE", 0.4, 3.6, 12.5, 0.5, size=18, bold=True, color=MUTED, align=PP_ALIGN.CENTER)
txt(s, "❓ Questions & Answers", 0.4, 5.0, 12.5, 0.5, size=24, bold=True, color=GOLD, align=PP_ALIGN.CENTER)

box = s.shapes.add_shape(1, Inches(5.75), Inches(6.5), Inches(1.8), Inches(0.5))
box.fill.solid(); box.fill.fore_color.rgb = CHARCOAL; box.line.color.rgb = GOLD
txt(s, "🎤 Rudro", 5.75, 6.57, 1.8, 0.5, size=14, bold=True, color=GOLD, align=PP_ALIGN.CENTER)

prs.save(OUT)
print(f"✅ Saved: {OUT}")
