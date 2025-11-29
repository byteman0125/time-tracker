# Interview Time Tracker - Requirements & Architecture

## Project Stack
- **Framework**: Next.js (App Router)
- **Language**: TypeScript
- **Database**: Supabase (PostgreSQL) - Free tier: 500MB storage, 2GB bandwidth
- **ORM**: Drizzle ORM - Automatic schema generation and type-safe queries
- **UI**: Tailwind CSS + shadcn/ui components
- **Real-time**: Supabase Realtime

---

## Core Features

### 1. Kanban Board Management
- **Boards**: Represent interview stages/steps
- **Cards**: Represent individual interviews
- **Default Board**: Only "Intro" board can be created initially
- **Card Position**: Cards are NOT draggable - position is determined by sort order (most recent first)
- **Card Movement**: Cards move between boards via status updates in navbar, not drag-and-drop
- **Dynamic Steps**: Create additional stages from the dashboard Step Manager; boards render every step automatically
- **Profile-Aware Views**: Board content can be filtered per active profile so each recruiter/interviewer only sees their pipeline
- **Pipeline Overview**: At the top of the Interviews page, show the full default pipeline (Intro → Recruiter Screen → Hiring Manager → Technical Loop → CTO → CEO → Offer → Reminder) as badges, kept in sync with the `interview_steps` table

### 2. Card Display & Information
- **Card Content**:
  - Title: Company name + Position (Position is clickable link to job description)
  - Interviewer name
  - Interviewee name
  - Edit button (top right corner)
  - Current stage indicator
  - Three action buttons: `Rescheduled`, `Done`, `Canceled`
- **Card Highlighting**: Cards with interview date matching current day are highlighted
- **Card Sorting**: All cards sorted by most recently updated/created (descending)
- **Card States**: 
  - "Done" cards display with light/muted color
  - Active cards display normally

### 3. Card Interaction
- **Single Click**: Opens interview details in right sidebar/navbar
- **Double Click**: Opens full-page edit mode (not sidebar)
- **Edit Button**: Opens inline edit mode on card (for quick updates, not full details)

### 4. Right Sidebar/Navbar Details
- **Time Tracking Line**: Shows date + step for each time entry
- **Interview Transcription**: Can add transcription for each step
- **Status Update**: Can update interview status, scheduled date, and interviewer
- **Move Card**: Can move card to another step via status update

### 5. Card Creation
- **New Card Input**: Must input interview day/date when creating
- **Default Board**: New cards created on "Intro" board

### 6. View Modes
- **Weekly View**: Display cards grouped by week
- **Monthly View**: Display cards grouped by month
- **Toggle**: Switch between weekly/monthly views

### 6.1. Calendar View (Default Landing Page)
- **Timeline View**: Week-based calendar with hourly time slots
- **Current Time Line**: Real-time red indicator showing current time position
- **Interview Display**: Shows all interviews for each day in their respective time slots
- **Week Navigation**: Navigate between weeks with previous/next buttons
- **Today Button**: Quick jump to current week
- **Status Colors**: Color-coded interview cards by status (scheduled, rescheduled, done, canceled)
- **Interactive**: Click on interviews to navigate to dashboard details
- **Real-time Updates**: Current time line updates every minute

### 7. Reminder System
- **Reminder Board**: Dedicated board for follow-ups
- **Auto-Move Logic**: Cards automatically move to reminder board 2+ days after interview date
- **Alarm Badge**: Shows count of reminders (updates in real-time via Supabase Realtime)
- **Badge Location**: Alarm button displays reminder count

### 8. Interview Types
- **Tech Interviews**: Support multiple interviews per position (one card can have multiple interview sessions)

### 9. Filtering & Search
- **Search Feature**: Search across company names, positions, interviewer names
- **Date Range Filter**: Filter cards by date range
- **Real-time Updates**: Filter results update as data changes
- **Add Stage Button**: A single \"Add stage\" button lives in the filter bar; clicking it opens a modal to name a new interview stage, which is then saved to the database and immediately reflected on the board

### 10. Metrics & Statistics
- **Task Bar Badge**: Shows number of active interviews
- **Current Counts**: Display interview numbers for:
  - Current day
  - Current week
  - Current month
