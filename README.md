# Interview Time Tracker - Comprehensive Requirements & Architecture

## Project Stack
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript 5.9
- **Database**: Supabase (PostgreSQL) - Free tier: 500MB storage, 2GB bandwidth
- **ORM**: Drizzle ORM - Automatic schema generation and type-safe queries
- **UI**: Tailwind CSS + shadcn/ui components
- **Real-time**: Supabase Realtime
- **Date Utilities**: date-fns 4.1
- **Icons**: lucide-react

---

## Application Overview

Interview Time Tracker is a professional, high-performance application for managing interview pipelines. It provides a Kanban board interface, calendar view, metrics tracking, and profile management for recruiters and interviewers to efficiently track interview processes.

### Key Features
- **Kanban Board**: Visual pipeline management with drag-and-drop stage reordering
- **Calendar View**: Week-based timeline with real-time current time indicator
- **Global Navigation**: Left sidebar with main menu and profile sub-menus
- **Global Header**: Sticky header with date/time, page name, and reminder badge
- **Metrics Dashboard**: Dedicated page for interview statistics
- **Profile Management**: Multi-profile support with profile-scoped views
- **Prompt Management**: Saved prompts for interview workflows

---

## Navigation Structure

### Left Navigation Bar (`components/LeftNav.tsx`)
- **Position**: Fixed left sidebar (256px width)
- **Logo**: Professional application logo with clock icon and gradient background
- **Main Menu Items** (in order):
  1. **Calendar** (`/calendar`) - Default landing page
  2. **Interviews** (`/dashboard`) - Kanban board view
  3. **Profiles** (`/profile`) - Profile management
  4. **Metrics** (`/metrics`) - Statistics dashboard
  5. **Prompts** (`/prompts`) - Prompt management

- **Profile Sub-Menu**:
  - Dynamically populated from localStorage profiles
  - Each profile appears as a sub-menu item
  - Clicking navigates to `/profile?profileId={id}`
  - Shows profile name and location/email as subtitle
  - Active profile highlighted with primary color

### Global Header (`components/GlobalHeader.tsx`)
- **Position**: Sticky top header (z-index 40, height 64px)
- **Layout**:
  - **Left**: Current date and time (updates every second)
    - Format: "EEEE, MMMM d, yyyy" (e.g., "Monday, January 15, 2024")
    - Time: "h:mm:ss a" (e.g., "3:45:23 PM")
  - **Center**: Current page name (dynamically based on route)
  - **Right**: Alarm button with reminder count badge
    - Badge shows count (max 99+)
    - Clicking navigates to dashboard
- **Styling**: Dark slate background with backdrop blur, border bottom
- **Hydration Safety**: Uses `mounted` state to prevent server/client mismatches

---

## Core Features - Detailed Implementation

### 1. Kanban Board Management (`app/(dashboard)/dashboard/page.tsx`)

#### Board Structure
- **Boards**: Represent interview stages/steps from `interview_steps` table
- **Cards**: Individual interviews displayed as cards
- **Layout**: Horizontal scrollable flex container
- **Board Width**: Fixed 320px (`w-80`) per board
- **Board Height**: Flexible, fills remaining page height
- **Scrollbar**: Custom styled horizontal scrollbar (visible, 8px height)

#### Board Display Rules
- **All Stages Visible**: All stages are displayed regardless of interview count
- **Sorting**: Stages sorted by `order` field (ascending)
- **Empty State**: Shows "No interviews" message for empty stages
- **Intro Stage**: Always visible (mandatory)

#### Board Styling
- **Gradient Themes**: Rotating color themes per board:
  - Sky (blue), Emerald (green), Amber (yellow), Violet (purple), Rose (pink), Cyan
- **Border Radius**: `rounded-xl` (12px)
- **Shadow**: `shadow-xl shadow-black/40`
- **Backdrop**: `backdrop-blur` for glass effect
- **Header**: Underline border (`border-b border-white/20`)

#### Board Header
- **Left**: Interview count (number only, no "interviews" text)
- **Center**: Stage name (centered, large font)
- **Right**: Reserved for future actions

#### Card Display & Information (`components/InterviewCard.tsx`)
- **Card Content**:
  - **Title**: Company name + Position
  - **Position Link**: Clickable link to job description (`jobLink`)
  - **Interviewer Name**: Displayed prominently
  - **Interviewee Name**: Displayed below interviewer
  - **Edit Button**: Top right corner (pencil icon)
  - **Current Stage Indicator**: Badge showing current stage
  - **Status Buttons**: Three action buttons - `Rescheduled`, `Done`, `Canceled`
