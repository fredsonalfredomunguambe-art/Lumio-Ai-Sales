<!-- ab461f25-6070-44dd-a564-a00fdea68bc0 a3075bc9-709c-4208-9dbd-a4dfd02addf4 -->
# Plano FINAL - O Que Realmente Falta

## ✅ JÁ IMPLEMENTADO (NÃO FAZER)

### Integrações - Sistema Completo

- ✅ OAuth para 7 integrações (HubSpot, Shopify, Salesforce, Mailchimp, Slack, LinkedIn, Pipedrive)
- ✅ Connect genérico `/api/integrations/[integrationId]/connect`
- ✅ Shopify webhook completo (customers→leads, orders, products, checkouts)
- ✅ Sync genérico `/api/integrations/[integrationId]/sync`
- ✅ Docs completos (OAuth Guide, HubSpot Guide, Shopify Guide)
- ✅ Lead source filter funcionando

### Backend

- ✅ Leads API com source filter
- ✅ Campaigns GET/POST/PUT/DELETE básicos
- ✅ Training API routes existem
- ✅ Marvin SDR engine base

---

## ❌ O QUE FALTA FAZER

### 1. CAMPAIGNS - Actions Funcionais (6-8h)

#### 1.1 Backend Actions API

**Criar:** `src/app/api/campaigns/[id]/actions/route.ts`

```typescript
POST /api/campaigns/[id]/actions
Body: { action: "play" | "pause" | "duplicate" }

- play → status = RUNNING, nextSend = agora
- pause → status = PAUSED  
- duplicate → cria cópia com "(Copy)"
```

#### 1.2 Frontend - Replace console.log

**Modificar:** `src/app/dashboard/campaigns/page.tsx`

```typescript
// Linha 179-186: handleCampaignAction
const handleCampaignAction = async (campaignId, action) => {
  setLoading(campaignId);
  try {
    const res = await fetch(`/api/campaigns/${campaignId}/actions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action })
    });
    if (res.ok) {
      toast.success(`Campaign ${action}ed successfully`);
      loadCampaigns();
    } else {
      throw new Error('Action failed');
    }
  } catch (error) {
    toast.error(`Failed to ${action} campaign`);
  } finally {
    setLoading(null);
  }
};
```

#### 1.3 Create Campaign Modal

**Criar:** `src/components/campaigns/CreateCampaignModal.tsx`

Sections:

1. Basic Info (name, type, mode)
2. Target Segment selector
3. Sequence Builder (steps)
4. Schedule picker
5. Preview panel

#### 1.4 Campaign Details Modal

**Criar:** `src/components/campaigns/CampaignDetailsModal.tsx`

Tabs:

- Overview (métricas, status)
- Sequences (ver/editar steps)
- Analytics (charts)
- Recipients (lista de leads)

---

### 2. HELP CENTER - Contextual (5-7h)

#### 2.1 Help Center Modal

**Criar:** `src/components/HelpCenter/HelpCenterModal.tsx`

```tsx
interface Props {
  context: 'leads' | 'campaigns' | 'calendar' | 'insights' | 'settings';
  isOpen: boolean;
  onClose: () => void;
}

