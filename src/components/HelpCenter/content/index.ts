export interface HelpArticle {
  id: string;
  title: string;
  content: string;
  category: string;
  steps?: string[];
  video?: string;
  tags?: string[];
}

export interface HelpContent {
  title: string;
  description: string;
  articles: HelpArticle[];
  quickLinks?: { title: string; href: string }[];
}

export const helpContent: Record<string, HelpContent> = {
  home: {
    title: "Dashboard Overview",
    description: "Your command center for sales automation",
    articles: [
      {
        id: "getting-started",
        title: "Getting Started with Lumio",
        category: "Getting Started",
        content: `Welcome to Lumio! This guide will help you get up and running in minutes.

Lumio is an AI-powered sales automation platform that helps you manage leads, create campaigns, and close more deals with intelligent automation.`,
        steps: [
          "Connect your first integration (Shopify, HubSpot, etc)",
          "Import or add your first leads",
          "Create your first campaign",
          "Let Marvin AI assist with outreach",
          "Track performance in Insights",
        ],
        video: "/videos/getting-started.mp4",
        tags: ["basics", "quickstart", "tutorial"],
      },
      {
        id: "dashboard-overview",
        title: "Understanding Your Dashboard",
        category: "Getting Started",
        content: `Your dashboard provides a real-time overview of your sales pipeline.

**Key Metrics:**
- Total Leads: All leads in your system
- Conversion Rate: % of leads that became customers
- Active Campaigns: Currently running outreach campaigns
- Revenue: Total revenue tracked

**Quick Actions:**
- Import Leads: Upload CSV or connect integrations
- Create Campaign: Start automated outreach
- View Analytics: Deep dive into performance`,
        tags: ["dashboard", "metrics", "kpis"],
      },
      {
        id: "marvin-intro",
        title: "Meet Marvin - Your AI SDR Agent",
        category: "Marvin AI",
        content: `Marvin is your AI-powered Sales Development Representative that works 24/7.

**What Marvin Does:**
- Analyzes leads and scores them automatically
- Creates personalized outreach messages
- Follows up at optimal times
- Learns from your best practices
- Escalates hot leads to you

**How to Activate:**
1. Go to Settings → SDR Agent
2. Configure your rules (VIP customers, abandoned carts, etc)
3. Toggle "Activate SDR Agent"
4. Watch Marvin work!`,
        video: "/videos/marvin-intro.mp4",
        tags: ["ai", "automation", "sdr", "marvin"],
      },
    ],
    quickLinks: [
      { title: "Connect First Integration", href: "/dashboard/settings" },
      { title: "Import Leads", href: "/dashboard/leads" },
      { title: "Create Campaign", href: "/dashboard/campaigns" },
    ],
  },

  leads: {
    title: "Leads Management",
    description: "Manage and nurture your prospects effectively",
    articles: [
      {
        id: "import-leads",
        title: "How to Import Leads",
        category: "Getting Started",
        content: `Import leads from multiple sources to centralize your sales data.

**Methods:**
1. CSV Upload: Import from spreadsheet
2. Integrations: Sync from Shopify, HubSpot, Salesforce
3. Manual Entry: Add leads one by one
4. API: Programmatic import`,
        steps: [
          "Click 'Import' button in top right",
          "Choose import method (CSV or Integration)",
          "Map your fields to Lumio fields",
          "Review import preview",
          "Click 'Import' to finalize",
        ],
        tags: ["import", "csv", "data"],
      },
      {
        id: "lead-scoring",
        title: "Understanding Lead Scoring",
        category: "Features",
        content: `Lead scores help you prioritize which leads to contact first.

**How Scoring Works:**
- Base score: 50 points
- Job title: +15-30 points (CEO, VP, Director)
- Company size: +10-20 points
- Source: +5-15 points (Referral, LinkedIn)
- Engagement: +10 points per interaction
- Purchase history: +10 points per $100 spent (Shopify)

**Score Ranges:**
- 80-100: Hot leads (contact immediately)
- 60-79: Warm leads (contact within 24h)
- 40-59: Cold leads (nurture campaign)
- 0-39: Low priority`,
        tags: ["scoring", "prioritization", "leads"],
      },
      {
        id: "filtering-leads",
        title: "Filtering and Searching Leads",
        category: "Features",
        content: `Find the right leads quickly with powerful filters.

**Available Filters:**
- Status: NEW, CONTACTED, QUALIFIED, CONVERTED, LOST
- Source: Filter by integration (Shopify, HubSpot, LinkedIn, etc)
- Score: Filter by lead score range
- Tags: Custom tags you've applied
- Date: Created or updated dates

**Search:**
Type in the search bar to find leads by:
- Name
- Email
- Company
- Job title`,
        tags: ["filter", "search", "organization"],
      },
      {
        id: "integration-sources",
        title: "Understanding Lead Sources",
        category: "Integrations",
        content: `Leads can come from various integrations. Each source provides unique data.

**Shopify Leads:**
- Customers and their purchase history
- Order value and frequency
- Abandoned carts
- Badge: 🛍️ Shows "Shopify" with last sync time

**HubSpot Leads:**
- CRM contacts and their deal stages
- Lead scores from HubSpot
- Interaction history
- Badge: 🟠 Shows "HubSpot"

**Salesforce Leads:**
- Enterprise contacts and accounts
- Opportunity values
- Account hierarchy
- Badge: ☁️ Shows "Salesforce"

**Filter by Source:**
Use the "Source" dropdown to view leads from specific integrations.`,
        tags: ["integrations", "shopify", "hubspot", "source"],
      },
    ],
    quickLinks: [
      { title: "Import CSV", href: "#import" },
      { title: "Connect Shopify", href: "/dashboard/settings" },
      { title: "Create Campaign", href: "/dashboard/campaigns" },
    ],
  },

  campaigns: {
    title: "Campaign Management",
    description: "Automate and optimize your outreach",
    articles: [
      {
        id: "create-campaign",
        title: "Creating Your First Campaign",
        category: "Getting Started",
        content: `Campaigns automate your outreach with multi-step sequences.

**Campaign Types:**
- Email Sequence: Multi-step email outreach
- LinkedIn Sequence: Connection requests + messages
- Nurture: Long-term relationship building
- Cart Recovery: Win back abandoned carts (Shopify)
- Cold Intro: First contact with new leads

**Steps to Create:**
1. Click "Create Campaign"
2. Choose campaign type
3. Select Autopilot (AI runs) or Copilot (you approve)
4. Build your sequence steps
5. Choose target segment
6. Launch or save as draft`,
        steps: [
          "Click 'Create Campaign' button",
          "Fill in campaign name and type",
          "Choose Autopilot or Copilot mode",
          "Add sequence steps with delays",
          "Select target segment",
          "Review and launch",
        ],
        video: "/videos/create-campaign.mp4",
        tags: ["campaign", "create", "sequence"],
      },
      {
        id: "campaign-actions",
        title: "Campaign Actions: Play, Pause, Duplicate",
        category: "Features",
        content: `Manage your campaigns with easy-to-use actions.

**Play (▶️):**
- Starts or resumes a campaign
- Status changes to RUNNING
- First messages sent immediately
- Subsequent steps follow schedule

**Pause (⏸️):**
- Temporarily stops the campaign
- No new messages sent
- Can resume anytime
- Progress is saved

**Duplicate (📋):**
- Creates an exact copy
- New campaign named "[Original] (Copy)"
- Status set to DRAFT
- Edit before launching

**Delete (🗑️):**
- Permanently removes campaign
- Confirmation required
- Cannot be undone
- Recipients data preserved`,
        tags: ["actions", "manage", "campaign"],
      },
      {
        id: "autopilot-vs-copilot",
        title: "Autopilot vs Copilot Mode",
        category: "Features",
        content: `Choose how much control you want over your campaigns.

**Copilot Mode (Recommended for Starting):**
- AI suggests messages
- You review and approve
- Full control over sends
- Learn AI's strategies
- Best for: Complex sales, high-value deals

**Autopilot Mode (Advanced):**
- AI runs completely automatically
- Messages sent without approval
- Marvin optimizes based on results
- Maximum efficiency
- Best for: High-volume, proven sequences

**Hybrid Approach:**
- Use Copilot for new campaigns
- Switch to Autopilot once proven
- Set rules: Autopilot for <$1000, Copilot for >$1000`,
        tags: ["autopilot", "copilot", "automation"],
      },
      {
        id: "sequence-builder",
        title: "Building Effective Sequences",
        category: "Best Practices",
        content: `Create multi-step sequences that convert.

**Best Practices:**
1. **Start Strong:** First message is critical - personalize it
2. **Timing:** Wait 2-3 days between steps
3. **Value First:** Provide value before asking for meetings
4. **Multi-Channel:** Mix email + LinkedIn for better results
5. **Call to Action:** Clear CTA in each message

**Example 3-Step Sequence:**
- Step 1 (Day 0): Introduction + value proposition
- Step 2 (Day 3): Case study or social proof
- Step 3 (Day 7): Direct ask for meeting

**Pro Tips:**
- Use {{firstName}} for personalization
- Keep messages under 100 words
- Include one clear next step
- A/B test subject lines`,
        tags: ["sequence", "best-practices", "templates"],
      },
    ],
    quickLinks: [
      { title: "Create Campaign", href: "#create" },
      { title: "View Templates", href: "#templates" },
      { title: "Campaign Analytics", href: "/dashboard/insights" },
    ],
  },

  calendar: {
    title: "Calendar & Meetings",
    description: "Schedule and manage your meetings",
    articles: [
      {
        id: "schedule-meeting",
        title: "Scheduling Meetings with Leads",
        category: "Getting Started",
        content: `Schedule meetings directly from lead profiles or calendar.

**From Leads Page:**
1. Find the lead you want to meet
2. Click the calendar icon
3. Choose date and time
4. Add meeting notes
5. Send calendar invite

**From Calendar:**
1. Click "New Event"
2. Select event type (Meeting, Demo, Follow-up)
3. Link to lead (optional)
4. Add meeting URL (Zoom, Meet, etc)
5. Set reminders`,
        steps: [
          "Navigate to Calendar or Leads page",
          "Click calendar icon or 'New Event'",
          "Fill in meeting details",
          "Link to lead if applicable",
          "Save and send invite",
        ],
        tags: ["meetings", "calendar", "scheduling"],
      },
      {
        id: "sync-calendar",
        title: "Syncing External Calendars",
        category: "Integrations",
        content: `Connect Google Calendar or Outlook to sync events.

**Supported Calendars:**
- Google Calendar
- Microsoft Outlook
- Apple iCloud

**What Syncs:**
- Your events appear in Lumio
- Lumio events appear in your calendar
- Two-way sync in real-time
- Conflicts detected automatically

**Setup:**
1. Go to Settings → Integrations
2. Find "Google Calendar"
3. Click "Connect"
4. Authorize access
5. Choose calendars to sync`,
        tags: ["calendar", "google", "outlook", "sync"],
      },
      {
        id: "ai-suggestions",
        title: "AI Meeting Suggestions",
        category: "Marvin AI",
        content: `Marvin suggests optimal meeting times based on data.

**Marvin Analyzes:**
- When leads typically open emails
- Their timezone
- Your availability
- Past meeting success rates

**Suggestions Include:**
- Best days and times to meet
- Pre-meeting brief with lead context
- Suggested talking points
- Follow-up reminders

**How to Use:**
1. Check AI Suggestions panel in Calendar
2. Review Marvin's recommendations
3. Click "Auto-schedule" or choose custom time
4. Marvin prepares meeting brief`,
        tags: ["ai", "suggestions", "optimization"],
      },
      {
        id: "keyboard-shortcuts",
        title: "Keyboard Shortcuts",
        category: "Productivity",
        content: `Speed up your calendar management with keyboard shortcuts.

**Navigation:**
- N - Create new event
- T - Go to today
- M - Open Marvin insights
- ← → - Navigate months
- ↑ ↓ - Navigate weeks

**Views:**
- 1 - Month view
- 2 - Week view  
- 3 - Day view
- 4 - Agenda view

**Actions:**
- Enter - Open event details
- Delete - Delete selected event
- Escape - Close modal/panel
- ? - Open help center

**Tips:**
- Use Tab to navigate between form fields
- Press Enter to save forms
- Use Escape to cancel actions`,
        tags: ["shortcuts", "productivity", "keyboard"],
      },
      {
        id: "event-types",
        title: "Event Types & Best Practices",
        category: "Best Practices",
        content: `Choose the right event type for better organization and insights.

**Event Types:**
- **Meeting**: General business meetings
- **Sales Call**: Direct sales conversations
- **Demo**: Product demonstrations
- **Follow-up**: Post-meeting follow-ups
- **Planning**: Internal planning sessions

**Best Practices:**
1. **Link to Leads**: Always link sales calls to specific leads for context
2. **Add Meeting URLs**: Include Zoom/Meet links for easy access
3. **Set Reminders**: Use 15-min reminders for important meetings
4. **Use Categories**: Proper categorization helps with reporting
5. **Add Attendees**: Include all meeting participants

**Pro Tips:**
- Use recurring events for regular check-ins
- Add prep notes in the description
- Set different priorities for urgent meetings
- Use location field for physical meetings`,
        tags: ["events", "organization", "best-practices"],
      },
      {
        id: "integration-workflow",
        title: "Calendar Integration Workflow",
        category: "Integrations",
        content: `Maximize your calendar efficiency with integrated workflows.

**Lead Integration:**
1. Schedule meeting from lead profile
2. Event automatically links to lead
3. Meeting notes sync to lead history
4. Follow-up tasks created automatically

**Campaign Integration:**
1. Link events to active campaigns
2. Track campaign-related meetings
3. Measure meeting conversion rates
4. Generate campaign performance reports

**CRM Integration:**
- Two-way sync with external calendars
- Automatic conflict detection
- Meeting outcomes sync to CRM
- Lead scoring updates based on meetings

**Email Integration:**
- Calendar invites sent automatically
- Meeting reminders via email
- Post-meeting follow-up emails
- Integration with email sequences`,
        steps: [
          "Connect your calendar integration",
          "Link events to leads and campaigns",
          "Set up automatic follow-ups",
          "Track meeting outcomes",
          "Generate performance reports",
        ],
        tags: ["integration", "workflow", "automation"],
      },
    ],
    quickLinks: [
      { title: "New Event", href: "#new-event" },
      { title: "Sync Calendar", href: "/dashboard/settings" },
      { title: "Keyboard Shortcuts", href: "#shortcuts" },
    ],
  },

  insights: {
    title: "Analytics & Insights",
    description: "Data-driven insights to optimize performance",
    articles: [
      {
        id: "understanding-metrics",
        title: "Understanding Key Metrics",
        category: "Analytics",
        content: `Learn what each metric means and how to improve it.

**Total Revenue:**
Sum of all revenue from converted leads. Track by period (day, week, month).

**Conversion Rate:**
(Converted Leads / Total Leads) × 100
Benchmark: 10-15% is good, >20% is excellent

**Lead Sources:**
Where your leads come from:
- Shopify: E-commerce customers
- HubSpot: CRM contacts
- LinkedIn: Social selling
- Direct: Website forms

**Campaign Performance:**
- Open Rate: % who opened emails (target: >25%)
- Click Rate: % who clicked links (target: >8%)
- Reply Rate: % who replied (target: >3%)
- Conversion Rate: % who became customers (target: >1%)

**Best Performing Hours:**
When your leads are most engaged. Use this to schedule campaigns.`,
        tags: ["metrics", "kpi", "analytics"],
      },
      {
        id: "export-data",
        title: "Exporting Analytics Data",
        category: "Features",
        content: `Export your data for custom analysis or reporting.

**Export Formats:**
- CSV: For Excel/Sheets
- JSON: For developers
- PDF: For presentations

**What Can Be Exported:**
- Lead lists with all fields
- Campaign performance data
- Revenue reports
- Custom date ranges

**How to Export:**
1. Choose the view you want (Leads, Campaigns, etc)
2. Apply any filters
3. Click "Export" button
4. Choose format
5. Download file`,
        tags: ["export", "data", "reporting"],
      },
      {
        id: "marvin-insights",
        title: "Marvin AI Insights",
        category: "Marvin AI",
        content: `Marvin analyzes your data and provides actionable insights.

**Types of Insights:**
- **Performance**: "Your email open rates are 15% higher at 2 PM"
- **Opportunities**: "23 Shopify VIP customers haven't purchased in 60 days"
- **Warnings**: "3 high-value deals haven't been contacted in 7 days"
- **Recommendations**: "Focus LinkedIn outreach on Tech industry (67% response rate)"

**How to Use:**
1. Click the Marvin toggle on any page
2. Review insights
3. Click suggested actions
4. Track impact

Marvin learns from your actions and improves over time.`,
        tags: ["ai", "insights", "recommendations"],
      },
    ],
    quickLinks: [
      { title: "Export Data", href: "#export" },
      { title: "Custom Reports", href: "#reports" },
    ],
  },

  settings: {
    title: "Settings & Integrations",
    description: "Configure your account and connect tools",
    articles: [
      {
        id: "connect-shopify",
        title: "Connecting Shopify",
        category: "Integrations",
        content: `Connect your Shopify store to sync customers and orders.

**What Gets Synced:**
- Customers → Leads (with purchase history)
- Orders → Revenue tracking
- Abandoned carts → Recovery campaigns
- Products → Campaign personalization

**Benefits:**
- Automatic lead import
- Customer lifetime value tracking
- Cart abandonment recovery
- VIP customer identification

**Connection Steps:**
1. Go to Settings → Integrations
2. Find Shopify card
3. Click "Connect"
4. Enter your store domain (e.g., mystore.myshopify.com)
5. Authorize Lumio app in Shopify
6. Data syncs automatically via webhooks

**What Happens After Connect:**
- Existing customers imported as leads
- New orders sync in real-time
- Abandoned carts trigger recovery campaigns
- VIP customers identified automatically`,
        steps: [
          "Settings → Integrations",
          "Find Shopify, click Connect",
          "Enter store domain",
          "Authorize in popup",
          "Wait for initial sync (~5 min)",
        ],
        video: "/videos/connect-shopify.mp4",
        tags: ["shopify", "ecommerce", "integration"],
      },
      {
        id: "connect-hubspot",
        title: "Connecting HubSpot",
        category: "Integrations",
        content: `Integrate with HubSpot CRM to sync contacts and deals.

**What Gets Synced:**
- Contacts → Leads
- Deals → Opportunities
- Companies → Account info
- Lead scores → Lumio scores

**Benefits:**
- Bi-directional sync (changes sync both ways)
- Deal stage tracking
- Activity logging
- Unified reporting

**Connection Steps:**
1. Settings → Integrations → HubSpot
2. Click "Connect"
3. Authorize OAuth in popup
4. Choose sync direction
5. Map custom fields (optional)

**HubSpot Tips:**
- Use webhooks for real-time sync
- Map custom fields for full data
- Sync deal stages for pipeline tracking`,
        steps: [
          "Settings → Integrations → HubSpot",
          "Click Connect → OAuth popup",
          "Authorize permissions",
          "Configure sync options",
          "Initial sync completes",
        ],
        tags: ["hubspot", "crm", "integration"],
      },
      {
        id: "marvin-training",
        title: "Training Marvin AI",
        category: "Marvin AI",
        content: `Train Marvin to understand your business and respond better.

**What to Upload:**
- Product documentation (PDF, DOCX)
- Sales playbooks
- FAQs
- Case studies
- Pricing sheets
- Company overview

**How Training Helps:**
- Marvin answers questions accurately
- Personalized outreach messages
- Objection handling
- Product recommendations
- Competitive positioning

**Upload Process:**
1. Settings → Marvin Training
2. Drag & drop documents
3. Wait for processing (~2 min per doc)
4. Test Marvin's knowledge
5. Upload more as needed

**Best Practices:**
- Upload 5-10 key documents minimum
- Update regularly with new products
- Include real customer success stories
- Add competitive battle cards`,
        steps: [
          "Settings → Marvin Training",
          "Drag & drop documents (PDF, DOCX, TXT)",
          "Wait for processing",
          "Test knowledge in preview panel",
          "Upload more documents",
        ],
        video: "/videos/train-marvin.mp4",
        tags: ["marvin", "training", "ai", "knowledge"],
      },
      {
        id: "sdr-agent-setup",
        title: "Setting Up SDR Agent",
        category: "Marvin AI",
        content: `Configure SDR Agent rules to automate outreach intelligently.

**What is SDR Agent?**
An AI that automatically contacts leads based on rules you set.

**Configuration Options:**

**1. Segmentation Rules (YOU configure):**
- VIP Customers: Total spent ≥ $X or Orders ≥ Y
- Abandoned Cart: Cart value ≥ $X, wait Z hours
- Hot Leads: Score ≥ X
- Re-engagement: No purchase in X days

**2. For Each Segment, Set:**
- Which channels to use (Email, LinkedIn, WhatsApp)
- Message templates
- Timing and frequency
- Discount offers (if any)

**3. Choose Mode:**
- Autopilot: SDR executes automatically
- Copilot: SDR suggests, you approve

**Example Rule:**
"If Shopify customer spent >$1000, tag as VIP and send personalized thank you email + exclusive offer via Email + WhatsApp within 24 hours"

**Setup:**
1. Settings → SDR Agent
2. Define segmentation rules
3. Set thresholds and strategies
4. Create/edit templates
5. Toggle "Activate SDR Agent"`,
        steps: [
          "Go to Settings → SDR Agent",
          "Define your segments (VIP, abandoned cart, etc)",
          "Set thresholds (dollar amounts, scores, timing)",
          "Choose strategies for each segment",
          "Create message templates",
          "Activate SDR Agent",
        ],
        video: "/videos/sdr-agent-setup.mp4",
        tags: ["sdr", "automation", "rules", "segmentation"],
      },
    ],
    quickLinks: [
      { title: "Connect Integration", href: "#integrations" },
      { title: "Train Marvin", href: "/dashboard/settings/marvin-training" },
      { title: "SDR Agent Setup", href: "/dashboard/settings/sdr-agent" },
    ],
  },
};
