# 🤖 Marvin SDR Agent - Integration Guide

**How Marvin Uses Each Integration to Automate Sales**

---

## 🎯 Overview

Marvin SDR Agent is your AI-powered Sales Development Representative that automatically engages leads based on **rules you configure**. The power comes from combining data from your integrations with intelligent automation.

### Key Principle: **You Are in Control**

- ✅ **You set the thresholds** (dollar amounts, scores, timing)
- ✅ **You choose strategies** (email, LinkedIn, discounts)
- ✅ **You write templates** (or use defaults)
- ✅ **You approve or automate** (Copilot vs Autopilot)

Marvin executes based on YOUR rules, not arbitrary hardcoded logic.

---

## 🛍️ Shopify + SDR Agent

### Data Marvin Gets from Shopify

When you connect Shopify, Marvin automatically sees:

```javascript
For each customer:
{
  totalSpent: 1450.00,        // Lifetime value
  ordersCount: 7,             // Number of orders
  lastOrderDate: "2025-01-05",
  favoriteProducts: [...],
  abandonedCheckout: {
    cartValue: 125.00,
    abandonedAt: "2025-01-10 14:30",
    items: [...]
  }
}
```

### How You Configure SDR Rules

**Example: VIP Customers**

```
Settings → SDR Agent → Segmentation Rules → VIP Customers

YOU SET:
✏️ Total Spent >= $______  (default: 1000)
✏️ OR Orders Count >= ___  (default: 5)

✏️ Strategy: [Select]
   - Personal outreach + exclusive offers
   - Priority support
   - Early access to products

✏️ Channels: ☑️ Email  ☑️ WhatsApp

✏️ Delay: ___ hours (default: 24)

✏️ Message Template: [Edit/Write your own]
```

**What Happens:**

1. Customer spends $1000+ OR makes 5+ orders
2. Marvin waits 24 hours (or your custom delay)
3. Sends personalized message via Email + WhatsApp
4. Message includes: Their spend, order count, VIP benefits (from your template)

**Example: Abandoned Cart Recovery**

```
YOU CONFIGURE:
✏️ Cart Value >= $_____ (default: 50)
✏️ Wait ____ hours before contact (default: 1)
✏️ Send via: ☑️ Email  ☑️ WhatsApp
✏️ Offer discount: ☑️ Yes  ___% (default: 10%)

MARVIN DOES:
1. Detects cart abandoned > $50
2. Waits 1 hour (your setting)
3. Sends recovery email with:
   - Cart contents
   - 10% discount code (your %)
   - Direct link to complete purchase
4. If no response, sends WhatsApp reminder
5. Tracks recovery rate
```

### ROI from Shopify + SDR

**Typical Results:**

- Cart recovery: 15-30% → 40-67% (SDR automation)
- VIP retention: +45% (timely engagement)
- Upsell success: +120% (personalized recommendations)

---

## 🟠 HubSpot + SDR Agent

### Data Marvin Gets from HubSpot

```javascript
For each contact:
{
  hubspotScore: 85,
  dealStage: "proposal_sent",
  dealValue: 15000,
  lastContactDate: "2025-01-03",
  lifecycleStage: "salesqualifiedlead",
  interactions: [...],
  dealOwner: "sales@company.com"
}
```

### How You Configure

**Example: Hot Leads**

```
YOU SET:
✏️ Lead Score >= ___ (default: 70)
✏️ Status: [Select] NEW / CONTACTED
✏️ Fast-Track Strategy: [Select]
   - Multi-channel (email+LinkedIn+phone)
   - Email only
   - Direct sales assignment

✏️ Response Time: Contact within ___ hours (default: 2)

MARVIN DOES:
1. Contact comes from HubSpot with score 85
2. Within 2 hours (YOUR time):
   - Sends personalized email
   - Sends LinkedIn connection request
   - Schedules phone call attempt
3. Uses training knowledge for personalization
4. Syncs all actions back to HubSpot
5. Escalates if high-intent reply
```

**Example: At-Risk Deals**

```
YOU CONFIGURE:
✏️ Deal Stage: [Select] Proposal Sent / Negotiation
✏️ No contact for: ___ days (default: 7)
✏️ Deal Value >= $_____ (default: 5000)
✏️ Save Strategy: [Select]
   - Personal call from manager
   - Additional incentive
   - Case study + social proof

MARVIN MONITORS:
- Proposal sent 7+ days ago → Alert
- Deal value $15K → High priority
- Auto-creates follow-up sequence:
  1. Email with case study
  2. LinkedIn message
  3. Escalates to manager for call
  4. Logs all in HubSpot
```