- **Metrics Dashboard**: 
  - Pass rate calculation
  - Interview statistics
  - Visual metrics display

### 11. Profile Management
- **Profile Menu**: Accessible from main navigation
- **Profile Information**: 
  - Resume upload/storage
  - Personal information
- **Multiple Profiles**: Maintain several profiles, switch the active profile from the dashboard, and scope boards/metrics per profile
- **Profile Usage**: If profile exists, can reference it when creating/managing interviews (pre-fill interviewer data, etc.)
- **Default Pipeline**: Seeds with the common enterprise flow (Intro → Recruiter Screen → Hiring Manager → Technical Loop → CTO → CEO → Offer → Reminder) so you have best-practice stages immediately

### 12. Prompt Menu
- **Purpose**: Quick actions or saved prompts for interview management
- **Location**: Accessible from main navigation

### 13. Auto-Save
- **Trigger**: Automatically save changes after 3 seconds of inactivity
- **Scope**: Applies to all edit operations (card edits, detail edits, etc.)

---

## Technical Architecture Decisions

### Performance-First Design

#### 1. Database Schema (Supabase)
```
profiles
  - id (uuid, primary key)
  - user_id (uuid, foreign key to auth.users)
  - name (text)
  - email (text)
  - resume_url (text, nullable)
  - personal_info (jsonb, nullable)
  - created_at (timestamp)
  - updated_at (timestamp)

interview_steps
  - id (uuid, primary key)
  - name (text, unique) -- e.g., "Intro", "Tech", "Final", "Reminder"
  - order (integer)
  - created_at (timestamp)

interviews
  - id (uuid, primary key)
  - company_name (text)
  - position (text)
  - job_link (text, nullable)
  - interviewer_name (text)
  - interviewee_name (text)
  - interview_date (date)
  - current_step_id (uuid, foreign key to interview_steps)
  - status (enum: 'scheduled', 'rescheduled', 'done', 'canceled')
  - profile_id (uuid, foreign key to profiles, nullable)
  - created_at (timestamp)
  - updated_at (timestamp)
  - last_edited_at (timestamp) -- for sorting

time_tracking
  - id (uuid, primary key)
  - interview_id (uuid, foreign key to interviews)
  - step_id (uuid, foreign key to interview_steps)
  - tracked_date (date)
  - duration_minutes (integer, nullable)
  - created_at (timestamp)

transcriptions
  - id (uuid, primary key)
  - interview_id (uuid, foreign key to interviews)
  - step_id (uuid, foreign key to interview_steps)
  - content (text)
  - created_at (timestamp)
  - updated_at (timestamp)

tech_interviews
  - id (uuid, primary key)
  - interview_id (uuid, foreign key to interviews)
  - interview_date (date)
  - interviewer_name (text)
  - notes (text, nullable)
  - created_at (timestamp)
```

**Automatic Schema Management (Drizzle ORM)**:
- **Schema Definition**: Define tables in TypeScript using Drizzle schema syntax
- **Auto-Migrations**: Drizzle Kit generates SQL migrations automatically from schema changes
- **Type Safety**: Full TypeScript types generated from database schema
- **Introspection**: Can introspect existing Supabase database and generate Drizzle schema
- **Migration Commands**:
  - `drizzle-kit generate` - Generate migrations from schema changes
  - `drizzle-kit push` - Push schema directly to database (dev)
  - `drizzle-kit migrate` - Run migrations (production)
- **Benefits**: 
  - No manual SQL writing
  - Version-controlled schema changes
  - Type-safe queries with autocomplete
  - Automatic foreign key and index generation

**Performance Optimizations**:
- Indexes on `interview_date`, `current_step_id`, `status`, `updated_at` for fast filtering/sorting
- Composite index on `(current_step_id, interview_date, updated_at)` for board queries
- Use `updated_at` for sorting instead of `created_at` to show most recently active first
- Consolidated API fetches: board endpoint performs a single query for all interviews, computes metrics/reminder counts in-memory, and batches reminder moves to avoid sequential round trips