- **Card Highlighting**: Cards with interview date matching current day highlighted with primary color border
- **Card Sorting**: All cards sorted by `updated_at DESC, created_at DESC` (most recent first)
- **Card States**:
  - **Done**: Muted colors, reduced opacity
  - **Active**: Full color, normal styling
  - **Scheduled**: Blue accent
  - **Rescheduled**: Amber accent
  - **Canceled**: Red/gray accent

#### Card Interaction
- **Single Click**: Opens interview details in right sidebar (`components/Sidebar.tsx`)
- **Double Click**: Opens full-page edit mode (`/interviews/[id]/edit`)
- **Edit Button**: Opens inline edit modal (`components/CardEditModal.tsx`)
- **Status Buttons**: Immediately updates status and saves to database

#### Pipeline Bar (`components/PipelineBar.tsx`)
- **Location**: Top of dashboard page, above filter bar
- **Purpose**: Display and reorder interview stages
- **Layout**: Horizontal flex container with badges for each stage
- **Stage Reordering**:
  - **Method 1**: Up/Down arrow buttons (always visible)
    - Click to move one position up or down
    - Disabled at first/last position
    - Hover feedback with primary color
  - **Method 2**: Drag and drop
    - Grip icon always visible
    - Cursor changes: `grab` → `grabbing`
    - Visual feedback: dragged item becomes semi-transparent, drop target gets ring
    - Saves order to database via `/api/steps/reorder`
- **Add Stage Button**: Right side of pipeline bar
  - Opens modal for stage name input
  - Validates uniqueness
  - Creates stage with next order number
  - Immediately reflects on board

#### Filter Bar (`components/FilterBar.tsx`)
- **Location**: Below pipeline bar
- **Components**:
  - **Search Input**: Real-time search across company, position, interviewer, interviewee
  - **Date Range**: Weekly/Monthly toggle (segmented control)
  - **Add Interview Button**: Creates new interview card
    - Opens `CreateCardModal`
    - Defaults to "Intro" stage
    - Allows stage selection via dropdown
- **Styling**: Dark theme with high contrast for visibility

---

### 2. Calendar View (`app/(calendar)/calendar/page.tsx`)

#### Overview
- **Default Landing Page**: Root (`/`) redirects to `/calendar`
- **View Type**: Week-based timeline with hourly slots
- **Height**: Fits one screen height (no page scrollbar)
- **Time Slots**: 24 hours, 40px per hour slot

#### Features
- **Week Navigation**:
  - Previous/Next week buttons
  - "Today" button to jump to current week
  - Week starts on Monday
- **Current Time Indicator**:
  - Red vertical line showing current time position
  - Only visible for today's date
  - Updates every minute
  - Position calculated: `hours * TIME_SLOT_HEIGHT + (minutes / 60) * TIME_SLOT_HEIGHT`
- **Date Headers**:
  - Sticky positioning (`sticky top-0 z-20`)
  - Background with backdrop blur
  - Current day highlighted with primary color
  - Selected date highlighted
  - Click to select date
- **Time Column**:
  - Left side, sticky (`sticky left-0 z-20`)
  - Shows hours in 12-hour format (e.g., "9 AM", "2 PM")
  - Header row also sticky
- **Interview Display**:
  - Shows all interviews for each day
  - Color-coded by status:
    - Scheduled: Blue
    - Rescheduled: Amber
    - Done: Green
    - Canceled: Red/Gray
  - Clickable cards navigate to dashboard
- **Real-time Updates**: Interviews refresh every 30 seconds

#### Styling
- Dark slate background
- High contrast for readability
- Smooth transitions
- Responsive layout

---

### 3. Interview Management

#### Creating Interviews (`components/CreateCardModal.tsx`)
- **Trigger**: "Add interview" button in filter bar
- **Required Fields**:
  - Company name
  - Position
  - Interviewer name
  - Interviewee name
  - Interview date
  - Stage selection (defaults to "Intro")
- **Optional Fields**:
  - Job link (URL)
- **Validation**: All required fields must be filled
- **Default Stage**: "Intro" stage selected by default
- **Stage Selection**: Dropdown showing all available stages

