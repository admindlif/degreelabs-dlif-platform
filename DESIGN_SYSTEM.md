# DegreeLabs Portal Design System

This design system is extracted directly from the live DegreeLabs marketing site ([degreelabs.com](https://www.degreelabs.com), `/discover`, `/how-it-works`, `/grow`) and reconciled with the official DegreeLabs brand identity (Navy wordmark + Blue "D" mark + signature Orange highlight language).

---

## 1. Extracted Brand Palette

Every color below is extracted from real elements and Framer design tokens (`--token-*`) on `degreelabs.com`.

| Role | Token / CSS Var | Hex Value | RGB / HSL | Sampled Location on Live Site |
| :--- | :--- | :--- | :--- | :--- |
| **Primary Accent (Orange)** | `--color-brand-orange`<br>`--token-60e27a11-67de-4df2-a5ca-210b2386ad63` | `#FF510E` | `rgb(255, 81, 14)`<br>`hsl(17, 100%, 53%)` | Primary CTA pill buttons ("Register for Discover", "Get in touch"), signature italic serif headline phrases ("Start with Discover", "Capability builds careers"). |
| **Primary Accent Hover** | `--color-brand-orange-hover` | `#E0460A` | `rgb(224, 70, 10)` | Interactive hover state for primary CTA buttons. |
| **Brand Navy** | `--color-brand-navy` | `#13152B` | `rgb(19, 21, 43)`<br>`hsl(235, 39%, 12%)` | DegreeLabs official wordmark logo. Anchors foundational portal surfaces, sidebar headers, and high-authority brand elements. |
| **Brand Blue (D-Mark Base)** | `--color-brand-blue` | `#3877F9` | `rgb(56, 119, 249)`<br>`hsl(220, 94%, 60%)` | Iconic DegreeLabs "D" symbol mark. Used for portal badges, active indicators, focus rings, and verified checkmarks. |
| **Brand Blue (D-Mark Light)** | `--color-brand-blue-light` | `#3CA3FA` | `rgb(60, 163, 250)`<br>`hsl(207, 95%, 61%)` | Top highlight gradient tone of the DegreeLabs "D" icon mark. |
| **Heading / Primary Dark** | `--color-text-primary`<br>`--token-8d37f8a2-bb7f-4ef2-bf08-a54047846d7c` | `#151515` | `rgb(21, 21, 21)` | Hero H1 headline ("AI-ready problem-solvers for real company challenges"), section titles, primary page headings. |
| **Secondary Dark / Subtitle** | `--color-text-secondary`<br>`--token-be12bf28-1c87-4989-b118-d0f7e5f987ff` | `#2C2C2C` | `rgb(44, 44, 44)` | Sub-headings, section lead headers, card titles. |
| **Body Text / Neutral Dark** | `--color-text-body`<br>`--token-8ce39644-6036-46af-a3f7-8ef5b22206ff` | `#444444` | `rgb(68, 68, 68)` | Hero lead paragraphs, card descriptions, body paragraphs. |
| **Muted / Caption Text** | `--color-text-muted`<br>`--token-60628465-67b9-4ff1-8417-36a198aca31c` | `#8A8A8A` | `rgb(138, 138, 138)` | Navigation inactive links, metadata timestamps, session durations, input placeholders. |
| **Canvas / Pure White** | `--color-bg-canvas`<br>`--token-45dc5b98-5f37-4d75-bbed-428b7260b726` | `#FFFFFF` | `rgb(255, 255, 255)` | Navbar background, main canvas background, white card interiors. |
| **Surface / Light Card** | `--color-bg-surface`<br>`--token-d38ea4d8-0ce1-4361-8ee1-a9f3c0c6ee83` | `#F9F9F9` | `rgb(249, 249, 249)` | Hero wrapper section background, feature cards (`.framer-2h3k6v`), module containers. |
| **Surface Secondary** | `--color-bg-subtle`<br>`--token-84b8e2c9-784d-4dcc-842b-3c4f8b597651` | `#F3F3F3` | `rgb(243, 243, 243)` | Nested pill tags, secondary button hover states, code/metadata chips. |
| **Border Default** | `--color-border-default`<br>`--token-329b5ea4-3083-43d7-9bf8-ed7f819f57a6` | `#E8E8E8` | `rgb(232, 232, 232)` | Navbar bottom border, 1px card perimeter border (`.framer-2h3k6v`), section dividers. |
| **Border Strong / Outline** | `--color-border-strong`<br>`--token-82dc333d-9003-46ec-8b50-e51dc363e4ac` | `#D0D0D0` | `rgb(208, 208, 208)` | Secondary pill button borders, input borders, interactive element strokes. |
| **Border Light / Divider** | `--color-border-subtle`<br>`--token-170ae0d5-7611-4763-ad50-88472d1ec49a` | `#DAD7D7` | `rgb(218, 215, 215)` | Subtle dividers, footer border lines. |
| **Accent Gold / Highlight** | `--color-accent-gold`<br>`--token-32d7a139-ad13-445e-bdaf-c978ae411e2a` | `#FFD000` | `rgb(255, 208, 0)` | Star ratings, highlight badges, achievement markers. |
| **Semantic Success** | `--color-success` | `#25D366` | `rgb(37, 211, 102)` | "Live Today" status badges, active indicators, verified submissions. |
| **Semantic Error / Danger** | `--color-danger`<br>`--token-74cfe941-4f86-4e3c-8562-500a65483473` | `#F71919` | `rgb(247, 25, 25)` | Form validation errors, past-due notices, destructive actions. |

---

## 2. Typography Scale

### Font Families
1. **Primary UI & Headings**: `"Hanken Grotesk"`, `"DM Sans"`, `-apple-system`, `BlinkMacSystemFont`, `sans-serif`
2. **Signature Accent Serif**: `"DM Serif Text"`, `Georgia`, `serif` (used strictly in **italic 400** for punchy headline highlights)
3. **Monospace / Code**: `"Fragment Mono"`, `Menlo`, `monospace`

### Type Hierarchy Table

| Level / Role | Family | Size (Desktop) | Size (Mobile) | Weight | Line Height | Letter Spacing | Usage / Notes |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Display / Hero H1** | Hanken Grotesk | `56px` – `59px` | `36px` | 700 (Bold) | `1.05em` – `1.15em` | `-1px` (`-0.02em`) | Portal overview titles, hero marketing headers. |
| **Serif Accent Phrase** | DM Serif Text | `56px` | `36px` | **400 Italic** | `1.15em` | `-0.018em` | Signature DegreeLabs brand statement highlight (rendered in `#FF510E`). |
| **H1 (Page Title)** | Hanken Grotesk | `44px` | `32px` | 700 (Bold) | `1.15em` | `-0.02em` | Main page titles (e.g. "Discover Program"). |
| **H2 (Section Header)**| Hanken Grotesk | `36px` | `28px` | 700 (Bold) | `1.2em` | `-0.015em` | Major module headers (e.g. "Your 4-week Discover journey"). |
| **H3 (Card Title)** | Hanken Grotesk | `24px` | `20px` | 700 (Bold) | `1.25em` | `0` | Session titles, weekly challenge milestones. |
| **H4 (Subheading)** | Hanken Grotesk | `20px` | `18px` | 600 (SemiBold)| `1.3em` | `0` | Sub-sections, team module headings. |
| **Lead / Body Large** | DM Sans | `18px` | `16px` | 400 / 500 | `1.6em` | `0` | Lead description under headings (in `#444444`). |
| **Body Base** | DM Sans | `15px` – `16px` | `15px` | 400 / 500 | `1.5em` | `0` | Standard UI text, descriptions, table body. |
| **Body Small** | DM Sans | `13px` – `14px` | `13px` | 400 / 500 | `1.4em` | `0` | Auxiliary information, helper text, session notes. |
| **Caption / Eyebrow** | Hanken Grotesk | `12px` | `11px` | 700 (Bold) | `1.3em` | `+0.06em` | Eyebrow badges, week markers (e.g. `WEEK 01`), uppercase. |

---

## 3. Spacing System

The site adheres to a disciplined **4px / 8px grid** with generous breathing room reflecting modern SaaS aesthetics.

| Token | Pixels | Rem (16px base) | Primary Usage |
| :--- | :--- | :--- | :--- |
| `space-1` | `4px` | `0.25rem` | Icon-to-text micro gap, compact padding. |
| `space-2` | `8px` | `0.5rem` | Badge padding (`4px 8px`), chip padding. |
| `space-3` | `12px` | `0.75rem` | Button icon gaps, input vertical padding. |
| `space-4` | `16px` | `1rem` | Standard component gap, list item gap, mobile card padding. |
| `space-5` | `20px` | `1.25rem` | Intermediate container padding, header inner gap. |
| `space-6` | `24px` | `1.5rem` | Standard button horizontal padding (`14px 24px`), grid column gap. |
| `space-8` | `32px` | `2rem` | Card padding (`.framer-2h3k6v`), section column gaps. |
| `space-10`| `40px` | `2.5rem` | Sub-section margins, modal vertical spacing. |
| `space-12`| `48px` | `3rem` | Large feature card separation. |
| `space-16`| `64px` | `4rem` | Section vertical padding (tablet/laptop). |
| `space-20`| `80px` | `5rem` | Major desktop section vertical separation. |

---

## 4. Radius System

The DegreeLabs identity balances extreme pill curves for actions with soft, generous rounded rectangles for content surfaces:

| Role | Token | Value | Target Elements |
| :--- | :--- | :--- | :--- |
| **Pill (Signature)** | `--radius-full` | `500px` (`9999px`) | Primary buttons, outline buttons, filter chips, role badges (`STUDENT`, `ADMIN`), search inputs. |
| **Card (Signature)** | `--radius-card` | `24px` | Primary module cards (`.framer-2h3k6v`), session cards, journey phase panels. |
| **Surface Medium** | `--radius-md` | `16px` | Nested sub-cards, submission drawers, resource items, dialog modals. |
| **Input / Element** | `--radius-sm` | `10px` – `12px` | Text inputs, dropdown menus, table containers. |
| **Micro / Tag** | `--radius-xs` | `6px` – `8px` | Tooltips, date badges, small code blocks. |

---

## 5. Button Styles

All interactive buttons on DegreeLabs follow the **pill form factor** (`border-radius: 500px`).

### 1. Primary Button (Signature Orange Pill)
- **Background**: `#FF510E` (`--color-brand-orange`)
- **Text Color**: `#FFFFFF`
- **Border**: None
- **Radius**: `500px`
- **Font**: `"Hanken Grotesk"`, weight `700`, line-height `1.1em`
- **Padding**:
  * Large / Hero: `18px 32px` (font-size: `16px`)
  * Standard / Action: `14px 24px` (font-size: `15px`)
  * Compact / Header: `8px 20px` (font-size: `14px`)
- **Hover State**: Background `#E0460A`, subtle transform `translateY(-1px)`, transition `all 0.2s ease`
- **Active State**: Background `#C73D07`, transform `translateY(0)`
- **Disabled State**: Background `#E8E8E8`, text `#8A8A8A`, cursor `not-allowed`

### 2. Secondary / Outline Button
- **Background**: `transparent` (`rgba(0, 0, 0, 0)`)
- **Border**: `1px solid #D0D0D0` (`--color-border-strong`)
- **Text Color**: `#151515` (`--color-text-primary`)
- **Radius**: `500px`
- **Font**: `"Hanken Grotesk"`, weight `600`, line-height `1.1em`
- **Padding**: `14px 24px`
- **Hover State**: Background `#F3F3F3`, border `#8A8A8A`, transition `all 0.2s ease`
- **Active State**: Background `#E8E8E8`
- **Disabled State**: Border `#E8E8E8`, text `#8A8A8A`

### 3. Ghost / Text Button
- **Background**: `transparent`
- **Border**: None
- **Text Color**: `#151515` (or `#444444`)
- **Radius**: `500px`
- **Padding**: `8px 16px`
- **Hover State**: Background `#F3F3F3`, text `#151515`

### 4. Brand Navy Button (Portal Operational)
- **Background**: `#13152B` (`--color-brand-navy`)
- **Text Color**: `#FFFFFF`
- **Border**: None
- **Radius**: `500px`
- **Hover State**: Background `#1E2242`

---

## 6. Surface & Card Styles

Cards on the live site provide subtle elevation through high-contrast boundary definition rather than heavy muddy drop shadows.

### 1. Default Surface Card (`.framer-2h3k6v`)
- **Background**: `#F9F9F9` (`--color-bg-surface`)
- **Border**: `1px solid #E8E8E8` (`--color-border-default`)
- **Radius**: `24px`
- **Padding**: `32px` (desktop), `20px` (mobile)
- **Shadow**: None (clean flat border-delineated plane)

### 2. Elevated / Highlight Card
- **Background**: `#FFFFFF` (`--color-bg-canvas`)
- **Border**: `1px solid #E8E8E8`
- **Radius**: `24px`
- **Padding**: `32px`
- **Shadow**: `0 4px 30px rgba(0, 0, 0, 0.06)` (`0 4px 30px #00000010`)
- **Hover Elevation**: `0 8px 36px rgba(0, 0, 0, 0.09)`, subtle border shift to `#D0D0D0`

### 3. Active / Milestone Card
- **Background**: `#FFFFFF`
- **Border**: `1.5px solid #3877F9` (DegreeLabs brand blue accent)
- **Radius**: `24px`
- **Badge Accent**: Top right pill with `#FF510E` or `#25D366`

---

## 7. Navigation Concept

### Translating Marketing Top Nav into Authenticated Portal Nav
The marketing site features a clean sticky top header (`background: #FFFFFF; border-bottom: 1px solid #E8E8E8; height: 72px`). For the authenticated multi-role portal (`STUDENT`, `MENTOR`, `ADMIN`), this translates into an integrated **Sidebar + Topbar Architecture**:

```
+------------------------------------------------------------------------------------+
|  [D-Mark] DegreeLabs       | Cohort: DLIF-2026-A   Phase: DISCOVER   [Search]  (User)  |  <- Topbar
+----------------------------+-------------------------------------------------------+
|  LEARNING PATH             |                                                       |
|  * DISCOVER (Active)       |  DISCOVER / 4-Week Journey                            |
|  * My Sessions             |  Degrees open doors. Capability builds careers.       |
|  * Assignments             |                                                       |
|  * Resources               |  [ Next Session: Thursday 6:00 PM ]                   |
|                            |                                                       |
|  COLLABORATION             |  +-------------------------------------------------+  |
|  * My Team                 |  | W1: Understand the Challenge (Active)           |  |
|  * Mentor                  |  +-------------------------------------------------+  |
|                            |  | W2: Research & Insights                         |  |
|  ACCOUNT                   |  +-------------------------------------------------+  |
|  * Notifications           |  | W3: Solution Framework                          |  |
|  * Profile & Security      |  +-------------------------------------------------+  |
|                            |  | W4: Proposal & Presentation                     |  |
|  [ Role Badge: STUDENT ]   |  +-------------------------------------------------+  |
+----------------------------+-------------------------------------------------------+
```

1. **Left Navigation Sidebar**:
   - Fixed width (`260px` desktop, collapsible to `72px` icon rail, drawer on mobile).
   - Header: DegreeLabs Logo (`frontend/public/degreelabs-logo.png`) featuring Navy wordmark `#13152B` + Blue mark `#3877F9`.
   - Role Indicator: Distinct pill badge (`STUDENT` in Blue `#3877F9`, `MENTOR` in Purple, `ADMIN` in Orange `#FF510E`).
   - Grouped Links: Clear sections (`LEARNING PATH`, `COLLABORATION`, `ACCOUNT`) with icons from Lucide React.
   - Active Link State: `#F3F3F3` surface fill, `#151515` bold text, with a 3px active indicator bar on the left in `#FF510E`.

2. **Context Topbar**:
   - Height: `64px`, sticky top, `#FFFFFF` background with `1px solid #E8E8E8`.
   - Content: Current Cohort breadcrumb, Global Search, Notification bell with live dot, and User Avatar with dropdown (2FA status, Logout).

---

## 8. Responsive Behavior

| Breakpoint | Width Range | Layout Adjustments | Typography Scale |
| :--- | :--- | :--- | :--- |
| **Desktop (XL)** | `1200px+` | Full 260px sidebar + max 1280px content container. Multi-column cards (3 cols). | H1: `56px`, H2: `36px`, Card padding: `32px`. |
| **Laptop (LG)** | `992px` – `1199px` | 240px sidebar + fluid content container. 2-column card layouts. | H1: `44px`, H2: `30px`, Card padding: `28px`. |
| **Tablet (MD)** | `768px` – `991px` | Collapsible sidebar to icon bar (72px) or top banner. Single/dual column cards. | H1: `36px`, H2: `26px`, Card padding: `24px`. |
| **Mobile (SM)** | `< 768px` | Full width, bottom tab bar or hamburger slide-over drawer. 1 column stack. | H1: `30px`, H2: `22px`, Card padding: `16px–20px`. |

---

## 9. Animation Rules

Derived from Framer Motion transitions inspected on the live site:

1. **Micro-interactions (Buttons, Badges, Hover)**:
   - Duration: `200ms`
   - Easing: `cubic-bezier(0.44, 0, 0.56, 1)` or `ease-out`
   - Properties: `background-color`, `border-color`, `transform: translateY(-1px)`
2. **Card Elevation Hover**:
   - Duration: `250ms`
   - Easing: `ease-out`
   - Properties: `box-shadow`, `border-color`
3. **Page Transitions & Reveal**:
   - Initial: `opacity: 0; transform: translateY(16px)`
   - Animate: `opacity: 1; transform: translateY(0)`
   - Duration: `350ms`
   - Easing: `cubic-bezier(0.16, 1, 0.3, 1)` (smooth deceleration)
4. **Dropdowns & Modals**:
   - Scale from `0.98` to `1.0`, opacity `0` to `1`, `180ms` ease-out.

---

## 10. Proposed Student DISCOVER Screen Architecture

The student portal DISCOVER phase screen translates the **4-Week Discover Journey** from the DegreeLabs curriculum into an actionable, premium SaaS workspace:

### Layout Structure (Desktop Grid: 12 Columns)

```
+------------------------------------------------------------------------------------------+
| ZONE 1: DISCOVER PHASE HERO BANNER                                                       |
| - Eyebrow: "DEGREE LABS INDUSTRY FELLOWSHIP (DLIF) - COHORT 2026-A"                      |
| - Title: "Discover Program"                                                             |
| - Signature Sub-title: "The classroom gives knowledge. Discover builds capability."     |
|   (with "Discover builds capability" in Italic Serif #FF510E)                           |
| - Overall Journey Progress Bar (e.g. "Week 1 of 4 | 25% Completed")                       |
+------------------------------------------------------------------------------------------+

+----------------------------------------------------+  +---------------------------------+
| ZONE 2: LIVE & UPCOMING FOCUS (Col 1-8)            |  | ZONE 3: FELLOW TOOLKIT (Col 9-12|
|                                                    |  |                                 |
| [FEATURE CARD - #FFFFFF, 24px radius, subtle glow] |  | [QUICK ACCESS CARD - #F9F9F9]   |
| - Badge: "NEXT UPCOMING SESSION" (Live in 2h)      |  | - DLIF Fellow Handbook [PDF]    |
| - Session 02: "Industry Discovery & Challenge Deep |  | - Challenge Working Board [Miro]|
|   Dive"                                            |  | - Student Submission Template   |
| - Date & Time: Thursday, Oct 12 - 6:00 PM - 8:00 PM|  |                                 |
| - Mentor: Dr. Marcus Vance (SK Innovation Lead)    |  | [MY TEAM SQUAD CARD]            |
| - Primary Action:                                  |  | - Team "Alpha-4"                |
|   [ Join Live Session (Orange Pill Button) ]       |  | - 4 Members (Active status)     |
|   [ Add to Calendar (Secondary Outline Pill) ]     |  | - Assigned Mentor: M. Vance     |
+----------------------------------------------------+  +---------------------------------+

+------------------------------------------------------------------------------------------+
| ZONE 4: 4-WEEK JOURNEY PROGRESSION ROADMAP (Full Width)                                  |
|                                                                                          |
| [ W1: Understand the Challenge ]  -> CURRENT ACTIVE                                      |
|   - Session 0: Induction & Setup (Completed [Checkmark])                                 |
|   - Session 1: Problem Space Analysis (Completed [Checkmark])                            |
|   - Session 2: Industry Discovery (Today, 6:00 PM)                                       |
|   - Deliverable: Problem Decomposition Sheet (Due Sunday, Oct 15)                        |
|                                                                                          |
| [ W2: Research & Insights ]       -> UPCOMING (Unlocks Oct 16)                           |
|   - Session 3: Customer & Market Discovery                                               |
|   - Session 4: Competitive Landscape Mapping                                             |
|                                                                                          |
| [ W3: Solution Framework ]        -> LOCKED                                              |
|   - Session 5: Ideation & Feasibility Matrix                                             |
|   - Session 6: Solution Architecture & Feedback                                          |
|                                                                                          |
| [ W4: Proposal & Presentation ]   -> LOCKED                                              |
|   - Session 7: Pitch Deck & Business Case                                                |
|   - Session 8: Final Presentation to Industry Jury                                       |
+------------------------------------------------------------------------------------------+
```

### Key Interactive Modules:
1. **Hero Banner**: Embeds the authentic DegreeLabs brand voice with `"DM Serif Text"` italic highlights (`#FF510E`).
2. **Live Session Spotlight Card**: Highlights the immediate countdown, zoom/meet link trigger, and session materials (slides, recording placeholder, attendance status).
3. **Weekly Accordion / Stepper**: Distinct visual progression from `Completed` (soft green border + checkmark), `Active / In Progress` (brand blue `#3877F9` border + active glow), to `Upcoming` (muted `#8A8A8A`).
4. **Fellow Handbook & Resources Rail**: Always accessible one-click downloads for curriculum handbooks, rubrics, and working board templates.
