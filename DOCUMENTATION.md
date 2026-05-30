# Interview Prep Platform — Complete Developer Documentation

> **Purpose:** This document covers everything about this project — every file, every external service, how they were set up, and exactly how to change or extend any part of it. Read this before touching code.

---

## How to Keep This Document Updated

Whenever you add, change, or integrate something new, give Claude this prompt to update the docs:

**When you add something new:**
```
Update DOCUMENTATION.md — I added [what you added]. Add a section / update the relevant section to cover [what it does, how it's set up, how to change it].
```

**When you change something existing:**
```
Update DOCUMENTATION.md — I changed [what changed] in [file/feature]. Reflect this in the docs.
```

**When you add a new external service or library:**
```
Update DOCUMENTATION.md — I integrated [service name]. Add setup steps, config, and a how-to cookbook entry for it.
```

**Real examples:**
```
Update DOCUMENTATION.md — I added a Notes feature to each QuestionCard, stored in Firestore. Add the Firestore field, the component behavior, and a cookbook entry for how to use it.
```
```
Update DOCUMENTATION.md — I switched from GitHub Pages to Vercel for deployment. Update the Deployment section.
```
```
Update DOCUMENTATION.md — I added a new topic called GraphQL with its data file and route. Add it to the directory structure, data files section, and the add-a-topic cookbook.
```
```
Update DOCUMENTATION.md — I added email/password login alongside Google. Update the Auth section.
```