#### Editing Interviews
- **Inline Edit** (`components/CardEditModal.tsx`):
  - Quick updates to card fields
  - Opens on card edit button click
  - Saves immediately on confirm
- **Full-Page Edit** (`app/interviews/[id]/edit/page.tsx`):
  - Comprehensive edit form
  - Opens on card double-click
  - Includes all fields and relationships
  - Auto-save functionality (3-second debounce)

#### Status Management
- **Status Types**: `scheduled`, `rescheduled`, `done`, `canceled`
- **Status Buttons**: Quick action buttons on each card
- **Status Updates**: Immediate save to database
- **Visual Feedback**: Color changes based on status

#### Stage Movement
- **Automatic**: When status changes, can move to different stage
- **Manual**: Via sidebar or edit form
- **Reminder Logic**: Cards move to "Reminder" stage 2+ days after interview date

---

### 4. Sidebar Details (`components/Sidebar.tsx`)

#### Purpose
- Right-side slide-in panel for interview details
- Opens on card single-click
- Overlay or push content layout

#### Content
- **Interview Information**:
  - All interview fields (editable)
  - Current stage indicator
  - Status selector
- **Time Tracking**:
  - List of time entries per step
  - Date and duration for each entry
  - Add new time entry
- **Transcriptions**:
  - List of transcriptions per step
  - Add/edit transcriptions
  - Timestamped entries
- **Actions**:
  - Update status
  - Move to different stage
  - Save changes

---

### 5. Profile Management (`app/(profile)/profile/page.tsx`)

#### Features
- **Multiple Profiles**: Support for multiple recruiter/interviewer profiles
- **Profile Storage**: localStorage-based (client-side)
- **Profile Fields**:
  - Name (required)
  - Email (required)
  - Title (optional)
  - Location (optional)
  - Resume upload (Supabase Storage)
  - Personal info (JSONB)
- **Profile Selection**:
  - Profile selector in dashboard
  - Filters interviews by selected profile
  - Active profile stored in localStorage
- **Profile Sub-Menu**: Each profile appears in left nav under "Profiles" section

#### Profile Scoping
- **Dashboard Filtering**: When profile selected, only shows interviews for that profile
- **Metrics Scoping**: Metrics calculated per profile
- **Board Filtering**: Kanban boards show only profile's interviews

---

### 6. Metrics Page (`app/(metrics)/metrics/page.tsx`)

#### Purpose
- Dedicated page for interview statistics
- Accessible via left navigation

#### Metrics Displayed
- **Counts**:
  - Today's interviews
  - This week's interviews
  - This month's interviews
  - Total interviews
  - Completed interviews
- **Calculations**:
  - Pass rate (done / total)
  - Average time per stage
  - Stage distribution
- **Visualizations**:
  - Charts/graphs for trends
  - Status breakdown
  - Stage distribution

---

### 7. Prompts Page (`app/(prompts)/prompts/page.tsx`)

#### Purpose
- Manage saved prompts for interview workflows
- Quick actions and templates

#### Features
- **Prompt Management**:
  - Create new prompts
  - Edit existing prompts
  - Delete prompts
- **Prompt Fields**:
  - Title
  - Content (text area)
- **Storage**: localStorage-based
- **ID Generation**: Uses `crypto.randomUUID()` to prevent hydration issues

---

### 8. Reminder System

#### Reminder Logic
- **Auto-Move**: Cards automatically move to "Reminder" stage 2+ days after interview date
- **Reminder Count**: Calculated in real-time
- **Badge Display**: Shows count in global header alarm button
- **Badge Update**: Refreshes every 30 seconds
- **Click Action**: Clicking alarm button navigates to dashboard

#### Reminder Board
- **Stage**: Dedicated "Reminder" stage in pipeline
- **Purpose**: Follow-up interviews requiring attention
- **Visual**: Highlighted or distinct styling

---

### 9. Search & Filtering

#### Search Feature
- **Scope**: Searches across:
  - Company name
  - Position
  - Interviewer name
  - Interviewee name
- **Implementation**: Client-side filtering on interview array
- **Real-time**: Updates as user types

#### Date Range Filter
- **Weekly View**: Shows interviews for current week
- **Monthly View**: Shows interviews for current month
- **Toggle**: Segmented control in filter bar
- **Calculation**: Uses `dateUtils.ts` helpers

#### Profile Filter
- **Scope**: When profile selected, filters by `profileId`
- **Combined**: Works with search and date range filters