#### 2. Data Fetching Strategy
- **Server Components**: Use RSC for initial board data (weekly/monthly views)
- **Supabase Edge Cache**: Cache board queries for 60s (read-heavy operations)
- **Client-Side Caching**: React Query or SWR for sidebar details (stale-while-revalidate)
- **Real-time Subscriptions**: 
  - Reminder count badge (lightweight subscription)
  - Card updates (only when board is visible)

#### 3. State Management
- **Server State**: Supabase queries via RSC + client hooks
- **Client State**: 
  - Card edit mode (local component state)
  - Filter/search state (URL params for shareability)
  - Sidebar open/closed (local state)
- **Minimal Re-renders**: Use React.memo for card components, primitive props only

#### 4. Auto-Save Implementation
- **Debounced Updates**: 3-second debounce on all input fields
- **Optimistic Updates**: Update UI immediately, sync to Supabase in background
- **Draft State**: Store unsaved changes in localStorage as backup
- **Batch Updates**: Group multiple field changes into single Supabase update

#### 5. Reminder Logic
- **Database Function**: PostgreSQL function to check and move cards to reminder board
- **Cron Job**: Supabase Edge Function or pg_cron to run daily at midnight
- **Real-time Badge**: Subscribe to reminder count changes via Supabase Realtime

#### 6. Filtering & Search
- **Server-Side Filtering**: For date ranges (efficient database queries)
- **Client-Side Search**: For text search on small datasets (<1000 cards)
- **Hybrid Approach**: Date filter on server, text search on client (filtered results)

#### 7. Metrics Calculation
- **Database Aggregates**: Use SQL COUNT, AVG for pass rate
- **Cached Results**: Store metrics in Redis or Supabase cache (5min TTL)
- **Real-time Updates**: Recalculate on status changes (done/canceled)

#### 8. File Storage
- **Resume Storage**: Supabase Storage bucket (`resumes/`)
- **Direct Upload**: Client-side upload with signed URLs
- **CDN**: Serve via Supabase CDN for fast access

#### 9. Component Architecture
```
app/
  (dashboard)/
    page.tsx                    # Main board view (RSC)
    layout.tsx                  # Board layout
    components/
      BoardView.tsx             # Weekly/Monthly toggle
      KanbanBoard.tsx           # Board container
      InterviewCard.tsx         # Card component (memoized)
      CardEditMode.tsx          # Inline card edit
      Sidebar.tsx               # Right sidebar details
      InterviewDetails.tsx      # Full-page edit (route)
      MetricsBar.tsx            # Stats display
      FilterBar.tsx             # Search + date filter
      ReminderBadge.tsx         # Alarm button with count
  (profile)/
    page.tsx                    # Profile management
    components/
      ProfileForm.tsx
      ResumeUpload.tsx
  (prompts)/
    page.tsx                    # Prompt menu
  lib/
    supabase/
      client.ts                 # Supabase client
      server.ts                 # Supabase server client
      queries.ts                # Optimized queries
      mutations.ts              # Write operations
    hooks/
      useAutoSave.ts            # Auto-save hook
      useReminderCount.ts       # Real-time reminder count
      useInterviewFilters.ts    # Filter logic
    utils/
      dateUtils.ts              # Date formatting/sorting
      cacheUtils.ts             # Cache helpers
```

#### 10. Performance Targets
- **Page Load**: <200ms (RSC + edge cache)
- **Card Render**: <16ms per card (60fps)
- **Filter/Search**: <50ms response time
- **Auto-Save**: <100ms Supabase write latency
- **Real-time Updates**: <500ms badge update latency

---

## UI/UX Requirements

### Design Principles
- **Clean & Professional**: Minimal, modern interface
- **Beautiful**: Polished visual design with proper spacing, typography
- **Responsive**: Works on desktop (primary) and tablet
- **Dark Mode Optimized**: All components use high-contrast colors for excellent readability
- **Color Accessibility**: Text colors are carefully selected for visibility against dark backgrounds

### Component Library
- **shadcn/ui**: Use exclusively for UI components
- **Tailwind CSS**: Styling framework
- **No Radix UI**: Direct components (shadcn uses Radix internally, but we use shadcn wrapper)