### ROI from HubSpot + SDR

**Typical Results:**

- Hot lead response time: 24h → 2h (12x faster)
- At-risk deal save rate: 15% → 45%
- Sales cycle length: -30% (faster engagement)

---

## ☁️ Salesforce + SDR Agent

### Data Marvin Gets

```javascript
{
  accountType: "Enterprise",
  opportunityValue: 50000,
  accountTier: "Platinum",
  decisionMakers: 3,
  lastActivity: "2025-01-08",
  salesStage: "Qualification"
}
```

### Configuration Example

**Enterprise Nurture:**

```
YOU SET:
✏️ Account Type: [Select] Enterprise / SMB / Startup
✏️ Opportunity Value >= $_____ (default: 25000)
✏️ Strategy: [Select]
   - Multi-threading (contact all decision makers)
   - Single champion approach
   - Executive-level introduction

✏️ Channels: ☑️ Email  ☑️ LinkedIn  ☑️ Direct Mail

MARVIN EXECUTES:
1. Identifies $50K Enterprise opportunity
2. Researches company (if enabled)
3. Contacts all 3 decision makers:
   - Personalized email to each
   - LinkedIn to C-level
   - Coordinated timing
4. Uses your training docs for value prop
5. Schedules executive meeting
6. Syncs everything to Salesforce
```

### ROI from Salesforce + SDR

**Typical Results:**

- Enterprise deal velocity: +50% faster
- Multi-threading coverage: 100% vs 30%
- Win rate: +25% (more stakeholders engaged)

---

## 💼 LinkedIn + SDR Agent

### How It Works

```
MARVIN USES LINKEDIN FOR:
- Connection requests with personalized notes
- Direct messages to warm leads
- Engagement (likes, comments) on prospect posts
- Social selling

YOU CONFIGURE:
✏️ Auto-connect with leads scoring >= ___
✏️ Message template for connection request
✏️ Follow-up timing: ___ days after connection
✏️ Engagement strategy: [Select options]
```

### Example Sequence

```
Day 0:  Send connection request (personalized)
Day 2:  If accepted → Send intro message
Day 5:  Share relevant case study
Day 8:  Suggest meeting
Day 12: Follow-up if no response
```

All timing and content: **You configure**

---

## 📧 Mailchimp + SDR Agent

### Use Case: Warm Email Subscribers

```javascript
Mailchimp gives:
{
  subscriberStatus: "subscribed",
  emailEngagement: "high",  // Opens emails regularly
  clickedTopics: ["AI automation", "Sales tools"],
  lastCampaignOpened: "2025-01-09"
}
```

### Configuration

```
YOU SET:
✏️ Engagement Level: [Select] High / Medium / Low
✏️ If High Engagement + NOT Customer:
   → Send personalized sales outreach
✏️ Topics clicked: Match with product offerings
✏️ Timing: Send when they usually open (Marvin learns)

MARVIN DOES:
1. Identifies high-engagement subscriber
2. Sees they clicked "AI automation" content
3. Sends personalized email about AI products
4. References content they engaged with
5. Optimal send time based on their open history
```

---

## 🔄 How Data Flows

```
┌─────────────┐
│ Integration │ (Shopify, HubSpot, etc)
└──────┬──────┘
       │ Webhooks/Sync
       ↓
┌─────────────┐
│ Lumio Leads │ (source, externalId, syncMetadata)
└──────┬──────┘
       │ Enriched Data
       ↓
┌─────────────┐
│  SDR Rules  │ (YOUR configuration)
└──────┬──────┘
       │ Rule matching
       ↓
┌─────────────┐
│SDR Agent    │ (Marvin executes)
└──────┬──────┘
       │ Personalized outreach
       ↓
┌─────────────┐
│   Leads     │ (Engaged, converted)
└─────────────┘
```

---

## ⚙️ Configuration Interface

### Where You Configure Everything

**Main Page:** `/dashboard/settings/sdr-agent`

**Tabs:**

1. **Segmentation Rules**

   - Pre-built rules with editable thresholds
   - Add custom rules
   - Enable/disable per rule
   - Set conditions (AND/OR logic)

2. **Integration Config**

   - Per-integration toggles
   - Which rules apply to which integration
   - Sync preferences
   - Auto-apply settings

3. **Templates**

   - Message templates for each rule
   - Variable system ({{firstName}}, etc)
   - Test preview with real lead data
   - Create custom templates

4. **Performance**
   - ROI by rule
   - Conversion rates
   - A/B test results
   - Optimization recommendations

---

## 🎓 Training Marvin for Better Results

### Upload Business Documents