---

### 10. Auto-Save (`lib/hooks/useAutoSave.ts`)

#### Implementation
- **Debounce**: 3-second delay after last input
- **Scope**: All edit operations (cards, details, forms)
- **Optimistic Updates**: UI updates immediately
- **Background Sync**: Saves to Supabase in background
- **Error Handling**: Shows error message on failure
- **Draft State**: Stores unsaved changes in localStorage as backup

---

## Database Schema (Detailed)

### Tables

#### `profiles`
```typescript
{
  id: uuid (primary key, auto-generated)
  userId: uuid (foreign key to auth.users)
  name: text (required)
  email: text (required)
  resumeUrl: text (nullable)
  personalInfo: jsonb (nullable) // { title, location, etc. }
  createdAt: timestamp
  updatedAt: timestamp
}
```

#### `interview_steps`
```typescript
{
  id: uuid (primary key, auto-generated)
  name: text (required, unique) // e.g., "Intro", "Recruiter Screen", "HM"
  order: integer (required) // For sorting and reordering
  createdAt: timestamp
}
```

**Default Stages** (auto-created on first load):
1. Intro (order: 1)
2. Recruiter Screen (order: 2)
3. HM (order: 3)
4. Tech Loop (order: 4)
5. CTO (order: 5)
6. CEO (order: 6)
7. Offer (order: 7)
8. Reminder (order: 8)

**Stage Name Correction**: API automatically corrects incorrectly named stages based on order (e.g., "Intro" at order 2 becomes "Recruiter Screen")

#### `interviews`
```typescript
{
  id: uuid (primary key, auto-generated)
  companyName: text (required)
  position: text (required)
  jobLink: text (nullable)
  interviewerName: text (required)
  intervieweeName: text (required)
  interviewDate: date (required) // Date only, no time
  currentStepId: uuid (foreign key to interview_steps, required)
  status: enum (required, default: "scheduled")
    - "scheduled"
    - "rescheduled"
    - "done"
    - "canceled"
  profileId: uuid (foreign key to profiles, nullable)
  createdAt: timestamp
  updatedAt: timestamp
  lastEditedAt: timestamp // For sorting (most recent first)
}
```

#### `time_tracking`
```typescript
{
  id: uuid (primary key, auto-generated)
  interviewId: uuid (foreign key to interviews, required)
  stepId: uuid (foreign key to interview_steps, required)
  trackedDate: date (required)
  durationMinutes: integer (nullable)
  createdAt: timestamp
}
```

#### `transcriptions`
```typescript
{
  id: uuid (primary key, auto-generated)
  interviewId: uuid (foreign key to interviews, required)
  stepId: uuid (foreign key to interview_steps, required)
  content: text (required)
  createdAt: timestamp
  updatedAt: timestamp
}
```

#### `tech_interviews`
```typescript
{
  id: uuid (primary key, auto-generated)
  interviewId: uuid (foreign key to interviews, required)
  interviewDate: date (required)
  interviewerName: text (required)
  notes: text (nullable)
  createdAt: timestamp
}
```

### Indexes (Performance)
- `interviews.interview_date` - For date filtering
- `interviews.current_step_id` - For board queries
- `interviews.status` - For status filtering
- `interviews.updated_at` - For sorting
- Composite: `(current_step_id, interview_date, updated_at)` - For board queries

---

## API Routes

### `/api/interviews` (GET)
- **Purpose**: Fetch all interviews with steps and metrics
- **Returns**:
  - `interviewsByStep`: Record of step ID to interview array
  - `steps`: Array of all interview steps
  - `reminderCount`: Count of interviews in reminder stage
  - `metrics`: Statistics object
- **Features**:
  - Auto-creates default stages if missing
  - Corrects incorrectly named stages
  - Calculates metrics in-memory
  - Batches database queries

### `/api/interviews` (POST)
- **Purpose**: Create new interview
- **Body**: Interview data (companyName, position, etc.)
- **Returns**: Created interview object

### `/api/interviews/[id]` (GET)
- **Purpose**: Fetch single interview with details
- **Returns**: Interview with time tracking and transcriptions

### `/api/interviews/[id]` (PUT)
- **Purpose**: Update interview
- **Body**: Partial interview data
- **Returns**: Updated interview object

### `/api/interviews/create` (POST)
- **Purpose**: Create interview with validation
- **Body**: Interview data
- **Returns**: Created interview