Features:
- Search bar (fuzzy search)
- Category sidebar
- Article viewer
- Video embed support
- Keyboard shortcuts (?)
```

#### 2.2 Help Content Database

**Criar:** `src/components/HelpCenter/content/index.ts`

```typescript
export const helpContent = {
  leads: {
    title: "Leads Management",
    articles: [
      {
        id: "import-leads",
        title: "How to Import Leads",
        content: "...",
        video: "/videos/import-leads.mp4",
        steps: [...]
      },
      // ... mais artigos
    ]
  },
  campaigns: { ... },
  integrations: {
    shopify: {
      title: "Connect Shopify",
      steps: [
        "Go to Settings → Integrations",
        "Find Shopify card",
        "Click Connect",
        "Authorize in popup",
        "Data syncs automatically"
      ]
    },
    hubspot: { ... }
  }
}
```

#### 2.3 Help Button Component

**Criar:** `src/components/HelpCenter/HelpButton.tsx`

Floating button bottom-right:

- Icon: "?"
- Pulsing animation
- Click opens modal

#### 2.4 Add to All Pages

**Modificar:** Todas `src/app/dashboard/*/page.tsx`

```tsx
import { HelpButton } from '@/components/HelpCenter/HelpButton';

// Before closing </div>:
<HelpButton context="leads" />
```

---

### 3. MARVIN TRAINING - Full UI (6-8h)

#### 3.1 Training Page UI

**Modificar:** `src/app/dashboard/settings/marvin-training/page.tsx`

```tsx
Sections:
1. Upload Zone
   - Drag & drop
   - Accept: PDF, DOCX, TXT, MD
   - Max 10MB per file
   
2. Documents List
   - Table: Name, Type, Size, Date, Status
   - Actions: View, Delete
   - Category tags
   
3. Test Panel
   - "Ask Marvin" input
   - Shows responses using trained knowledge
   - Confidence score
```

#### 3.2 Training API - Complete Implementation

**Verificar/Completar:** `src/app/api/training/documents/route.ts`

```typescript
POST /api/training/documents
- Upload → Cloudinary
- Extract text (pdf-parse for PDF, mammoth for DOCX)
- Chunk (max 1000 chars)
- Generate embeddings (OpenAI)
- Store in DB with vector
- Return progress

GET /api/training/documents
- List all for user
- Filter by category
- Show stats

DELETE /api/training/documents/[id]
- Remove from storage
- Remove from vector DB
- Update knowledge base
```

#### 3.3 Knowledge Manager

**Criar:** `src/components/marvin/KnowledgeManager.tsx`

- View all documents
- Filter by category
- Search within documents
- Quick test panel
- Export knowledge base

---

### 4. SDR AGENT - Activation (7-9h)

#### 4.1 SDR Control Panel

**Criar:** `src/components/marvin/SDRAgentControl.tsx`

```tsx
<Card>
  <Toggle 
    active={sdrActive}
    onChange={handleToggle}
    label="SDR Agent Active"
  />
  
  <Config>
    <Field label="Target Score">
      <Slider min={0} max={100} value={70} />
    </Field>
    
    <Field label="Channels">
      <Checkbox>Email</Checkbox>
      <Checkbox>LinkedIn</Checkbox>
      <Checkbox>WhatsApp</Checkbox>
    </Field>
    
    <Field label="Max Touchpoints/Week">
      <Input type="number" value={3} />
    </Field>
    
    <Field label="Templates">
      <Select options={templates} />
    </Field>
  </Config>
  
  <ActivityFeed>
    {activities.map(a => (
      <ActivityItem
        leadName={a.leadName}
        action={a.action}
        time={a.timestamp}
        status={a.status}
      />
    ))}
  </ActivityFeed>
</Card>
```

#### 4.2 Expand SDR Engine

**Modificar:** `src/lib/marvin-sdr-engine.ts`

```typescript
class SDREngine {
  async scanLeads() {
    // Query leads: score >= threshold && status = NEW
    const leads = await prisma.lead.findMany({
      where: {
        score: { gte: config.scoreThreshold },
        status: 'NEW'
      }
    });
    return leads;
  }
  
  async createOutreachSequence(leadId: string) {
    // 1. Get lead data
    // 2. Get training knowledge
    // 3. Generate personalized message (OpenAI)
    // 4. Schedule sends
    // 5. Create LeadInteraction records
  }
  
  async processResponses() {
    // Check for email/LinkedIn replies
    // Update lead status
    // Notify if high-intent
  }
  
  async optimizeMessages() {
    // Track which templates work best
    // A/B test variations
    // Auto-improve
  }
}
```

#### 4.3 SDR Settings Page - CONFIGURÁVEL PELO CLIENTE

**Criar:** `src/app/dashboard/settings/sdr-agent/page.tsx`

**IMPORTANTE:** Cliente define TODOS os valores, não hardcoded!

Tabs:

**1. Segmentation Rules (Cliente configura)**

```tsx
<SegmentationRules>
  <RuleBuilder>
    {/* VIP Customers */}
    <Rule category="VIP Customers">
      <Field label="Define VIP Customer">
        Total Spent >= <Input type="number" defaultValue={1000} placeholder="e.g. 1000" />
        OR Orders Count >= <Input type="number" defaultValue={5} placeholder="e.g. 5" />
      </Field>
      <Field label="VIP Strategy">
        <Select>
          <Option>Personal outreach + exclusive offers</Option>
          <Option>Priority support</Option>
          <Option>Early access to new products</Option>
        </Select>
      </Field>
    </Rule>
    
    {/* Abandoned Cart */}
    <Rule category="Abandoned Cart">
      <Field label="Cart Value Threshold">
        Cart Value >= <Input type="number" defaultValue={50} placeholder="e.g. 50" />
      </Field>
      <Field label="Wait Time Before Contact">
        <Input type="number" defaultValue={1} /> hours
      </Field>
      <Field label="Recovery Strategy">
        <Select>
          <Option>Email + WhatsApp</Option>
          <Option>Email only</Option>
          <Option>WhatsApp only</Option>
        </Select>
      </Field>
      <Field label="Discount Offer">
        <Checkbox>Offer discount</Checkbox>
        <Input type="number" placeholder="10" />%
      </Field>
    </Rule>
    
    {/* New High-Value Customers */}
    <Rule category="New High-Value Customers">
      <Field label="First Order Threshold">
        Order Value >= <Input type="number" defaultValue={200} placeholder="e.g. 200" />
      </Field>
      <Field label="Follow-up Timing">
        Send thank you after <Input type="number" defaultValue={3} /> days
      </Field>
      <Field label="Upsell Strategy">
        <Checkbox>Suggest complementary products</Checkbox>
        <Checkbox>Offer loyalty program</Checkbox>
        <Checkbox>Request review</Checkbox>
      </Field>
    </Rule>
    
    {/* Hot Leads (from CRM) */}
    <Rule category="Hot Leads">
      <Field label="Lead Score Threshold">
        Score >= <Input type="number" defaultValue={70} placeholder="e.g. 70" />
      </Field>
      <Field label="Fast-Track Strategy">
        <Select>
          <Option>Multi-channel sequence (email+LinkedIn+phone)</Option>
          <Option>Email sequence only</Option>
          <Option>Direct sales assignment</Option>
        </Select>
      </Field>
      <Field label="Response Time">
        Contact within <Input type="number" defaultValue={2} /> hours
      </Field>
    </Rule>
    
    {/* Re-engagement (Inactive) */}
    <Rule category="Re-engagement">
      <Field label="Inactive Period">
        No purchase in last <Input type="number" defaultValue={90} /> days
      </Field>
      <Field label="Minimum Past Spend">
        Had spent >= <Input type="number" defaultValue={100} placeholder="e.g. 100" />
      </Field>
      <Field label="Win-back Strategy">
        <Select>
          <Option>Discount offer</Option>
          <Option>New products showcase</Option>
          <Option>Survey + incentive</Option>
        </Select>
      </Field>
      <Field label="Discount Amount">
        <Input type="number" defaultValue={15} />%
      </Field>
    </Rule>
    
    {/* At-Risk Deals (from CRM) */}
    <Rule category="At-Risk Deals">
      <Field label="Deal Stage">
        <Select>
          <Option>Proposal sent</Option>
          <Option>Negotiation</Option>
          <Option>Any stage</Option>
        </Select>
      </Field>
      <Field label="No Contact For">
        <Input type="number" defaultValue={7} /> days
      </Field>
      <Field label="Deal Value Minimum">
        Deal value >= <Input type="number" defaultValue={5000} />
      </Field>
      <Field label="Save Strategy">
        <Select>
          <Option>Personal call from manager</Option>
          <Option>Additional incentive</Option>
          <Option>Case study + social proof</Option>
        </Select>
      </Field>
    </Rule>
    
    <Button variant="outline" icon={<Plus />}>
      Add Custom Rule
    </Button>
  </RuleBuilder>