```
Settings → Marvin Training

Upload documents about:
1. Your products/services (features, benefits, pricing)
2. Sales playbook (objection handling, FAQs)
3. Case studies (success stories)
4. Competitive analysis (battle cards)
5. Company info (mission, values, team)
```

### How Training Improves SDR

**Without Training:**

```
Message: "Hi John, interested in our platform?"
```

**With Training:**

```
Message: "Hi John,

I saw Test Corp is in the fintech industry. We recently helped
[Company from case study] reduce customer onboarding time by 60%
with our [specific feature from product docs].

Given your role as CTO, I think [specific benefit] could be valuable
for your team.

15-minute call to explore?"
```

Training data makes messages:

- ✅ More specific
- ✅ More relevant
- ✅ Higher conversion
- ✅ On-brand

---

## 📊 Measuring Success

### SDR Performance Dashboard

**View in:** `/dashboard/settings/sdr-agent` → Performance tab

**Metrics Tracked:**

- Sequences created
- Messages sent
- Open rates
- Response rates
- Conversion rates
- ROI by rule

**Compare:**

- SDR performance vs manual outreach
- Channel effectiveness
- Template variants (A/B tests)
- Rule performance

### Optimization Loop

```
1. SDR runs with your rules
2. Tracks performance
3. Identifies: "VIP rule has 45% conversion"
4. Suggests: "Apply VIP strategy to more segments"
5. You adjust rules based on data
6. SDR improves over time
```

---

## 🚀 Getting Started Checklist

### Week 1: Setup

- [ ] Connect your integrations (Shopify, HubSpot)
- [ ] Upload training documents (5-10 key docs)
- [ ] Review default SDR rules
- [ ] Customize thresholds for your business
- [ ] Create 2-3 message templates

### Week 2: Test

- [ ] Start with Copilot mode (you approve each message)
- [ ] Enable 1-2 rules initially (e.g., VIP + Hot Leads)
- [ ] Monitor activity feed
- [ ] Adjust based on early results

### Week 3: Scale

- [ ] Enable more rules
- [ ] Switch high-performing rules to Autopilot
- [ ] Add A/B tests for templates
- [ ] Configure integration-specific settings

### Week 4: Optimize

- [ ] Review performance dashboard
- [ ] Adjust thresholds based on data
- [ ] Expand to more channels
- [ ] Train Marvin with more documents

---

## 💡 Best Practices

### 1. Start Conservative

```
Initial Settings (Recommended):
- Mode: COPILOT (you approve)
- Score Threshold: 75+ (higher = safer)
- Max touchpoints: 2-3 per week
- Channels: Email only (to start)
- Enable: 1-2 rules maximum
```

### 2. Use Default Values as Starting Point

All defaults are based on industry best practices:

- VIP: $1000 / 5 orders (works for most e-commerce)
- Abandoned cart: $50 / 1 hour (proven effective)
- Hot leads: 70+ score (qualified leads)

Adjust based on YOUR data after 2-4 weeks.

### 3. Integration-Specific Strategies

**Shopify (E-commerce):**

- Focus on: VIP, Abandoned Cart, Re-engagement
- Use discounts strategically
- WhatsApp for high-value

**HubSpot (B2B SaaS):**

- Focus on: Hot Leads, At-Risk Deals
- LinkedIn for decision makers
- Fast response times

**Salesforce (Enterprise):**

- Focus on: High-value opportunities
- Multi-threading approach
- Longer nurture cycles

### 4. Template Customization

```
Bad Template:
"Hi, want to buy our product?"

Good Template (Configurable):
"Hi {{firstName}},

I noticed ${specific_observation_from_integration}.

${value_proposition_from_training_docs}

${call_to_action_based_on_segment}

Best,
${your_name}"
```

Use variables from integration data + your training knowledge.

---

## 🔧 Advanced Configuration Examples

### Example 1: Shopify VIP Tiered Strategy

```
Rule 1: Platinum VIPs
- Total Spent >= $5000
- Strategy: Personal call + gift
- Channel: Phone
- Assign to: Account manager

Rule 2: Gold VIPs
- Total Spent >= $2000 AND < $5000
- Strategy: Exclusive previews
- Channels: Email + WhatsApp

Rule 3: Silver VIPs
- Total Spent >= $1000 AND < $2000
- Strategy: Loyalty program invite
- Channel: Email
```

### Example 2: HubSpot Deal Stage Automation

```
Rule: Proposal Sent - No Response
- Deal Stage = "Proposal Sent"
- Days since last contact >= 3
- Deal Value >= $10,000

Sequence:
Day 3: Email - "Any questions about the proposal?"
Day 5: LinkedIn - "Wanted to ensure you received..."
Day 7: Email - "Here's a case study from similar company"
Day 10: Phone - Escalate to sales manager
```