### `/api/steps` (GET)
- **Purpose**: Fetch all interview steps
- **Returns**: Array of steps sorted by order

### `/api/steps` (POST)
- **Purpose**: Create new interview step
- **Body**: `{ name: string }`
- **Returns**: Created step

### `/api/steps/reorder` (POST)
- **Purpose**: Reorder interview steps
- **Body**: `{ steps: Array<{ id: string, order: number }> }`
- **Returns**: Success message
- **Implementation**: Updates order for all provided steps

### `/api/time-tracking` (GET)
- **Purpose**: Fetch time tracking entries
- **Query Params**: `interviewId`, `stepId`
- **Returns**: Array of time tracking entries

### `/api/time-tracking` (POST)
- **Purpose**: Create time tracking entry
- **Body**: Time tracking data
- **Returns**: Created entry

### `/api/transcriptions` (GET)
- **Purpose**: Fetch transcriptions
- **Query Params**: `interviewId`, `stepId`
- **Returns**: Array of transcriptions

### `/api/transcriptions` (POST)
- **Purpose**: Create transcription
- **Body**: Transcription data
- **Returns**: Created transcription

### `/api/search` (GET)
- **Purpose**: Search interviews
- **Query Params**: `q` (search query)
- **Returns**: Filtered interviews

---

## Component Architecture

### Page Components
```
app/
├── page.tsx                          # Root redirect to /calendar
├── layout.tsx                         # Root layout with LeftNav and GlobalHeader
├── (calendar)/
│   └── calendar/
│       └── page.tsx                   # Calendar view (default landing)
├── (dashboard)/
│   ├── layout.tsx                     # Dashboard layout
│   └── dashboard/
│       └── page.tsx                    # Kanban board page
├── (profile)/
│   └── profile/
│       └── page.tsx                    # Profile management
├── (metrics)/
│   └── metrics/
│       └── page.tsx                    # Metrics dashboard
├── (prompts)/
│   └── prompts/
│       └── page.tsx                    # Prompt management
└── interviews/
    └── [id]/
        └── edit/
            └── page.tsx                # Full-page edit mode
```

### Shared Components
```
components/
├── ui/                                # shadcn/ui components
│   ├── button.tsx
│   ├── card.tsx
│   ├── input.tsx
│   ├── select.tsx
│   ├── textarea.tsx
│   ├── label.tsx
│   └── badge.tsx
├── LeftNav.tsx                        # Left sidebar navigation
├── Logo.tsx                           # Application logo
├── GlobalHeader.tsx                   # Sticky global header
├── GlobalHeaderProvider.tsx            # Client wrapper for GlobalHeader
├── PipelineBar.tsx                    # Pipeline stage bar with reordering
├── FilterBar.tsx                      # Search and filter controls
├── KanbanBoard.tsx                    # Kanban board container
├── InterviewCard.tsx                 # Individual interview card
├── CardEditModal.tsx                  # Inline card edit modal
├── CreateCardModal.tsx                # Create new interview modal
├── Sidebar.tsx                        # Right sidebar details
├── ProfileSelector.tsx                # Profile selection dropdown
└── MetricsBar.tsx                     # Metrics display (legacy, moved to /metrics)
```

### Library Code
```
lib/
├── db/
│   ├── schema.ts                      # Drizzle schema definitions
│   ├── index.ts                       # Database connection
│   ├── queries.ts                     # Read operations
│   ├── mutations.ts                   # Write operations
│   └── seed.ts                        # Database seeding
├── supabase/
│   ├── client.ts                      # Browser Supabase client
│   └── server.ts                      # Server Supabase client
├── hooks/
│   ├── useAutoSave.ts                 # Auto-save hook
│   └── useReminderCount.ts            # Real-time reminder count
├── types/
│   └── profile.ts                     # Profile type definitions
└── utils/
    ├── cn.ts                          # Class name utility (tailwind-merge)
    └── dateUtils.ts                   # Date formatting and calculations
```

---

## UI/UX Design System

### Design Principles
- **Clean & Professional**: Minimal, modern interface
- **Beautiful**: Polished visual design with proper spacing, typography
- **Responsive**: Works on desktop (primary) and tablet
- **Dark Mode Optimized**: All components use high-contrast colors for excellent readability
- **Color Accessibility**: Text colors carefully selected for visibility against dark backgrounds
- **Performance-First**: Optimized for low latency and high performance

