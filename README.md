# Randhir Kumar — Java Interview Prep Platform 🚀

A complete, personalized interview preparation web application for a Java Backend Developer with 4+ years of experience.

## Features

- **Dashboard** — Daily streak, readiness meter, today's focus, weak areas
- **30-Day Roadmap** — Daily structured plan with topic tracking
- **10+ Topic Sections** — Java Core, Java 8 Streams (30 Q), Spring Boot, Microservices, Kafka, SQL, Hibernate, Azure, SSO/SAML, Security
- **Project Deep Dives** — EPLMS & MetLife with architecture, Kafka flows, challenges
- **Mock Interview** — Timed questions with self-assessment
- **HR Questions** — Career gap handling, behavioral, salary negotiation
- **System Design** — Vehicle tracking, insurance, URL shortener, rate limiter
- **Flash Cards** — 25+ cards for quick revision
- **Company Prep** — TCS, Cognizant, Capgemini, Product companies, Startups

## Tech Stack

- React 18 + Vite 5
- Tailwind CSS
- React Router v6 (HashRouter for GitHub Pages)
- LocalStorage for progress persistence

## Quick Start

```bash
# Requires Node.js 18+
npm install
npm run dev
```

Open http://localhost:5173

## Build for Production

```bash
npm run build
# output in dist/
```

## Deploy to GitHub Pages

```bash
# 1. Create GitHub repo and push code
git init
git add .
git commit -m "Initial interview prep platform"
git remote add origin https://github.com/YOUR_USERNAME/interview-prep.git
git push -u origin main

# 2. Build
npm run build

# 3. Deploy dist/ to GitHub Pages
# Option A: GitHub Actions (recommended)
# Create .github/workflows/deploy.yml

# Option B: Manual using gh-pages
npm install -g gh-pages
gh-pages -d dist
```

### GitHub Actions Auto Deploy

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm install
      - run: npm run build
      - uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

## Deploy to Vercel (Easiest)

```bash
npm install -g vercel
vercel --prod
```

## Deploy to Netlify

Drag and drop the `dist/` folder to Netlify dashboard, or:
```bash
npm install -g netlify-cli
netlify deploy --prod --dir dist
```

## Important Git Commands

```bash
# Initial setup
git init
git add .
git commit -m "feat: complete interview prep platform"

# Push to GitHub
git remote add origin https://github.com/USERNAME/REPO.git
git push -u origin main

# Update after changes
git add .
git commit -m "update: add more questions"
git push

# Check status
git status
git log --oneline -10

# Create a new branch
git checkout -b feature/new-section

# Merge branch
git checkout main
git merge feature/new-section
```

---

*Built for Randhir Kumar — Java Backend Developer, Adani Groups*
