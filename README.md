# Voting App

A full-featured voting platform built with Next.js, NextAuth, MongoDB, and Tailwind CSS. This app supports user authentication, content submission, voting, admin management, and more.

---

## Features

### 1. User Authentication
- **Sign Up & Login:**
  - Users can register with email/password or sign in with Google or Twitter OAuth.
  - Secure password hashing with bcryptjs.
- **Multi-Factor Authentication (MFA):**
  - Optional MFA setup using TOTP (Google Authenticator compatible).
  - Backup codes for account recovery.
- **Session Management:**
  - JWT-based sessions for secure, stateless authentication.

### 2. User Profile
- **Profile Page:**
  - View and edit user details (name, email, username, profile image).
  - See voting status and admin/whitelist status.

### 3. Content Submission
- **Submit Content:**
  - Authenticated users can submit posts for voting (title, description, optional link).
  - Submissions are reviewed by admins before being published.
- **View Submissions:**
  - Users can view their own submissions and their status.

### 4. Voting System
- **Voting Periods:**
  - Admins can start/stop voting periods.
  - Only one voting period is active at a time.
- **Vote on Posts:**
  - Users can vote on published posts during active voting periods.
  - Each user can vote once per post per period.
- **Sync Votes:**
  - Admins can trigger a sync to recalculate vote counts from the database.

### 5. Results & Announcements
- **Voting Results:**
  - View results for each voting period, including post rankings and vote counts.
- **Announcements:**
  - Admins can post announcements visible to all users.

### 6. Townhall Recordings & Assets
- **Townhall Recordings:**
  - Admins can upload and manage video/audio recordings of townhalls.
  - Users can view and play recordings.
- **Assets:**
  - Admins can upload and manage files/assets for the community.
  - Users can view/download assets.

### 7. Admin Dashboard
- **Tabs for Management:**
  - Announcements, Assets, Posts, Submissions, Recordings, Users.
- **User Management:**
  - View all users, whitelist, promote to admin, or remove users.
  - View user details in a modal.
- **Moderation:**
  - Approve/reject content submissions.
  - Delete posts, assets, announcements, and recordings.

### 8. Security & Best Practices
- **Role-based Access:**
  - Admin-only routes and actions are protected on both client and server.
- **API Routes:**
  - All sensitive actions are performed via secure API routes with session checks.
- **Rate Limiting & Validation:**
  - Input validation and error handling throughout the app.

### 9. UI/UX
- **Modern UI:**
  - Built with Tailwind CSS for a responsive, accessible, and visually appealing interface.
- **Dark Mode:**
  - Default dark theme for all pages.
- **Loading States:**
  - Spinners and disabled buttons during async actions.
- **Notifications:**
  - Success/error messages for user actions.

---

## Getting Started

1. **Install dependencies:**
   ```sh
   npm install
   ```
2. **Set up environment variables:**
   - Copy `.env.example` to `.env.local` and fill in MongoDB, NextAuth, and OAuth credentials.
3. **Run the development server:**
   ```sh
   npm run dev
   ```
4. **Build for production:**
   ```sh
   npm run build
   npm start
   ```

---

## Folder Structure

- `src/app/` — App directory (Next.js routes, layouts, pages, API routes)
- `src/components/` — React components (UI, admin, shared)
- `src/models/` — Mongoose models for MongoDB collections
- `src/lib/` — Utility libraries (MFA, session, MongoDB connection)
- `src/styles/` — Global CSS (Tailwind)
- `src/types/` — TypeScript types

---

## API Endpoints

- `/api/auth/[...nextauth]` — Authentication (NextAuth.js)
- `/api/posts` — CRUD for posts
- `/api/votes` — Voting actions
- `/api/voting-periods` — Manage voting periods
- `/api/voting-results` — Get voting results
- `/api/announcements` — Announcements CRUD
- `/api/assets` — Asset management
- `/api/townhall-recordings` — Recordings management
- `/api/users` — User management
- `/api/content-submissions` — Content submission and moderation
- `/api/sync-votes` — Admin vote sync

---

## Technologies Used
- Next.js (App Router)
- React 19+
- MongoDB & Mongoose
- NextAuth.js
- Tailwind CSS v3
- PostCSS & Autoprefixer
- TypeScript

---

## Contributing
Pull requests are welcome! Please open an issue first to discuss any major changes.

---

## License
MIT