### Color System & Visibility
- **Input Fields**: Dark slate backgrounds (`bg-slate-900/80`) with light text (`text-slate-100`) and visible placeholders (`text-slate-500`)
- **Select Dropdowns**: Consistent dark styling with proper contrast
- **Textareas**: Same dark theme with visible text
- **Labels**: Light text (`text-slate-200`) for clear visibility
- **Cards**: Semi-transparent dark backgrounds (`bg-slate-900/60`) with light borders
- **Buttons**: Primary actions use high-contrast colors, outline variants maintain visibility
- **Badges**: Status colors with sufficient opacity and contrast for readability
- **All Components**: Explicit text colors to ensure visibility in dark mode

### Key UI Elements
- **Kanban Columns**: Vertical columns for each step/board
- **Card Styling**: 
  - Highlighted border/background for current day interviews
  - Muted styling for "done" status
  - Hover states for interactivity
- **Sidebar**: Slide-in from right, overlay or push content
- **Metrics Bar**: Top or bottom bar with statistics
- **Filter Bar**: Persistent search + date picker

---

## Update Process

This requirements file serves as the **single source of truth**. When updates are requested:
1. Update this README.md file with new requirements
2. Reference this file when implementing features
3. Maintain version history in git commits

---

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Environment Variables
Create a `.env.local` file in the root directory:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
DATABASE_URL=postgresql://user:password@host:port/database
```

### 3. Set Up Supabase Database
1. Create a new Supabase project at https://supabase.com
2. Get your project URL and anon key from Settings > API
3. Get your database connection string from Settings > Database > Connection string (use the "URI" format)

### 4. Generate and Run Database Migrations
```bash
# Generate migrations from schema
npm run db:generate

# Push schema to database (for development)
npm run db:push

# Or run migrations (for production)
npm run db:migrate
```

### 5. Seed Initial Data
```bash
npm run db:seed
```
This will create the default interview steps: Intro, Tech, Final, and Reminder.

### 6. Run Development Server
```bash
npm run dev
```

The application will be available at http://localhost:3000

**Note**: The root URL (`/`) automatically redirects to `/calendar`, which is the default landing page.

---

## Project Structure

```
├── app/
│   ├── (dashboard)/          # Main dashboard page (Kanban board)
│   ├── (calendar)/          # Calendar page (default landing)
│   │   └── calendar/
│   │       └── page.tsx     # Timeline calendar view
│   ├── (profile)/            # Profile management
│   ├── (prompts)/            # Prompt menu
│   ├── api/                  # API routes
│   ├── interviews/[id]/edit/ # Full-page edit mode
│   ├── page.tsx              # Root redirects to /calendar
│   └── layout.tsx            # Root layout with navigation
├── components/
│   ├── ui/                   # shadcn/ui components
│   ├── InterviewCard.tsx     # Card component
│   ├── KanbanBoard.tsx       # Board container
│   ├── Sidebar.tsx           # Right sidebar details
│   ├── MetricsBar.tsx        # Statistics display
│   ├── FilterBar.tsx         # Search and filters
│   └── Navigation.tsx        # Main navigation
├── lib/
│   ├── db/
│   │   ├── schema.ts         # Drizzle schema definitions
│   │   ├── index.ts          # Database connection
│   │   ├── queries.ts        # Read operations
│   │   ├── mutations.ts      # Write operations
│   │   └── seed.ts           # Database seeding
│   ├── supabase/
│   │   ├── client.ts        # Browser client
│   │   └── server.ts         # Server client
│   ├── hooks/
│   │   ├── useAutoSave.ts    # Auto-save hook
│   │   └── useReminderCount.ts # Real-time reminder count
│   └── utils/
│       ├── cn.ts             # Class name utility
│       └── dateUtils.ts      # Date helpers
└── components/
    └── ui/                   # shadcn/ui components
```

---

## Notes

- All dates stored in UTC, displayed in user's local timezone
- Interview dates are date-only (no time component)
- Reminder logic: `CURRENT_DATE - interview_date >= 2` days
- Most recent sorting: `ORDER BY updated_at DESC, created_at DESC`
- Tech interviews are separate records linked to main interview card