### Color System

#### Background Colors
- **Page Background**: `bg-slate-950` (dark slate)
- **Card Background**: `bg-slate-900/60` (semi-transparent dark)
- **Input Background**: `bg-slate-900/80` (darker for contrast)
- **Header Background**: `bg-slate-950/95` with `backdrop-blur-sm`

#### Text Colors
- **Primary Text**: `text-slate-100` (light gray)
- **Secondary Text**: `text-slate-300` (medium gray)
- **Muted Text**: `text-slate-400` (darker gray)
- **Placeholder**: `text-slate-500` (visible but muted)

#### Border Colors
- **Default Border**: `border-white/10` (subtle white)
- **Input Border**: `border-slate-700/50` (visible but not harsh)
- **Focus Border**: `border-primary` or `border-slate-600`

#### Primary Color
- **Primary**: Blue accent color (configurable via Tailwind)
- **Primary Hover**: Slightly darker shade
- **Primary Background**: `bg-primary/15` for active states

#### Status Colors
- **Scheduled**: Blue (`bg-blue-500/20 border-blue-500/50`)
- **Rescheduled**: Amber (`bg-amber-500/20 border-amber-500/50`)
- **Done**: Green (`bg-green-500/20 border-green-500/50`)
- **Canceled**: Red/Gray (`bg-red-500/20 border-red-500/50`)

### Typography
- **Font Family**: Inter (via Next.js font optimization)
- **Headings**: `font-semibold` or `font-bold`
- **Body**: `font-medium` or `font-normal`
- **Small Text**: `text-xs` or `text-[11px]`
- **Uppercase Labels**: `uppercase tracking-[0.18em]` for section headers

### Spacing
- **Container Padding**: `px-6 py-8` for main content
- **Component Gap**: `gap-2`, `gap-4`, `gap-6` depending on context
- **Card Padding**: `p-4` or `p-6`
- **Input Padding**: `px-3 py-2`

### Border Radius
- **Small**: `rounded-lg` (8px)
- **Medium**: `rounded-xl` (12px)
- **Large**: `rounded-2xl` (16px)
- **Full**: `rounded-full` for badges and pills

### Shadows
- **Card Shadow**: `shadow-xl shadow-black/40`
- **Header Shadow**: `shadow-sm` for subtle elevation

### Transitions
- **Default**: `transition-colors` for color changes
- **Smooth**: `transition-all` for multiple properties
- **Duration**: Default Tailwind timing (150ms)

### Scrollbars
- **Custom Styling**: `.styled-scrollbar` class
- **Webkit**: 8px width/height, rounded, semi-transparent
- **Firefox**: `scrollbar-width: thin`, custom colors
- **Visibility**: Always visible for horizontal scrollbars

---

## Performance Optimizations

### Database
- **Indexes**: Strategic indexes on frequently queried columns
- **Composite Indexes**: For complex queries (step + date + updated_at)
- **Batch Operations**: Group multiple updates into single transaction
- **Query Optimization**: Use `SELECT` only needed columns

### Frontend
- **React.memo**: Memoize card components to prevent unnecessary re-renders
- **useMemo**: Cache computed values (filtered interviews, metrics)
- **useCallback**: Memoize event handlers
- **Code Splitting**: Next.js automatic code splitting
- **Image Optimization**: Next.js Image component (if used)

### API
- **Consolidated Endpoints**: Single endpoint for board data
- **In-Memory Calculations**: Metrics calculated client-side from fetched data
- **Caching**: Supabase edge cache for read-heavy operations (60s TTL)
- **Debouncing**: Auto-save debounced to 3 seconds

### Real-time
- **Selective Subscriptions**: Only subscribe when needed
- **Lightweight Updates**: Reminder count updates every 30 seconds
- **Connection Management**: Clean up subscriptions on unmount

---

## State Management

### Server State
- **Supabase Queries**: Via RSC (React Server Components) for initial load
- **Client Hooks**: `useEffect` for client-side data fetching
- **Real-time**: Supabase Realtime subscriptions for live updates

### Client State
- **Component State**: `useState` for local UI state
- **URL Params**: For shareable filters (search, date range)
- **localStorage**: For profiles and active profile selection
- **No Global State Library**: Avoids unnecessary complexity

