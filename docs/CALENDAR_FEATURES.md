# Calendar - World-Class Implementation Guide

## 🚀 Overview

The Lumio Calendar is a comprehensive, AI-powered scheduling system with enterprise-grade features including Google Calendar integration, intelligent meeting prep, recurring events, and automated workflows.

## 📅 Core Features

### 1. Multiple Views

#### Month View

- Classic grid layout with events displayed by day
- Quick event creation by clicking on any date
- Visual indicators for event types (color-coded)
- "Today" highlighting
- Event count badges for days with multiple events

#### Week View

- 7-column layout (Sunday-Saturday)
- Hourly time slots (7 AM - 8 PM)
- Drag & drop events between days/times
- Current time indicator (red line)
- Conflict highlighting
- Click any slot to create event

#### Day View

- Single column with full hourly breakdown
- Detailed event cards with attendee info
- Focus time blocks (automatically suggested 9-11 AM)
- Meeting density indicator
- Available slots highlighted
- Quick add from any time slot

#### Agenda View

- Linear list of all upcoming events
- Sortable by date/time
- Quick filters
- Detailed information without grid constraints

### 2. Event Creation & Management

#### Full-Featured Create Modal

- **Basic Info**: Title, description, category
- **Timing**: Date/time pickers with timezone support, duration selector, all-day toggle
- **Attendees**: Add multiple emails, auto-suggest from leads
- **Meeting Details**: Auto-generate video links (Google Meet), custom URLs, location
- **Reminders**: 5/15/30/60 minutes or custom
- **Priority**: Low/Medium/High
- **Linked Records**: Connect to leads and campaigns
- **Recurring Events**: Daily/weekly/monthly patterns with end conditions

#### Event Actions

- **Edit**: Full edit with pre-filled data
- **Reschedule**: Quick time change
- **Duplicate**: Create copy (1 week later by default)
- **Cancel**: Delete with attendee notifications
- **Mark Complete**: Trigger post-meeting workflow
- **Send Reminder**: Manual reminder to attendees
- **Join Meeting**: One-click to video call

### 3. AI-Powered Features

#### Meeting Prep Panel

Automatically generated before each meeting with:

- **Lead Overview**: Name, company, role, lead score, days as lead
- **Recent Activity**: Emails sent/opened, last contact, campaign engagement
- **Talking Points**: AI-suggested based on lead characteristics
  - Score-based approach (high/warm/cold)
  - Industry-specific insights
  - Source-based context (Shopify, HubSpot, LinkedIn)
- **Pain Points**: Identified challenges
- **Suggested Agenda**: Time-allocated meeting structure
- **Previous Notes**: History from past meetings
- **Competitive Intel**: What competitors they might be evaluating

#### Auto-Schedule

- One-click meeting creation from AI suggestions
- Optimal time detection based on:
  - Lead engagement patterns
  - Your availability
  - Timezone differences
  - Historical meeting success rates
- Auto-generates meeting links
- Sends calendar invites automatically
- Updates lead score (+10 for scheduled meeting)

#### Post-Meeting Workflow

Triggered when marking event "Complete":

1. **Meeting Notes**: Capture key points and decisions
2. **AI Summarization**: Auto-generate structured summary
3. **Outcome Tracking**: Positive/Neutral/Negative
4. **Automated Actions**:
   - Schedule follow-up meeting (1 week default)
   - Send thank-you email (SDR template)
   - Create action item tasks
   - Update CRM (if HubSpot/Salesforce connected)
   - Log to lead timeline
   - Increment lead score

### 4. Google Calendar Integration

#### OAuth 2.0 Connection

```javascript
// Navigate to Settings > Integrations
// Click "Connect" on Google Calendar
// Authorize with Google account
// Tokens stored securely with refresh capability
```

#### Bi-Directional Sync

- **To Google**: Push Lumio events to Google Calendar
- **From Google**: Import Google events to Lumio
- **Automatic**: Real-time sync via webhooks
- **Conflict Resolution**: Manual or automatic (Lumio wins/Google wins)

#### Sync Features

- Incremental sync (only changed events)
- Full sync (manual trigger)
- External event tracking (externalId, externalProvider)
- Sync status indicators (synced/pending/failed)
- Last sync timestamp

#### Webhook Support

Google Calendar pushes notifications on changes:

- Event created → Import to Lumio
- Event updated → Update in Lumio
- Event deleted → Remove from Lumio

### 5. Recurring Events

#### Recurrence Patterns

- **Daily**: Every N days
- **Weekly**: Select specific days (Mon, Tue, etc)
- **Monthly**: Day of month or relative (first Monday, etc)
- **Custom**: Advanced patterns

#### End Conditions

- Never (infinite)
- After N occurrences
- By specific date