</SegmentationRules>
```

**2. Integration-Specific Config**

```tsx
<IntegrationConfig>
  {/* Shopify */}
  <IntegrationRules integration="shopify">
    <Toggle>Enable SDR for Shopify leads</Toggle>
    <Field label="Sync Frequency">
      <Select defaultValue="realtime">
        <Option value="realtime">Real-time (webhooks)</Option>
        <Option value="15min">Every 15 minutes</Option>
        <Option value="1hour">Every hour</Option>
      </Select>
    </Field>
    <Field label="Auto-apply Rules">
      <Checkbox checked>VIP Customers</Checkbox>
      <Checkbox checked>Abandoned Cart</Checkbox>
      <Checkbox checked>New High-Value</Checkbox>
      <Checkbox>Re-engagement</Checkbox>
    </Field>
  </IntegrationRules>
  
  {/* HubSpot */}
  <IntegrationRules integration="hubspot">
    <Toggle>Enable SDR for HubSpot leads</Toggle>
    <Field label="Auto-apply Rules">
      <Checkbox checked>Hot Leads</Checkbox>
      <Checkbox checked>At-Risk Deals</Checkbox>
      <Checkbox>Re-engagement</Checkbox>
    </Field>
    <Field label="Sync Deal Stages">
      <Checkbox>Sync SDR actions back to HubSpot</Checkbox>
    </Field>
  </IntegrationRules>
