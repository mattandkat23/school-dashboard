# School Dashboard

A simple web dashboard that signs in with Google, reads your Google Classroom
courses, and shows what's due and what's new — all in one place.

This is Phase 1: live schedule/assignment viewing. Homework help (chat about
specific assignments, with textbook context) comes in Phase 2.

## How it works

- You sign in with the Google account that's enrolled in Google Classroom.
- The app asks Google for **read-only** permission to see your courses,
  coursework (assignments), and announcements — it cannot post, edit, or
  change anything in Classroom.
- It shows upcoming assignments sorted by due date (overdue, due today, due
  this week, later) and recent announcements per class.

## One-time setup

You need two things before this runs: a Google OAuth client (so Google will
let the app read Classroom data) and a place to host it (Vercel is the
easiest, and it's free for this kind of app).

### 1. Create a Google Cloud project and OAuth credentials

1. Go to [console.cloud.google.com](https://console.cloud.google.com/) and
   create a new project (any name, e.g. "School Dashboard").
2. In the search bar, find **"Google Classroom API"** and click **Enable**.
3. Go to **APIs & Services → OAuth consent screen**.
   - User type: **External** (unless you have a Google Workspace account —
     then **Internal** also works).
   - Fill in the app name, your email as support contact, and your email
     again as developer contact.
   - Under **Scopes**, add:
     - `.../auth/classroom.courses.readonly`
     - `.../auth/classroom.coursework.me.readonly`
     - `.../auth/classroom.announcements.readonly`
     - `.../auth/classroom.student-submissions.me.readonly`
   - Under **Test users** (while the app is unverified), add the Google
     account(s) that will use this dashboard (e.g. his school Google
     account).
4. Go to **APIs & Services → Credentials → Create Credentials → OAuth
   client ID**.
   - Application type: **Web application**.
   - Authorized redirect URIs — add both of these (fill in your real domain
     once you have it from Vercel in step 2):
     - `http://localhost:3000/api/auth/callback/google` (for local testing)
     - `https://YOUR-VERCEL-DOMAIN/api/auth/callback/google` (for production)
   - Click **Create**. Copy the **Client ID** and **Client Secret** — you'll
     need them in step 3.

> Note: while the OAuth app is in "Testing" status, only the test users you
> listed above can sign in. That's fine for a household app — you don't need
> to submit it for Google's verification review unless you want other
> people outside your family to use it.

### 2. Deploy to Vercel

1. Go to [vercel.com](https://vercel.com/) and sign up/log in with your
   GitHub account.
2. Click **Add New → Project**, and import the `school-dashboard` GitHub
   repo.
3. Before deploying, add these **Environment Variables** in the Vercel
   project settings:
   - `NEXTAUTH_URL` — your Vercel deployment URL, e.g.
     `https://school-dashboard-yourname.vercel.app`
   - `NEXTAUTH_SECRET` — a random secret. Generate one with:
     `openssl rand -base64 32`
   - `GOOGLE_CLIENT_ID` — from step 1
   - `GOOGLE_CLIENT_SECRET` — from step 1
4. Click **Deploy**. Once it's live, copy the real URL Vercel gives you and
   go back to the Google Cloud Console credentials page to make sure the
   redirect URI matches exactly:
   `https://YOUR-REAL-VERCEL-DOMAIN/api/auth/callback/google`

### 3. Try it

Open the deployed URL on his phone or any computer browser, click **Sign in
with Google**, and sign in with the Google account that's enrolled in his
classes. The dashboard should show his courses' upcoming assignments and
recent announcements.

## Local development

```bash
npm install
cp .env.example .env.local   # fill in your real values
npm run dev
```

Visit `http://localhost:3000`.

## What's next

- **Homework help**: a chat panel tied to a specific assignment, using the
  textbooks/workbooks you provide as context.
- **Tracking**: mark assignments done, get reminders for things due soon.