#### Recurrence Management

- Edit options:
  - This event only
  - This and following events
  - All events in series
- Delete options: Same as edit
- Skip occurrence (create exception)
- Visual indicators for series membership

### 6. Meeting Suggestions

AI-powered meeting recommendations:

- **Hot Leads**: High score leads needing immediate contact
- **Stale Leads**: No recent interaction, schedule check-in
- **Campaign Follow-ups**: After email engagement
- **Shopify Customers**: VIP customers, abandoned carts
- **Scheduled Times**: Optimal based on lead timezone and engagement

## 🎯 User Workflows

### Workflow 1: Schedule Sales Call with Hot Lead

1. **Notification**: Marvin detects hot lead (score 85+)
2. **Suggestion**: Shows in sidebar "Schedule call with John Doe"
3. **Auto-Schedule**: Click "Auto-Schedule" button
4. **Event Created**:
   - Title: "Sales Call with John Doe"
   - Time: Optimal slot (2 PM tomorrow)
   - Duration: 30 minutes
   - Meeting URL: Auto-generated
   - Attendees: john@example.com
   - Reminder: 15 minutes before
5. **Email Sent**: Calendar invite to john@example.com
6. **Lead Updated**: Score +10, status → CONTACTED

### Workflow 2: Complete Meeting & Follow-up

1. **Join Meeting**: Click "Join" in event details
2. **Mark Complete**: After meeting ends
3. **Post-Meeting Modal**:
   - Enter meeting notes
   - Click "AI Summary" → Structured summary generated
   - Select outcome: Positive
   - Enable:
     ✅ Schedule follow-up (1 week)
     ✅ Send thank-you email
     ✅ Create tasks
4. **Automated**:
   - Follow-up meeting created (next week, same time)
   - Thank-you email sent (SDR template)
   - Action items → Task list
   - Notes saved to lead record
   - Lead score +10
   - CRM updated (if connected)

### Workflow 3: Google Calendar Sync

1. **Connect**: Settings → Integrations → Google Calendar
2. **Authorize**: OAuth flow
3. **Initial Sync**: Import next 30 days of Google events
4. **Ongoing**:
   - Create event in Lumio → Appears in Google
   - Create event in Google → Appears in Lumio
   - Update in either → Synced immediately
5. **Manual Sync**: Click "Sync Google" anytime for full sync

### Workflow 4: Recurring Weekly Team Sync

1. **Create Event**: "Weekly Team Sync"
2. **Enable Recurring**:
   - Frequency: Weekly
   - Every: 1 week
   - Repeat on: Monday
   - Ends: Never
3. **Generate**: Creates master + occurrences
4. **Edit Single**: Change one Monday → Creates exception
5. **Edit Series**: Update all → Changes pattern
6. **View**: Calendar shows all occurrences

## 🔧 Technical Implementation

### Database Schema

```prisma
model CalendarEvent {
  id                 String    @id @default(cuid())
  userId             String
  title              String
  description        String?
  startDate          DateTime
  endDate            DateTime
  allDay             Boolean   @default(false)
  category           EventCategory
  priority           Priority

  // Integration
  externalId         String?
  externalProvider   String?   // google, outlook
  syncStatus         String?   // synced, pending, failed

  // Meeting
  linkedLeadId       String?
  linkedCampaignId   String?
  attendees          String?   // JSON
  reminderMinutes    Int?
  meetingUrl         String?
  location           String?

  // Advanced
  completedAt        DateTime?
  meetingNotes       String?   @db.Text
  prepNotes          String?   @db.Text
  outcome            String?

  // Recurrence
  recurrenceRule     Json?
  recurrenceMasterId String?
  isException        Boolean   @default(false)

  // Relations
  lead     Lead?     @relation(...)
  campaign Campaign? @relation(...)
  recurrenceMaster CalendarEvent? @relation("EventRecurrence")
  occurrences CalendarEvent[] @relation("EventRecurrence")
}
```

### API Endpoints

#### Calendar CRUD

- `GET /api/calendar` - List events (with filters)
- `POST /api/calendar` - Create event
- `PUT /api/calendar` - Update event
- `DELETE /api/calendar?id=...` - Delete event

#### Actions

- `POST /api/calendar/[id]/actions` - Event actions
  - Actions: reschedule, cancel, complete, duplicate, send-reminder

#### AI Features

- `GET /api/calendar/suggestions` - Get AI suggestions
- `GET /api/calendar/meeting-prep?leadId=...` - Generate prep brief
- `POST /api/calendar/auto-schedule` - Auto-schedule meeting
- `GET /api/calendar/availability` - Find available slots

#### Google Sync