> **Rule:** Always mention **what changed and where**. The more specific, the more accurate the update.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Tech Stack & Why Each Was Chosen](#2-tech-stack--why-each-was-chosen)
3. [Local Setup From Scratch](#3-local-setup-from-scratch)
4. [Directory Structure](#4-directory-structure)
5. [Firebase — Complete Setup Guide](#5-firebase--complete-setup-guide)
6. [Firestore — Database Schema & Rules](#6-firestore--database-schema--rules)
7. [Authentication — How It Works](#7-authentication--how-it-works)
8. [State Management — Context API](#8-state-management--context-api)
9. [Routing](#9-routing)
10. [Data Files — How Content Is Stored](#10-data-files--how-content-is-stored)
11. [Components — Every One Explained](#11-components--every-one-explained)
12. [Styling Guide](#12-styling-guide)
13. [Build System](#13-build-system)
14. [Deployment — GitHub Pages & GitHub Actions](#14-deployment--github-pages--github-actions)
15. [LocalStorage — Keys & Usage](#15-localstorage--keys--usage)
16. [How To: Common Tasks Cookbook](#16-how-to-common-tasks-cookbook)
17. [Conventions & Patterns](#17-conventions--patterns)
18. [Known Warnings & Their Meaning](#18-known-warnings--their-meaning)

---

## 1. Project Overview

**Randhir's Interview Prep Platform** is a single-page web application built to prepare a Java Backend Developer for technical interviews at service and product companies. It is:

- **Deployed** on GitHub Pages at: `https://randhirrkumar.github.io/Interview-Prep/`
- **Backed** by Firebase (Google Auth + Firestore) for multi-device progress tracking
- **Fully offline-capable** for unauthenticated users (LocalStorage fallback)
- **Covers** 215+ Q&A, 5 project deep-dives, 4-week roadmap, mock interviews, DSA, system design, HR prep, flashcards, and company-specific prep

**Target user:** Randhir Kumar — Java Backend Developer, 4+ years experience at Adani Groups, preparing for 2026 placements.

---

## 2. Tech Stack & Why Each Was Chosen

| Tool | Version | Why |
|---|---|---|
| **React** | 18.2.0 | Component model + hooks make it easy to build interactive Q&A cards, context-based state, and reusable UI |
| **Vite** | 5.1.4 | Extremely fast dev server (HMR in milliseconds), simple config, ideal for SPA |
| **React Router DOM** | 6.22.0 | Declarative routing; `HashRouter` used specifically because GitHub Pages does not support server-side URL rewriting |
| **Tailwind CSS** | 3.4.1 | Utility-first → no separate CSS files for each component; dark mode via class is built-in |
| **Firebase (Auth)** | 12.13.0 | Google Sign-In in ~10 lines of code; no backend server needed |
| **Firebase (Firestore)** | 12.13.0 | NoSQL real-time database; stores user progress per UID; free tier easily covers this app's usage |
| **Lucide React** | 0.344.0 | Tree-shakeable SVG icons; only icons actually imported are included in the bundle |
| **PostCSS + Autoprefixer** | 8.x / 10.x | Required by Tailwind for CSS processing; autoprefixer adds vendor prefixes automatically |
| **GitHub Actions** | — | Free CI/CD; triggers on every push to `main`, builds, and deploys to GitHub Pages |

---

## 3. Local Setup From Scratch

### Prerequisites
- Node.js 18 or 20 (check: `node -v`)
- npm 8+ (check: `npm -v`)
- Git

### Clone and install
```bash
git clone https://github.com/randhirrkumar/Interview-Prep.git
cd Interview-Prep
npm install
```

### Run locally
```bash
npm run dev
```
Opens at `http://localhost:5173`. Hot reload is active — save any file and the browser updates instantly.

### Build for production
```bash
npm run build
```
Outputs to `dist/`. The `base: '/Interview-Prep/'` in `vite.config.js` prefixes all asset paths — this is required for GitHub Pages.

### Preview production build locally
```bash
npm run preview
```
Serves `dist/` at `http://localhost:4173/Interview-Prep/`.

---

## 4. Directory Structure

Every file and folder, explained:

```
interview-prep/
│
├── src/                          # All source code lives here
│   │
│   ├── main.jsx                  # Entry point — mounts <App /> into #root div
│   ├── App.jsx                   # Root component; defines all routes and wraps providers
│   ├── firebase.js               # Firebase initialization; exports auth, db, googleProvider
│   ├── index.css                 # Global CSS: Tailwind directives + custom component classes
│   │
│   ├── contexts/                 # React Context providers (global state)
│   │   ├── AuthContext.jsx       # Firebase auth state; exposes user, login(), logout()
│   │   └── ProgressContext.jsx   # Study progress (completed, bookmarks, streak); syncs Firestore/localStorage
│   │
│   ├── hooks/
│   │   └── useProgress.js        # Re-exports useProgress from ProgressContext (convenience import)
│   │
│   ├── utils/
│   │   └── storage.js            # localStorage abstraction: STORAGE_KEYS, getItem, setItem, markCompleted, toggleBookmark
│   │
│   ├── data/                     # All interview content as JS objects (no API calls)
│   │   ├── javaCore.js           # 40 Q&A: OOP pillars, exceptions, JVM, memory, generics
│   │   ├── java8Streams.js       # 30 Q&A: lambdas, streams, Optional, functional interfaces
│   │   ├── multithreading.js     # Thread creation, synchronized, locks, ExecutorService, deadlocks
│   │   ├── collections.js        # HashMap internals, ArrayList, LinkedList, ConcurrentHashMap, TreeMap
│   │   ├── springBoot.js         # 35 Q&A: auto-config, DI, REST, AOP, bean lifecycle, profiles
│   │   ├── microservices.js      # 30 Q&A: patterns, CAP theorem, API gateway, service discovery, saga
│   │   ├── kafka.js              # 20 Q&A: producers, consumers, partitions, consumer groups, replication
│   │   ├── hibernate.js          # JPA, N+1 problem, lazy/eager loading, query optimization, transactions
│   │   ├── sql.js                # Joins, subqueries, window functions, indexing, ACID, normalization
│   │   ├── security.js           # Spring Security, JWT, OAuth2, SAML, filter chain, CSRF
│   │   ├── designPatterns.js     # Singleton, Factory, Builder, Observer, Adapter, Decorator, Strategy
│   │   ├── docker.js             # Dockerfile, layers, multi-stage builds, compose, orchestration
│   │   ├── testing.js            # JUnit 5, Mockito, @SpringBootTest, assertions, TDD
│   │   ├── azure.js              # App Service, deployment slots, env variables, Key Vault, CI/CD
│   │   ├── sso.js                # SAML flow, assertions, identity providers, OAuth2 vs SAML
│   │   ├── dsaProblems.js        # 100+ LeetCode-style problems with approach + solution code
│   │   ├── hrQuestions.js        # Tell me about yourself, switch reason, gap handling, salary negotiation
│   │   ├── projects.js           # EPLMS, MetLife, E-commerce, URL Shortener, Banking — deep-dive data
│   │   └── roadmap.js            # 4-week daily structured prep plan
│   │
│   └── components/               # UI components, one folder per feature
│       ├── Layout/
│       │   ├── Layout.jsx        # Master wrapper: sidebar + header + <Outlet /> for page content
│       │   ├── Header.jsx        # Top bar: logo, search input, streak, date, sign-in/out button
│       │   └── Sidebar.jsx       # Left nav: collapsible sections, topic links, company links
│       │
│       ├── Dashboard/
│       │   └── Dashboard.jsx     # Home page: KPI cards, topic grid, weak areas, today's focus
│       │
│       ├── Topics/
│       │   └── TopicPage.jsx     # Generic Q&A topic page: reads topicId param, filters, renders QuestionCards
│       │
│       ├── Projects/
│       │   └── ProjectPage.jsx   # Project deep-dive: reads projectId param, renders pitch/HLD/LLD/challenges
│       │
│       ├── MockInterview/
│       │   └── MockInterview.jsx # Timed mock: question timer, self-assess (Good/Okay/Bad), score summary
│       │
│       ├── SystemDesign/
│       │   └── SystemDesign.jsx  # 8 design problems, each with expandable HLD/LLD/scaling sections
│       │
│       ├── HR/
│       │   └── HRQuestions.jsx   # 6-section HR prep: intro, switch, gap, pressure, behavioral, salary
│       │
│       ├── Company/
│       │   └── CompanyPrep.jsx   # Company cards (TCS, Cognizant, Capgemini, Infosys, etc.) with Q&A
│       │
│       ├── DSA/
│       │   └── DSAProblems.jsx   # Algorithm problems with category filter, approach, code solution
│       │
│       ├── FlashCards/
│       │   └── FlashCards.jsx    # Flip cards: front = question, back = answer, filter by topic
│       │
│       ├── STAR/
│       │   └── STARBuilder.jsx   # Create/edit/delete STAR stories; persisted in localStorage
│       │
│       ├── Roadmap/
│       │   └── Roadmap.jsx       # 4-week plan by day; check off days; daily topic/revision list
│       │
│       ├── Revision/
│       │   └── RevisionScheduler.jsx  # Schedule topics for 1/3/7/14-day spaced revision
│       │
│       ├── Analytics/
│       │   └── Analytics.jsx    # Progress bars per topic, streak, study days, readiness level
│       │
│       └── common/
│           └── QuestionCard.jsx  # Reusable collapsible card: question, answer, code, follow-ups, bookmark, done
│
├── .github/
│   └── workflows/
│       └── deploy.yml            # GitHub Actions: build on push to main → deploy to GitHub Pages
│
├── index.html                    # HTML shell; has class="dark" on <html> for dark mode
├── package.json                  # npm scripts (dev, build, preview) + all dependencies
├── vite.config.js                # Vite config: react plugin + base path for GitHub Pages
├── tailwind.config.js            # Tailwind: content paths, darkMode: 'class', custom colors & animations
├── postcss.config.js             # PostCSS: tailwindcss + autoprefixer plugins
└── .gitignore                    # Ignores: node_modules/, dist/, .env*, *.log
```

---

## 5. Firebase — Complete Setup Guide

This app uses **Firebase v12** (modular SDK). If you ever need to set up Firebase from scratch (new project, new developer, etc.), follow these steps exactly.

### Step 1: Create a Firebase Project

1. Go to [https://console.firebase.google.com](https://console.firebase.google.com)
2. Click **"Add project"**
3. Name it (e.g., `interview-prep`)
4. Disable Google Analytics (not needed) → Create
5. Wait for the project to be provisioned

### Step 2: Register a Web App

1. In the Firebase console, click the **Web icon** (`</>`) on the project home page
2. Register the app with a nickname (e.g., `Interview Prep Web`)
3. Do **NOT** check "Also set up Firebase Hosting" — this project uses GitHub Pages
4. Click **Register app**
5. Copy the `firebaseConfig` object — you'll paste it into `src/firebase.js`

### Step 3: Enable Google Authentication

1. In the Firebase console, go to **Authentication → Sign-in method**
2. Click **Google** in the list
3. Toggle it **Enabled**
4. Set a **Project support email** (your Google account)
5. Click **Save**

**That's it for auth.** No client secret or server key needed for Google Sign-In with popup.

### Step 4: Set Up Firestore

1. In the Firebase console, go to **Firestore Database**
2. Click **"Create database"**
3. Choose **"Start in production mode"** (you'll add rules next)
4. Pick a region closest to your users (e.g., `asia-south1` for India)
5. Click **Enable**

### Step 5: Set Firestore Security Rules

Go to **Firestore → Rules** tab and paste:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

**What this does:** Only the authenticated user can read/write their own document. No one else can access it. Anonymous users (not signed in) get no access.

### Step 6: Add Authorized Domains

1. Go to **Authentication → Settings → Authorized domains**
2. Add: `randhirrkumar.github.io` (replace with your GitHub username)
3. `localhost` is already there (for local dev)

**Why:** Firebase blocks Google Sign-In from domains not on this list. If you see "auth/unauthorized-domain" error, add your domain here.

### Step 7: Paste Config into firebase.js

Open `src/firebase.js` and replace the `firebaseConfig` object with the one from Step 2:

```javascript
import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.firebasestorage.app",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)
export const googleProvider = new GoogleAuthProvider()
```

**Is it safe to commit these keys?** Yes. Firebase API keys for web apps are public by design — they only identify your project. Security is enforced by Firestore Rules (Step 5) and Authorized Domains (Step 6), not by keeping the key secret.

### Current Firebase Project Details

| Setting | Value |
|---|---|
| Project ID | `interview-prep-118b9` |
| Auth Domain | `interview-prep-118b9.firebaseapp.com` |
| Firestore Region | (default — us-central1) |
| Authorized Domain | `randhirrkumar.github.io` |

---

## 6. Firestore — Database Schema & Rules

### Document Path

Each user has exactly one document:

```
/users/{uid}
```

Where `{uid}` is the Firebase Authentication UID (unique string per Google account).

### Document Fields

```json
{
  "completed": ["java-core_1", "java-core_2", "springBoot_5", "dsa_12"],
  "bookmarks": ["java-core_5", "kafka_3"],
  "streak": 7,
  "lastStudyDate": "Fri May 30 2026",
  "startDate": "Mon May 05 2026"
}
```

| Field | Type | Description |
|---|---|---|
| `completed` | `string[]` | IDs of questions/items marked done. Format: `{topicId}_{questionId}` |
| `bookmarks` | `string[]` | IDs of bookmarked items. Same format as completed |
| `streak` | `number` | Count of consecutive study days |
| `lastStudyDate` | `string` | `new Date().toDateString()` format — e.g., `"Fri May 30 2026"` |
| `startDate` | `string` | Same format — date of first study activity |

### ID Format for completed/bookmarks

The ID is always `{topicKey}_{questionIndex}`:

| Content Type | Example ID |
|---|---|
| Java Core question #3 | `java-core_3` |
| Spring Boot question #7 | `springBoot_7` |
| DSA problem #15 | `dsa_15` |
| Roadmap day 4 | `roadmap_day_4` |

The `topicKey` values match the URL slug used in routes (e.g., `/topics/java-core` → `java-core`).

### Firestore Rules (current)

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### How Reads and Writes Work in Code

**Read** (once, on login):
```javascript
// ProgressContext.jsx — loadFromFirestore()
const snap = await getDoc(doc(db, 'users', uid))
return snap.exists() ? snap.data() : null
```

**Write** (on every completion/bookmark):
```javascript
// ProgressContext.jsx — saveToFirestore()
await setDoc(doc(db, 'users', uid), data, { merge: true })
```

`{ merge: true }` means only the fields you pass get updated — existing fields not in `data` are untouched. Without `merge: true`, it would overwrite the entire document.

---

## 7. Authentication — How It Works

### Flow: User Signs In

1. User clicks **"Sign In"** in the Header
2. `Header.jsx` calls `login()` from `useAuth()`
3. `login()` in `AuthContext.jsx` calls `signInWithPopup(auth, googleProvider)`
4. Browser opens a Google OAuth popup
5. User picks their Google account
6. Firebase returns a `User` object containing: `uid`, `displayName`, `email`, `photoURL`
7. `onAuthStateChanged` in `AuthContext` fires → `setUser(user)`
8. `ProgressContext` sees `user` changed → loads Firestore data for that UID
9. Header renders user avatar + name + "Sign Out" button

### Flow: User Signs Out

1. User clicks **"Sign Out"**
2. `logout()` in `AuthContext` calls `signOut(auth)`
3. Firebase clears the session
4. `onAuthStateChanged` fires → `setUser(null)`
5. `ProgressContext` sees `user = null` → loads from localStorage instead
6. Header reverts to "Sign In" button

### The `user` State Has Three Values

```javascript
user === undefined   // Still loading (Firebase checking session on page load)
user === null        // Not signed in
user === { uid, displayName, email, photoURL, ... }  // Signed in
```

The `undefined` check prevents the "Sign In" button from flashing briefly on load.

### AuthContext.jsx — Full Source

```javascript
import { createContext, useContext, useEffect, useState } from 'react'
import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth'
import { auth, googleProvider } from '../firebase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(undefined)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, setUser)
    return unsubscribe  // cleanup: stop listening when component unmounts
  }, [])

  const login = () => signInWithPopup(auth, googleProvider)
  const logout = () => signOut(auth)

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
```

### Where Auth Is Used

| File | What it uses |
|---|---|
| `Header.jsx` | `user` (display name/avatar), `login()`, `logout()` |
| `ProgressContext.jsx` | `user.uid` (to read/write Firestore) |

---

## 8. State Management — Context API

There are two global contexts. Both are initialized in `App.jsx` wrapping the entire component tree.

### Context 1: AuthContext

**Provides:** `{ user, login, logout }`

**Import:** `import { useAuth } from '../contexts/AuthContext'`

### Context 2: ProgressContext

**Provides:**

```javascript
{
  streak,           // number: current streak count (0 if broken)
  completed,        // string[]: list of completed item IDs
  bookmarks,        // string[]: list of bookmarked item IDs
  loading,          // boolean: true while loading from Firestore/localStorage
  startDate,        // string | null: date of first study activity
  complete(id),     // async fn: marks item done, updates streak, saves to Firestore or localStorage
  bookmark(id),     // async fn: toggles bookmark, saves
  isCompleted(id),  // fn: returns boolean
  isBookmarked(id), // fn: returns boolean
  getCompletionPercent(ids[])  // fn: returns 0-100 based on how many ids are in completed
}
```

**Import:** `import { useProgress } from '../contexts/ProgressContext'`

### Hybrid Storage Strategy

When user is **signed in** → all reads/writes go to Firestore (`/users/{uid}`)

When user is **not signed in** → all reads/writes go to localStorage (keys prefixed with `prep_`)

This is handled entirely inside `ProgressContext.jsx`. All other components just call `complete()` and `bookmark()` — they never know which storage is being used.

### Streak Logic

```
First activity of the day:
  - If lastStudyDate === yesterday → streak + 1
  - If lastStudyDate is older → streak resets to 1 (broken)
  - If lastStudyDate === today → no change (already counted)

Display streak:
  - If lastStudyDate was today or yesterday → show stored streak
  - If lastStudyDate was 2+ days ago → show 0 (streak is broken visually)
```

---

## 9. Routing

### Why HashRouter (not BrowserRouter)

GitHub Pages is a **static file server** — it can only serve `index.html` from the root. If a user navigates directly to `https://randhirrkumar.github.io/Interview-Prep/#/topics/java-core`, the `#` part (hash) is never sent to the server — it's handled entirely by the browser. With BrowserRouter, direct navigation to `/topics/java-core` would return a 404.

### All Routes

Defined in `src/App.jsx`:

```javascript
<Route path="/" element={<Layout />}>
  <Route index element={<Dashboard />} />                      // #/
  <Route path="roadmap" element={<Roadmap />} />               // #/roadmap
  <Route path="topics/:topicId" element={<TopicPage />} />     // #/topics/java-core
  <Route path="projects/:projectId" element={<ProjectPage />} /> // #/projects/eplms
  <Route path="mock-interview" element={<MockInterview />} />  // #/mock-interview
  <Route path="system-design" element={<SystemDesign />} />    // #/system-design
  <Route path="hr-questions" element={<HRQuestions />} />      // #/hr-questions
  <Route path="company-prep" element={<CompanyPrep />} />      // #/company-prep
  <Route path="flashcards" element={<FlashCards />} />         // #/flashcards
  <Route path="dsa" element={<DSAProblems />} />               // #/dsa
  <Route path="star" element={<STARBuilder />} />              // #/star
  <Route path="analytics" element={<Analytics />} />           // #/analytics
  <Route path="revision" element={<RevisionScheduler />} />    // #/revision
</Route>
```

### Parameterized Routes

**`/topics/:topicId`** — `TopicPage.jsx` reads `topicId` via `useParams()` and looks it up in the `TOPICS` map inside the component. Valid values: `java-core`, `java8`, `multithreading`, `collections`, `spring-boot`, `microservices`, `kafka`, `hibernate`, `sql`, `security`, `design-patterns`, `docker`, `testing`, `azure`, `sso`.

**`/projects/:projectId`** — `ProjectPage.jsx` reads `projectId` via `useParams()` and looks it up in `data/projects.js`. Valid values: `eplms`, `metlife`, `ecommerce`, `urlshortener`, `banking`.

### Adding a New Route

1. Create the component (e.g., `src/components/NewThing/NewThing.jsx`)
2. Import it in `App.jsx`
3. Add `<Route path="new-thing" element={<NewThing />} />` inside the Layout route
4. Add a link in `Sidebar.jsx` pointing to `/new-thing`

---

## 10. Data Files — How Content Is Stored

All interview content is plain JavaScript objects in `src/data/`. There is no database fetch for content — it's all bundled at build time.

### Topic Question Format

Every topic file exports an object with this shape:

```javascript
// src/data/javaCore.js
export const javaCore = {
  title: "Java Core & OOP",
  description: "Fundamentals of Java — OOP principles, JVM, memory management, and exceptions.",
  tags: ["Java", "OOP", "JVM", "Exceptions"],
  questions: [
    {
      id: 1,
      question: "What are the four pillars of OOP?",
      difficulty: "beginner",         // "beginner" | "intermediate" | "advanced"
      asked: true,                    // true = "frequently asked" badge shown
      tags: ["OOP"],
      answer: `Full answer text here.
Can span multiple lines.
Use plain text — Markdown is NOT rendered.`,
      code: `// Optional code block
public class Example { }`,           // omit this field if no code
      followUp: [                     // optional — follow-up Q&A
        {
          question: "Follow-up question?",
          answer: "Follow-up answer."
        }
      ],
      tip: "Pro tip for interview."   // optional — shown in a tip box
    }
  ]
}
```

**To add a question:** Add a new object to the `questions` array. Give it a unique `id` (increment from last one).

**To add a new topic:** Create a new file in `src/data/`, then register it in `TopicPage.jsx`'s `TOPICS` map and add a sidebar link.

### DSA Problem Format

```javascript
// src/data/dsaProblems.js
{
  id: 1,
  title: "Two Sum",
  difficulty: "Easy",
  category: "Arrays",
  tags: ["Array", "Hash Map"],
  description: "Given an array of integers...",
  examples: [
    { input: "nums = [2,7,11,15], target = 9", output: "[0,1]" }
  ],
  approach: "Use a HashMap to store each number and its index...",
  solution: `public int[] twoSum(int[] nums, int target) {
    Map<Integer, Integer> map = new HashMap<>();
    for (int i = 0; i < nums.length; i++) {
        int complement = target - nums[i];
        if (map.containsKey(complement)) return new int[]{map.get(complement), i};
        map.put(nums[i], i);
    }
    return new int[]{};
}`,
  timeComplexity: "O(n)",
  spaceComplexity: "O(n)"
}
```

### Project Format

```javascript
// src/data/projects.js
export const projects = {
  eplms: {
    id: "eplms",
    name: "EPLMS — Enterprise Permit & License Management System",
    period: "Jan 2023 – Present",
    tagline: "Kafka-powered permit lifecycle system for Adani Groups",
    techStack: ["Spring Boot", "Kafka", "PostgreSQL", "Redis", "Docker", "Azure"],
    overview: "...",
    architecture: "...",
    challenges: [
      { problem: "Problem description", solution: "How it was solved" }
    ],
    learnings: ["Learning 1", "Learning 2"],
    tips: "Interview tips for this project"
  }
}
```

### Roadmap Format

```javascript
// src/data/roadmap.js
export const roadmap = {
  weeks: [
    {
      week: 1,
      title: "Java Foundations",
      theme: "Get the basics solid",
      days: [
        {
          day: 1,
          date: "Day 1",
          topics: ["Java Core OOP", "JVM Memory"],
          revision: [],
          mock: false,
          duration: "2.5h"
        }
      ]
    }
  ]
}
```

---

## 11. Components — Every One Explained

### Layout Components

#### `Layout.jsx`
The master wrapper rendered for every route. Contains:
- `Sidebar` (left, fixed on desktop, overlay drawer on mobile)
- `Header` (top bar)
- `<Outlet />` — React Router placeholder where the current route's component renders

Mobile sidebar: controlled by `sidebarOpen` state. Toggled by hamburger button in Header.

#### `Header.jsx`
Top bar. Contains:
- Hamburger button (mobile only, toggles sidebar)
- App logo / title
- Search bar (hidden on xs, visible sm+) — searches across all topics; not yet wired to navigate
- Streak counter (flame icon + number, from `useProgress()`)
- Date display
- Auth button: "Sign In" or user avatar + "Sign Out"

The user's display name comes from `user.displayName` (Google account name).

#### `Sidebar.jsx`
Left navigation. Contains collapsible sections:
- Dashboard, 30-Day Roadmap, Analytics, Revision Scheduler
- **Java Topics** (Java Core, Java 8, Multithreading, Collections)
- **Backend & Spring** (Spring Boot, Microservices, Kafka, Hibernate, SQL)
- **Security & Patterns** (Spring Security, Design Patterns, SSO/SAML)
- **Tools & Infrastructure** (Docker, Testing, Azure)
- **Practice** (Mock Interview, System Design, DSA, Flash Cards)
- **Projects** (EPLMS, MetLife, and sample projects)
- **Interview Prep** (HR Questions, Company Prep, STAR Builder)

Section expand/collapse controlled by `openSections` state (object, key = section name, value = boolean).

Active link: uses `NavLink` from React Router; `isActive` prop applies `border-l-2 border-blue-500` styling.

---

### Page Components

#### `Dashboard.jsx`
Home page. Uses `useProgress()` to get `streak`, `completed`, `getCompletionPercent`.

**Sections:**
1. **Greeting** — "Good Morning/Afternoon/Evening, Randhir"
2. **Stat cards** — Streak, Total Completed, Days in Prep, Readiness %
3. **Readiness bar** — average completion % across all topics
4. **Topic cards** — 8 topic cards with completion % and link
5. **Weak Areas** — topics with < 40% completion
6. **Today's Focus** — curated daily task list

---

#### `TopicPage.jsx`
Generic page for all 15 topic routes. Reads `:topicId` from URL params.

**Internal TOPICS map:** maps `topicId` string → `{ data, questionIds }`. `questionIds` is an array of strings like `"java-core_1"` used for completion tracking.

**Features:**
- Search bar filters questions by text
- Difficulty filter dropdown (All, Beginner, Intermediate, Advanced)
- Completion progress bar for that topic
- Renders `<QuestionCard />` for each matching question

---

#### `QuestionCard.jsx` (reusable)
The most-used component. Used in TopicPage.

**Props:**
```javascript
{
  q: { id, question, difficulty, tags, answer, code, followUp, tip, asked },
  topicId: "java-core",  // used to compute the storage ID: "java-core_1"
  index: 0               // 1-based display index
}
```

**Behavior:**
- Click header → expand/collapse
- 3 tabs: **Answer**, **Code** (hidden if `q.code` not set), **Follow-ups** (hidden if `q.followUp` not set)
- **Bookmark** icon (top-right) → calls `bookmark(id)` from ProgressContext
- **Mark Done** button → calls `complete(id)` from ProgressContext
- Green left border + checkmark when completed

---

#### `CompanyPrep.jsx`
Shows company cards + their Q&A. All data is embedded directly in the component file (not in `src/data/`) because it's company-specific content with detailed answers.

**Company array order** (as of last update): TCS, Cognizant, Capgemini, Infosys, Product Companies, Startups.

Each company object:
```javascript
{
  id: 'tcs',
  name: 'TCS',
  type: 'Service',       // shown as badge
  difficulty: 'Medium',
  focus: 'Fundamentals, Java basics, SQL, Spring Boot basics',
  style: 'Verbal description of interview process',
  questions: [{ question, answer }],
  tip: 'Company-specific tip shown at bottom',
  color: 'border-blue-700'  // left border color class
}
```

To add a new company: add a new object to the `companies` array inside `CompanyPrep.jsx`.

To reorder companies: reorder the array elements.

---

#### `MockInterview.jsx`
Timed interview simulator.

**States:**
1. **Setup** — choose difficulty, question count
2. **Interview** — shows one question at a time, 2-min countdown timer, "Show Answer" button
3. **Assess** — Good / Okay / Bad buttons after seeing answer
4. **Results** — score %, review all questions with answers

Timer: `setInterval` every second. Clears on component unmount (`useEffect` cleanup).

Questions are randomly sampled from all topic data files.

---

#### `ProjectPage.jsx`
Reads `:projectId` from URL → looks up in `data/projects.js`.

**Sections rendered:**
- Header (name, period, tagline, tech stack badges)
- 2-Minute Pitch (memorized opener for HR)
- Key Highlights
- Architecture Overview
- Technical Deep Dive (classes, APIs, patterns)
- Challenges & Solutions
- Learnings

---

#### `SystemDesign.jsx`
8 embedded design problems (data is inside the component). Each expandable card has tabs: HLD, LLD, Scaling Decisions, Trade-offs.

---

#### `HRQuestions.jsx`
Tabbed Q&A. 6 tabs, each a section: Introduction, Why Switch, Career Gap, Under Pressure, Behavioral, Salary. Data embedded in the component.

---

#### `DSAProblems.jsx`
Reads from `data/dsaProblems.js`. Category filter (Arrays, Trees, DP, etc.). Each problem shows description, approach, and solution code block.

---

#### `FlashCards.jsx`
CSS flip animation on click (3D transform). Cards have front (question) and back (answer). "Know" / "Don't Know" tracking per session. Filter by topic tag. Shuffle button.

---

#### `STARBuilder.jsx`
Form to create STAR stories (Situation, Task, Action, Result). All stories saved to `localStorage` under key `prep_star_stories`. Edit, delete, view existing stories.

---

#### `Roadmap.jsx`
Reads from `data/roadmap.js`. Week tabs at top. Each week shows days. Each day is a card: topics, revision items, duration, mock flag. Checkbox marks day done (stored in localStorage).

---

#### `RevisionScheduler.jsx`
Schedule a topic for revision after N days. Upcoming revisions sorted by due date. Mark done removes from list. Persisted in localStorage.

---

#### `Analytics.jsx`
Progress visualization. Uses `getCompletionPercent()` from ProgressContext for each topic. Renders:
- Per-topic progress bars (color-coded by % level)
- Study days since `startDate`
- Streak display
- Strong areas (≥ 70%) and Weak areas (< 40%)
- Readiness badge: "Interview Ready" / "Good Progress" / "Building Up"

---

## 12. Styling Guide

### Dark Mode

Dark mode is always on. `index.html` has `class="dark"` on the `<html>` tag. Tailwind's `darkMode: 'class'` in `tailwind.config.js` enables this. To add a light mode toggle, you'd remove the `dark` class from `<html>` and add a button that toggles it.

### Color Palette in Use

| Purpose | Classes |
|---|---|
| Page background | `bg-gray-950` |
| Card background | `bg-gray-900` |
| Border | `border-gray-800` |
| Primary text | `text-white` |
| Secondary text | `text-gray-400` |
| Muted text | `text-gray-500` |
| Primary button | `bg-blue-600 hover:bg-blue-700` |
| Success / Complete | `text-green-400`, `bg-green-900/30` |
| Warning / Streak | `text-orange-400` |
| Danger | `text-red-400` |
| Info / Tags | `bg-blue-900/30 text-blue-300` |
| Custom brand blues | `brand-500`, `brand-600`, `brand-700` (defined in `tailwind.config.js`) |

### Custom CSS Classes (defined in `src/index.css`)

```css
.card              /* gray-900 bg, gray-800 border, rounded-xl, p-5 */
.btn-primary       /* blue-600 bg, white text, hover darker */
.code-block        /* gray-950 bg, green-300 text, monospace, rounded */
.sidebar-link      /* flex items-center, hover bg-gray-800, active border-l-blue-500 */
.tag               /* small badge: bg-gray-800, text-gray-300, rounded-full, px-2 py-0.5 */
.diff-badge        /* difficulty badge: green=beginner, yellow=intermediate, red=advanced */
```

### Custom Animations

```javascript
// tailwind.config.js
animation: {
  'fade-in': 'fadeIn 0.3s ease-in-out',
  'slide-in': 'slideIn 0.3s ease-in-out',
}
```

Use as: `className="animate-fade-in"` or `className="animate-slide-in"`.

---

## 13. Build System

### Vite Config

```javascript
// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/Interview-Prep/',
})
```

**`base: '/Interview-Prep/'`** — This is critical. It makes Vite prefix all asset paths with `/Interview-Prep/`. Without it, the app loads at `https://randhirrkumar.github.io/Interview-Prep/` but tries to fetch assets from `https://randhirrkumar.github.io/assets/...` → 404. **If you fork this repo and deploy to a different path, change this value.**

### npm Scripts

| Script | Command | Purpose |
|---|---|---|
| `npm run dev` | `vite` | Dev server at localhost:5173, hot reload |
| `npm run build` | `vite build` | Production build → `dist/` |
| `npm run preview` | `vite preview` | Serve `dist/` locally at localhost:4173 |

### Build Output

```
dist/
├── index.html                 # 0.77 kB
├── assets/
│   ├── index-[hash].js        # ~1.3 MB (unminified), ~378 KB gzipped
│   └── index-[hash].css       # ~35 KB, ~6 KB gzipped
```

The large JS bundle is normal — all 215+ Q&A and 100+ DSA solutions are bundled. The warning about "chunks larger than 500 kB" can be resolved with code splitting if needed in the future.

### PostCSS Config

```javascript
// postcss.config.js
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

This is boilerplate required by Tailwind. Autoprefixer adds `-webkit-`, `-moz-` etc. vendor prefixes automatically.

---

## 14. Deployment — GitHub Pages & GitHub Actions

### How Deployment Works

Every push to the `main` branch automatically triggers GitHub Actions which:
1. Checks out the code
2. Installs Node 20
3. Runs `npm ci` (clean install — faster than `npm install` in CI)
4. Runs `npm run build`
5. Uploads `dist/` as a GitHub Pages artifact
6. Deploys it live

**Total time:** ~2-3 minutes from push to live.

### GitHub Actions Workflow File

```yaml
# .github/workflows/deploy.yml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: true   # if you push twice quickly, cancels the first deploy

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - name: Install dependencies
        run: npm ci
      - name: Build
        run: npm run build
      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: dist

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

### One-Time GitHub Pages Setup (repo settings)

1. Go to repo on GitHub → **Settings → Pages**
2. Under **Source**, select **"GitHub Actions"** (not "Deploy from a branch")
3. Save. The workflow will handle everything from then on.

### Manual Deploy (if needed)

If GitHub Actions is unavailable, you can deploy manually:

```bash
npm run build
# Then push dist/ to the gh-pages branch manually, or use a tool like gh-pages npm package
```

### Deploying to a Different Host

**Vercel:**
```bash
npm install -g vercel
vercel --prod
# Set VITE_BASE to "/" in Vercel env vars and update vite.config.js base accordingly
```

**Netlify:**
- Connect repo, set build command: `npm run build`, publish directory: `dist`
- Add `_redirects` file in `public/`: `/* /index.html 200` (for client-side routing)
- Change `base` in `vite.config.js` to `'/'`

---

## 15. LocalStorage — Keys & Usage

Unauthenticated users' data is stored in `localStorage`. All keys are defined in `src/utils/storage.js`:

| Key | STORAGE_KEYS constant | What it stores |
|---|---|---|
| `prep_streak` | `STREAK` | `number` — current streak count |
| `prep_last_study_date` | `LAST_STUDY_DATE` | `string` — `new Date().toDateString()` |
| `prep_completed` | `COMPLETED` | `string[]` — completed item IDs |
| `prep_bookmarks` | `BOOKMARKS` | `string[]` — bookmarked item IDs |
| `prep_notes` | `NOTES` | `object` — `{ [id]: noteText }` |
| `prep_mock_scores` | `MOCK_SCORES` | `any[]` — mock interview score history |
| `prep_start_date` | `START_DATE` | `string` — first study date |
| `prep_last_visit` | `LAST_VISIT` | `string` — last page visit date (legacy) |

### Storage Utility Functions

```javascript
import { getItem, setItem, STORAGE_KEYS } from '../utils/storage'

getItem(STORAGE_KEYS.COMPLETED, [])  // returns [] if key missing or JSON invalid
setItem(STORAGE_KEYS.STREAK, 5)      // JSON.stringify before storing

markCompleted('java-core_1')         // adds to COMPLETED array
isCompleted('java-core_1')           // returns boolean
toggleBookmark('kafka_3')            // adds or removes from BOOKMARKS, returns new array
isBookmarked('kafka_3')              // returns boolean
getNote('java-core_1')               // returns string or ''
saveNote('java-core_1', 'my note')   // merges into NOTES object
```

All functions have try-catch — localStorage errors (quota exceeded, private browsing) are silently swallowed and return the default value.

---

## 16. How To: Common Tasks Cookbook

### Add a new question to an existing topic

1. Open `src/data/{topicFile}.js` (e.g., `javaCore.js`)
2. Add to the `questions` array:
```javascript
{
  id: 41,   // increment from last id
  question: "What is the difference between == and equals() in Java?",
  difficulty: "beginner",
  asked: true,
  tags: ["Java"],
  answer: `== compares references (memory addresses)...`,
  code: `String a = "hello"; String b = "hello"; a == b; // true (string pool)`,
  tip: "Always use equals() for object comparison in interviews."
}
```
3. Save. The question appears automatically in TopicPage.

---

### Add a new topic (e.g., "GraphQL")

1. Create `src/data/graphql.js` with the topic object (follow the format above)
2. In `src/components/Topics/TopicPage.jsx`, add to the `TOPICS` map:
```javascript
'graphql': {
  data: graphQL,
  questionIds: graphQL.questions.map(q => `graphql_${q.id}`)
}
```
3. Add import: `import graphQL from '../../data/graphql'`
4. In `Sidebar.jsx`, add a `<NavLink>` under the appropriate section:
```jsx
<NavLink to="/topics/graphql">GraphQL</NavLink>
```
5. Optionally add it to Dashboard's topic card grid.

---

### Add a new company to CompanyPrep

Open `src/components/Company/CompanyPrep.jsx`. Find the `companies` array and add:

```javascript
{
  id: 'wipro',
  name: 'Wipro',
  type: 'Service',
  difficulty: 'Medium',
  focus: 'Java, Spring, SQL, project discussion',
  style: 'Online test → 2-3 technical rounds → HR.',
  questions: [
    {
      question: 'What is Spring Boot auto-configuration?',
      answer: `Answer here...`
    }
  ],
  tip: 'Wipro focuses on fundamentals and your project experience.',
  color: 'border-purple-700'
}
```

---

### Change the app's base URL (different GitHub username or repo name)

1. `vite.config.js`: change `base: '/Interview-Prep/'` to your repo name (e.g., `base: '/my-prep/'`)
2. Firebase console → **Authentication → Settings → Authorized Domains**: add your new GitHub Pages domain
3. Push to GitHub and make sure Pages is enabled in your repo settings

---

### Add a new page/route

1. Create `src/components/NewFeature/NewFeature.jsx`
2. In `App.jsx`:
```javascript
import NewFeature from './components/NewFeature/NewFeature'
// inside Routes:
<Route path="new-feature" element={<NewFeature />} />
```
3. In `Sidebar.jsx`, add the link in the appropriate section.

---

### Use the progress tracking in a new component

```javascript
import { useProgress } from '../../contexts/ProgressContext'

function MyComponent() {
  const { complete, isCompleted, bookmark, isBookmarked, getCompletionPercent } = useProgress()

  const handleDone = () => complete('my-topic_1')  // ID must be unique across all topics
  const handleBookmark = () => bookmark('my-topic_1')

  return (
    <button onClick={handleDone}>
      {isCompleted('my-topic_1') ? 'Done ✓' : 'Mark Done'}
    </button>
  )
}
```

---

### Change Firestore to a new project

1. Create a new Firebase project (see Section 5)
2. Replace the `firebaseConfig` object in `src/firebase.js` with the new project's config
3. Update Authorized Domains in the new project's Firebase console
4. Set Firestore security rules on the new project (Section 5, Step 5)
5. Old user data will not carry over (different project = different database)

---

### Add email/password authentication

Currently only Google Sign-In is enabled. To add email/password:

1. Firebase console → Authentication → Sign-in method → Enable Email/Password
2. In `AuthContext.jsx`:
```javascript
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth'

const register = (email, password) => createUserWithEmailAndPassword(auth, email, password)
const loginEmail = (email, password) => signInWithEmailAndPassword(auth, email, password)
```
3. Add a login form component that calls these functions
4. Both flow into the same `onAuthStateChanged` listener — no ProgressContext changes needed

---

### Store additional data in Firestore

To add a new field (e.g., `notes`) to the Firestore document:

1. In `ProgressContext.jsx`, add state: `const [notes, setNotes] = useState({})`
2. In `init()`, load it: `setNotes(data.notes || {})`
3. Add a save function:
```javascript
const saveNote = async (id, text) => {
  const newNotes = { ...notes, [id]: text }
  setNotes(newNotes)
  if (user) {
    await saveToFirestore(user.uid, { notes: newNotes })
  } else {
    setItem(STORAGE_KEYS.NOTES, newNotes)
  }
}
```
4. Add `notes`, `saveNote` to the context value
5. Firestore automatically creates the `notes` field on next write (merge: true handles this)

---

## 17. Conventions & Patterns

### File Naming

| Type | Convention | Example |
|---|---|---|
| React components | PascalCase | `QuestionCard.jsx` |
| Data files | camelCase | `javaCore.js`, `dsaProblems.js` |
| Utility files | camelCase | `storage.js` |
| Hook files | camelCase, `use` prefix | `useProgress.js` |

### Component Structure (pattern used throughout)

```jsx
import { useState } from 'react'
import { useProgress } from '../../contexts/ProgressContext'

export default function ComponentName() {
  // 1. Context
  const { complete, isCompleted } = useProgress()

  // 2. Local state
  const [open, setOpen] = useState(false)

  // 3. Derived values
  const isOpen = open && someCondition

  // 4. Handlers
  const handleClick = () => setOpen(!open)

  // 5. JSX
  return (
    <div className="card">
      ...
    </div>
  )
}
```

### Tailwind Class Order Convention

Throughout the project, Tailwind classes follow: `display → flex/grid props → sizing → spacing → borders → colors → typography → interactions → animations`

### ID Naming for Progress Tracking

Always: `{topicKey}_{questionId}` where:
- `topicKey` matches the URL slug (hyphenated, lowercase)
- `questionId` is the numeric `id` field from the data object

Examples: `java-core_1`, `spring-boot_15`, `dsa_42`, `roadmap_day_7`

---

## 18. Known Warnings & Their Meaning

### "CJS build of Vite's Node API is deprecated"

```
The CJS build of Vite's Node API is deprecated.
```

**Cause:** `postcss.config.js` doesn't declare `"type": "module"` in `package.json`.

**Impact:** None — just a warning. Build succeeds.

**Fix (optional):** Add `"type": "module"` to `package.json`. Be aware this makes all `.js` files treated as ESM by Node, which may require updating any CommonJS `require()` calls in config files.

---

### "Some chunks are larger than 500 kB after minification"

```
(!) Some chunks are larger than 500 kB after minification.
```

**Cause:** All Q&A data (215+ questions, 100+ DSA solutions) is bundled into one JS chunk.

**Impact:** Initial load is ~378 KB gzipped — acceptable for most connections.

**Fix (optional):** Use dynamic `import()` to lazy-load topic data files. Example:
```javascript
// In TopicPage.jsx, load data on demand:
const data = await import(`../../data/${topicId}`)
```

---

### LF/CRLF Line Ending Warning on Windows

```
warning: in the working copy of 'src/components/Company/CompanyPrep.jsx', 
LF will be replaced by CRLF the next time Git touches it
```

**Cause:** The file has LF line endings but Git on Windows is configured to auto-convert to CRLF.

**Impact:** None — the file content is identical. Git handles it transparently.

**Fix (optional):** Add a `.gitattributes` file:
```
* text=auto eol=lf
```

---

*Document last updated: 2026-05-30. Covers the project as of commit `62b7e7d`.*