</IntegrationConfig>
```

**3. Templates Library (Cliente edita)**

```tsx
<TemplatesLibrary>
  <Template name="VIP Welcome">
    <Editor>
      Hi {{firstName}},
      
      Welcome to our VIP club! You've spent {{totalSpent}} with us.
      
      As a thank you, here's {{vipBenefit}}.
      
      [Cliente pode editar todo o texto]
    </Editor>
    <Variables>
      Available: {{firstName}}, {{lastName}}, {{totalSpent}}, {{ordersCount}}, 
      {{favoriteProduct}}, {{lastPurchaseDate}}
    </Variables>
    <TestPreview leadId="select_lead">
      Preview with real lead data
    </TestPreview>
  </Template>
  
  <Template name="Abandoned Cart">
    <Editor>
      Hi {{firstName}},
      
      You left {{cartValue}} worth of items in your cart:
      {{#each cartItems}}
      - {{name}} ({{price}})
      {{/each}}
      
      Complete your purchase now and get {{discountPercent}}% off!
      
      [Link to cart]
    </Editor>
  </Template>
  
  <Button>Create Custom Template</Button>
</TemplatesLibrary>
```

**4. Approval Workflow**

- Autopilot mode: SDR executa automaticamente
- Copilot mode: SDR sugere, cliente aprova
- Hybrid: Autopilot para valores baixos, Copilot para altos

**5. Performance Dashboard**

- ROI por regra
- Qual segmentação converte melhor
- Sugestões de otimização baseadas em dados

---

### 5. INTEGRATION HEALTH DASHBOARD (3-5h)

#### 5.1 Health Dashboard Component

**Criar:** `src/components/integrations/IntegrationHealthDashboard.tsx`

```tsx
<Dashboard>
  <Grid>
    {integrations.map(int => (
      <IntegrationCard key={int.id}>
        <Header>
          <Icon src={int.icon} />
          <Name>{int.name}</Name>
          <StatusBadge status={int.status} />
        </Header>
        
        <Metrics>
          <Metric label="Last Sync">
            {formatTimeAgo(int.lastSync)}
          </Metric>
          <Metric label="Total Synced">
            {int.totalSynced} leads
          </Metric>
          <Metric label="Last 24h">
            {int.last24h} new
          </Metric>
          <Metric label="Errors">
            {int.errors}
          </Metric>
        </Metrics>
        
        <Actions>
          <Button onClick={() => syncNow(int.id)}>
            <RefreshIcon /> Sync Now
          </Button>
          <Button onClick={() => viewLogs(int.id)}>
            <LogsIcon /> Logs
          </Button>
          <Button onClick={() => disconnect(int.id)} variant="danger">
            <DisconnectIcon /> Disconnect
          </Button>
        </Actions>
        
        {int.status === 'error' && (
          <ErrorAlert>
            {int.lastError}
            <Button onClick={() => retry(int.id)}>Retry</Button>
          </ErrorAlert>
        )}
      </IntegrationCard>
    ))}
  </Grid>
</Dashboard>
```

#### 5.2 Add to Settings/Integrations Page

**Modificar:** `src/app/dashboard/settings/integrations/page.tsx`

```tsx
import { IntegrationHealthDashboard } from '@/components/integrations/IntegrationHealthDashboard';

// Add tab or section:
<Tab value="health">
  <IntegrationHealthDashboard />
</Tab>
```

---

### 6. VISUAL INDICATORS - Leads Page (2-3h)

#### 6.1 Integration Badges

**Modificar:** `src/app/dashboard/leads/page.tsx`

Na coluna Source da tabela:

```tsx
// Linha ~476 (source column)
<TableCell>
  {lead.source && (
    <div className="flex items-center gap-2">
      <IntegrationIcon 
        source={lead.source} 
        className="w-4 h-4"
      />
      <Badge variant="ghost">{lead.source}</Badge>
      {lead.lastSyncedAt && (
        <Tooltip content={`Last synced: ${formatTimeAgo(lead.lastSyncedAt)}`}>
          <RefreshIcon className="w-3 h-3 text-gray-400" />
        </Tooltip>
      )}
    </div>
  )}
</TableCell>
```

#### 6.2 Integration Icon Component

**Criar:** `src/components/integrations/IntegrationIcon.tsx`

```tsx
const ICONS = {
  shopify: '🛍️',
  hubspot: '🟠',
  salesforce: '☁️',
  mailchimp: '🐵',
  linkedin: '💼',
  // ...
};

export function IntegrationIcon({ source }: { source: string }) {
  return <span className="text-lg">{ICONS[source] || '📊'}</span>;
}
```

---

### 7. INTEGRATION TEST GUIDES (2-3h)

#### 7.1 Test Guides for Each

**Criar arquivos em:** `docs/integrations/`

1. `SHOPIFY_TEST.md` - Como testar Shopify ✅ (já existe parcialmente)
2. `HUBSPOT_TEST.md` - Como criar app dev, testar OAuth, webhooks
3. `SALESFORCE_TEST.md` - Sandbox, OAuth flow, test data
4. `MAILCHIMP_TEST.md` - Test account, audience sync

Estrutura de cada:

```markdown
# [Integration] Test Guide

## 1. Create Test Account
- Link to sign up
- Credentials needed

## 2. Get API Access
- Where to find API keys
- OAuth setup

## 3. Connect in Lumio
- Step-by-step

## 4. Test Data Sync
- Create test data in source
- Verify appears in Lumio
- Check filters work

## 5. Test Webhooks (if applicable)
- How to trigger
- Verify real-time sync

## Troubleshooting
- Common errors
- How to debug
```

---

## ARQUIVOS A CRIAR (Lista Final)

### Campaigns

1. `src/app/api/campaigns/[id]/actions/route.ts`
2. `src/components/campaigns/CreateCampaignModal.tsx`
3. `src/components/campaigns/CampaignDetailsModal.tsx`

### Help Center

4. `src/components/HelpCenter/HelpCenterModal.tsx`
5. `src/components/HelpCenter/HelpButton.tsx`
6. `src/components/HelpCenter/content/index.ts`

### Marvin

7. `src/components/marvin/KnowledgeManager.tsx`
8. `src/components/marvin/SDRAgentControl.tsx`
9. `src/app/dashboard/settings/sdr-agent/page.tsx`

### Integrations

10. `src/components/integrations/IntegrationHealthDashboard.tsx`
11. `src/components/integrations/IntegrationIcon.tsx`

### Docs

12. `docs/integrations/HUBSPOT_TEST.md`
13. `docs/integrations/SALESFORCE_TEST.md`
14. `docs/integrations/MAILCHIMP_TEST.md`

## ARQUIVOS A MODIFICAR (Lista Final)

1. `src/app/dashboard/campaigns/page.tsx` - Implement handleCampaignAction
2. `src/app/dashboard/settings/marvin-training/page.tsx` - Full UI
3. `src/app/dashboard/leads/page.tsx` - Add integration badges
4. `src/lib/marvin-sdr-engine.ts` - Expand methods
5. `src/app/api/training/documents/route.ts` - Complete implementation
6. All `src/app/dashboard/*/page.tsx` - Add HelpButton

---

## SUCCESS CRITERIA

### Campaigns ✅

- [ ] Play button starts campaign
- [ ] Pause button pauses
- [ ] Duplicate creates copy
- [ ] Delete removes with confirmation
- [ ] Create modal saves campaign
- [ ] Details modal shows metrics

### Help Center ✅

- [ ] Button "?" on all pages
- [ ] Modal opens with context
- [ ] Search works
- [ ] Keyboard shortcut (?)

### Marvin Training ✅

- [ ] Upload document works
- [ ] Document shows in list
- [ ] Test panel uses knowledge
- [ ] Delete removes document

### SDR Agent ✅

- [ ] Can be activated/deactivated
- [ ] Config saves
- [ ] Scans leads by threshold
- [ ] Creates outreach sequences
- [ ] Activity feed shows actions

### Integration Health ✅

- [ ] Dashboard shows all integrations
- [ ] Real-time status
- [ ] Sync Now works
- [ ] Logs viewable
- [ ] Disconnect works

### Visual Indicators ✅

- [ ] Leads show source badge
- [ ] Icon for each integration
- [ ] Last sync tooltip
- [ ] Refresh option

---

## ESTIMATIVA REALISTA

**Total: 25-35 horas** (reduzido pois integrações OAuth/webhooks prontos)

- Campaigns: 6-8h
- Help Center: 5-7h
- Marvin Training: 6-8h
- SDR Agent: 7-9h
- Integration Health: 3-5h
- Visual Indicators: 2-3h
- Test Guides: 2-3h

---

## ORDEM DE IMPLEMENTAÇÃO

1. **Campaigns Actions** (maior impacto, mais visível)
2. **Help Center** (pode fazer em paralelo)
3. **Integration Health Dashboard** (completa integrações)
4. **Visual Indicators** (polish integrações)
5. **Marvin Training** (UI polida)
6. **SDR Agent** (feature avançada)
7. **Test Guides** (documentação final)

---

## NOTAS IMPORTANTES

### NÃO REPETIR (já existe):

- ❌ OAuth implementations
- ❌ Shopify webhook  
- ❌ Integration connect routes
- ❌ Sync endpoints básicos
- ❌ Documentação OAuth/HubSpot/Shopify

### FOCAR EM:

- ✅ Campaign actions + modals
- ✅ Help Center completo
- ✅ Marvin Training UI polida
- ✅ SDR Agent funcional
- ✅ Integration health monitoring
- ✅ Polish visual (badges, icons)

### To-dos

- [ ] Implement Shopify to Leads sync - Create sync endpoint that fetches Shopify customers and saves as leads with source='shopify'
- [ ] Implement HubSpot to Leads sync - Create sync endpoint for HubSpot contacts
- [ ] Implement webhook handlers for Shopify and HubSpot for real-time sync
- [ ] Create backend API routes for campaign actions: play, pause, duplicate, delete
- [ ] Replace console.log with real API calls in campaigns page for all action buttons
- [ ] Build CreateCampaignModal with full form, sequence builder, and schedule picker
- [ ] Build CampaignDetailsModal to view/edit campaign configuration and metrics
- [ ] Create HelpCenterModal component with contextual content system
- [ ] Write help content for all dashboard pages (Leads, Campaigns, Calendar, Insights, Settings)
- [ ] Add Help Center button to all dashboard pages
- [ ] Build complete Marvin Training page with document upload, drag-drop, and knowledge management
- [ ] Implement training API to process uploaded documents and update Marvin knowledge base
- [ ] Create SDR Agent activation UI with configuration options and activity dashboard
- [ ] Expand marvin-sdr-engine.ts with automated outreach sequencing and lead scoring
- [ ] Write test guides for each integration (Shopify, HubSpot, Salesforce, etc)
- [ ] Build Integration Health Dashboard showing real-time status and sync times