- `GET /api/integrations/google-calendar/oauth` - Get auth URL
- `GET /api/integrations/google-calendar/callback` - OAuth callback
- `POST /api/calendar/sync` - Manual sync (direction: to_google, from_google, both)
- `GET /api/calendar/sync` - Get sync status

### Components

- `CreateEventModal` - Full event creation wizard
- `EventDetailsModal` - View/edit event with tabs
- `MeetingPrepPanel` - AI-generated prep brief
- `PostMeetingWorkflow` - Complete meeting modal
- `WeekView` - Weekly calendar grid
- `DayView` - Daily schedule view
- `RecurrenceSelector` - Recurring event configurator

### Libraries

- **GoogleCalendarSync** (`src/lib/google-calendar-sync.ts`)
  - OAuth token management
  - Bi-directional sync engine
  - Webhook handler
  - Automatic token refresh

## 🧪 Testing Guide

### Manual Testing

#### Test 1: Create Basic Event

1. Click "New Event"
2. Fill: Title, Date, Time, Duration
3. Save
4. Verify: Appears on calendar

#### Test 2: Create with Attendees

1. New Event
2. Add attendees: test@example.com
3. Save
4. Check: Email sent (in logs)

#### Test 3: Link to Lead

1. New Event
2. Select lead from dropdown
3. Save
4. Open event → Verify lead info shown

#### Test 4: Auto-Schedule

1. Check suggestions sidebar
2. Click "Auto-Schedule" on suggestion
3. Verify: Modal pre-filled
4. Save
5. Check: Event created, lead scored

#### Test 5: Google Sync

1. Settings → Integrations → Google Calendar
2. Click Connect → Authorize
3. Dashboard → Calendar → Click "Sync Google"
4. Verify: Google events imported
5. Create event in Lumio
6. Check Google Calendar → Event synced

#### Test 6: Recurring Event

1. New Event
2. Enable "Repeat this event"
3. Select Weekly, Monday
4. Ends: After 5 occurrences
5. Save
6. Verify: 5 events created

#### Test 7: Meeting Prep

1. Create event linked to lead
2. Open event → "Meeting Prep" tab
3. Verify: AI brief generated with talking points

#### Test 8: Complete Meeting

1. Open event
2. Click "Mark Complete"
3. Enter notes
4. Select outcome
5. Enable follow-ups
6. Complete
7. Verify:
   - Notes saved
   - Follow-up created
   - Lead updated

### Integration Testing

```bash
# Test Google OAuth
GET /api/integrations/google-calendar/oauth
# Returns authUrl

# Simulate callback
GET /api/integrations/google-calendar/callback?code=AUTH_CODE&state=STATE

# Test sync
POST /api/calendar/sync
{
  "direction": "both"
}
```

## 🎨 UX Highlights

### Visual Feedback

- Loading states on all actions
- Success/error toasts
- Real-time sync indicators
- Conflict warnings
- Current time line (Week/Day views)

### Keyboard Shortcuts

- `N` - New event
- `E` - Edit selected event
- `Del` - Delete selected event
- `←/→` - Previous/Next month
- `T` - Go to today

### Mobile Responsive

- Collapsible sidebar on mobile
- Touch-friendly tap targets
- Swipe navigation
- Optimized modals

### Accessibility

- ARIA labels
- Keyboard navigation
- Screen reader support
- High contrast mode

## 📊 Metrics & Analytics

Track calendar performance:

- Total meetings scheduled
- Meeting density by day/week
- Category breakdown (pie chart)
- Conversion rate (meetings → deals)
- Average meeting duration
- No-show rate
- Most productive meeting times
- Lead-to-meeting time

## 🔒 Security

- OAuth 2.0 with PKCE (Google)
- Encrypted token storage
- CSRF protection (state parameter)
- Rate limiting on API endpoints
- User-scoped data (can only see own events)
- Webhook signature verification

## 🚀 Future Enhancements

- Microsoft Outlook integration
- Zoom native integration (not just links)
- AI meeting transcription
- Auto-rescheduling suggestions
- Smart conflict resolution
- Team calendars (shared availability)
- Booking pages (public availability)
- Calendar analytics dashboard
- Email template customization
- SMS reminders
- Slack notifications

---

## 📝 Summary

The Lumio Calendar is production-ready with:
✅ 4 view modes (Month/Week/Day/Agenda)
✅ Full CRUD with modals
✅ Google Calendar bi-directional sync
✅ AI meeting prep
✅ Auto-scheduling
✅ Post-meeting automation
✅ Recurring events
✅ Drag & drop (Week view)
✅ Timezone support
✅ Conflict detection
✅ Lead/campaign linking
✅ Email calendar invites
✅ Webhook real-time sync

**Enterprise-Grade | AI-Powered | World-Class UX**