### State Patterns
- **Optimistic Updates**: Update UI immediately, sync in background
- **Error Handling**: Show error messages, revert on failure
- **Loading States**: Skeleton loaders or loading indicators

---

## Error Handling

### API Errors
- **Response Validation**: Check `response.ok` and content-type
- **Error Messages**: User-friendly error messages
- **Fallback UI**: Show error state, allow retry

### Hydration Errors
- **Prevention**: Initialize dynamic values (dates) as `null`, update in `useEffect`
- **Mounted State**: Use `mounted` flag to conditionally render dynamic content
- **ID Generation**: Use `crypto.randomUUID()` instead of `Date.now().toString()`

### Database Errors
- **Validation**: Validate data before database operations
- **Unique Constraints**: Handle duplicate stage names gracefully
- **Foreign Keys**: Ensure referenced records exist

---

## Security Considerations

### Authentication
- **Supabase Auth**: User authentication via Supabase
- **Row Level Security**: Database-level access control
- **API Routes**: Server-side validation

### Data Validation
- **Input Sanitization**: Validate and sanitize user inputs
- **Type Safety**: TypeScript for compile-time checks
- **Runtime Validation**: Validate API request bodies

### Storage
- **Resume Uploads**: Supabase Storage with signed URLs
- **File Validation**: Validate file types and sizes
- **Access Control**: Restrict file access to authorized users

---

## Testing Strategy

### Unit Tests
- **Utils**: Test date utilities, class name utilities
- **Hooks**: Test custom hooks (auto-save, reminder count)

### Integration Tests
- **API Routes**: Test API endpoints with mock data
- **Database**: Test database queries and mutations

### E2E Tests
- **User Flows**: Test complete user workflows
- **Navigation**: Test navigation between pages
- **Interactions**: Test drag-and-drop, form submissions

---

## Deployment

### Environment Variables
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
DATABASE_URL=postgresql://user:password@host:port/database
```

### Build Process
```bash
npm run build        # Build production bundle
npm run start        # Start production server
```

### Database Migrations
```bash
npm run db:generate  # Generate migrations from schema
npm run db:migrate   # Run migrations (production)
```

### Supabase Setup
1. Create Supabase project
2. Get project URL and anon key
3. Get database connection string
4. Run migrations
5. Seed default data (optional)

---

## Future Enhancements

### Potential Features
- **Email Notifications**: Send reminders via email
- **Calendar Integration**: Sync with Google Calendar, Outlook
- **Export**: Export interviews to CSV, PDF
- **Analytics**: Advanced metrics and reporting
- **Collaboration**: Multi-user support with permissions
- **Mobile App**: React Native mobile application
- **AI Integration**: AI-powered interview insights
- **Templates**: Interview question templates
- **Video Integration**: Record and store interview videos

### Performance Improvements
- **Virtual Scrolling**: For large interview lists
- **Infinite Scroll**: Load interviews in batches
- **Service Worker**: Offline support
- **CDN**: Static asset optimization

---

## Maintenance

### Code Quality
- **ESLint**: Code linting with Next.js config
- **TypeScript**: Strict type checking
- **Prettier**: Code formatting (if configured)

### Documentation
- **Code Comments**: Inline comments for complex logic
- **README**: This comprehensive requirements document
- **API Documentation**: JSDoc comments for API routes

### Updates
- **Dependencies**: Regular dependency updates
- **Security Patches**: Apply security updates promptly
- **Feature Requests**: Track in issue tracker

---

## Notes

- All dates stored in UTC, displayed in user's local timezone
- Interview dates are date-only (no time component)
- Reminder logic: `CURRENT_DATE - interview_date >= 2` days
- Most recent sorting: `ORDER BY updated_at DESC, created_at DESC`
- Tech interviews are separate records linked to main interview card
- Profile data stored in localStorage (client-side only)
- Hydration safety: All dynamic content initialized as `null`, updated in `useEffect`
- Scrollbar styling: Custom CSS for Webkit and Firefox browsers
- Stage reordering: Two methods (arrows and drag-drop) for better UX

---

## Version History

### Current Version: 1.0.0
- Initial release with all core features
- Kanban board with drag-and-drop stage reordering
- Calendar view with real-time indicator
- Global navigation and header
- Profile management
- Metrics dashboard
- Prompt management
- Auto-save functionality
- Reminder system

---

**Last Updated**: January 2025
**Repository**: https://github.com/byteman0125/time-tracker