### Example 3: Multi-Integration Strategy

```
Rule: Cross-Platform High Intent
- HubSpot Score >= 80
- OR Shopify Orders >= 3
- OR Mailchimp Engagement = High

Strategy: Fast-track VIP treatment
- Immediate assignment to sales
- Multi-channel outreach
- Premium onboarding
```

---

## 📈 Expected Outcomes

### Measurable Improvements

**Efficiency:**

- Time to first contact: 24-48h → <2h
- Lead follow-up rate: 40% → 95%
- Sales rep time freed: +6 hours/day

**Revenue:**

- Cart recovery revenue: +$15K-50K/month (e-commerce)
- Upsell revenue: +25-40%
- Deal save rate: +200-400%

**Quality:**

- Response rates: +150-250% vs cold outreach
- Conversion rates: +80-120%
- Customer satisfaction: Higher (faster response)

---

## 🎯 Segment Examples by Industry

### E-Commerce (Shopify-focused)

```
Priority Segments:
1. VIP Customers ($1000+)
2. Abandoned Carts ($50+)
3. One-time purchasers (upsell)
4. Inactive customers (90+ days)
5. High AOV (>$200 first order)
```

### B2B SaaS (HubSpot-focused)

```
Priority Segments:
1. Product Qualified Leads (PQL score 80+)
2. Trial users day 5-7 (conversion window)
3. At-risk churns (low engagement)
4. Expansion opportunities (using 1 feature, can use 3)
5. Cold leads with warm signals
```

### Enterprise Sales (Salesforce-focused)

```
Priority Segments:
1. $50K+ opportunities
2. Multiple stakeholders (3+)
3. Competitors mentioned
4. Slow-moving deals (60+ days)
5. Executive level contacts
```

---

## 🔮 What Makes This World-Class

### 1. Intelligence

Marvin uses:

- ✅ YOUR training documents (product knowledge)
- ✅ YOUR integration data (customer behavior)
- ✅ YOUR configured rules (business logic)
- ✅ AI optimization (learns what works)

### 2. Flexibility

Everything is configurable:

- ✅ Thresholds and values
- ✅ Strategies and timing
- ✅ Channels and frequency
- ✅ Templates and voice
- ✅ Autopilot vs Copilot

### 3. Integration

Works seamlessly with:

- ✅ 8+ integrations
- ✅ Real-time webhooks
- ✅ Bi-directional sync
- ✅ Cross-platform strategies

### 4. Results

Delivers measurable ROI:

- ✅ 2-4x higher response rates
- ✅ 40-60% time savings
- ✅ 80-120% conversion improvement
- ✅ Consistent execution (24/7)

---

## 🚦 Getting Started Today

### Step 1: Connect Integration (5 min)

```
Settings → Integrations → [Choose Shopify/HubSpot/etc]
→ Click Connect → Authorize
```

### Step 2: Train Marvin (10 min)

```
Settings → Marvin Training
→ Upload 3-5 key documents (products, sales playbook)
```

### Step 3: Configure SDR (15 min)

```
Settings → SDR Agent
→ Review default rules
→ Adjust thresholds for your business
→ Customize 1-2 templates
→ Save configuration
```

### Step 4: Activate (1 min)

```
Toggle "SDR Agent Active" ON
→ Choose Copilot mode (to start)
→ Monitor activity feed
```

### Step 5: Optimize (Ongoing)

```
Weekly: Review performance dashboard
→ See which rules convert best
→ Adjust thresholds
→ Add new rules
→ Improve templates
```

---

## 📞 Support

**Questions about SDR configuration?**

- Help Center: Press "?" on any page
- Settings guide: Built-in documentation
- Email: support@lumio.com
- Live chat: Dashboard bottom-right

**Want 1-on-1 setup help?**

- Email: enterprise@lumio.com
- Book call: [calendly.com/lumio-setup](calendly.com/lumio-setup)

---

## 🎓 Video Tutorials (Coming Soon)

- "SDR Agent in 5 Minutes"
- "Configuring Your First Rule"
- "Shopify + SDR: Cart Recovery Masterclass"
- "HubSpot + SDR: Deal Saving Strategies"
- "Training Marvin for Maximum Impact"

---

**Remember:** The power is in YOUR hands. Marvin SDR Agent executes YOUR strategy at scale, with AI intelligence and 24/7 availability.

**Start today, optimize forever. 🚀**

---

**Last Updated:** January 2025  
**Version:** 2.0.0  
**Maintained by:** Lumio Product Team
