# Guia Completo: Sincronização de Dados Lumio

> **Versão:** 1.0.0  
> **Última atualização:** Janeiro 2025  
> **Audiência:** Desenvolvedores e Usuários Técnicos

---

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Arquitetura](#arquitetura)
3. [Tipos de Sync](#tipos-de-sync)
4. [Fluxo de Dados](#fluxo-de-dados)
5. [Mapeamento de Dados](#mapeamento-de-dados)
6. [Performance](#performance)
7. [Monitoring](#monitoring)

---

## 🎯 Visão Geral

O sistema de sincronização do Lumio garante que os dados entre plataformas integradas (HubSpot, Salesforce, Shopify, etc.) permaneçam consistentes e atualizados.

### Objetivos

- ✅ **Consistência**: Dados sincronizados entre sistemas
- ✅ **Performance**: Sync rápido e eficiente
- ✅ **Confiabilidade**: Retry automático e recuperação de erros
- ✅ **Transparência**: Visibilidade total do processo

---

## 🏗️ Arquitetura

### Componentes Principais

```
┌─────────────────────────────────────────────────────────────┐
│                     Integration Sync System                  │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐     ┌───────────────┐     ┌────────────┐ │
│  │  Sync        │────>│  Integration  │────>│  Mapping   │ │
│  │  Scheduler   │     │  Clients      │     │  Engine    │ │
│  └──────────────┘     └───────────────┘     └────────────┘ │
│         │                     │                      │       │
│         v                     v                      v       │
│  ┌──────────────┐     ┌───────────────┐     ┌────────────┐ │
│  │  Job         │     │  Rate         │     │  Database  │ │
│  │  Queue       │     │  Limiter      │     │  (Prisma)  │ │
│  └──────────────┘     └───────────────┘     └────────────┘ │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

### Camadas

1. **Scheduler**: Agenda syncs automáticos
2. **Job Queue**: Gerencia fila de jobs
3. **Integration Clients**: Comunica com APIs externas
4. **Rate Limiter**: Respeita limites de API
5. **Mapping Engine**: Transforma dados entre formatos
6. **Database**: Persiste dados sincronizados

---

## 🔄 Tipos de Sync

### 1. Initial Sync (Full)

Primeira sincronização completa de todos os dados históricos.

```typescript
POST /api/integrations/hubspot/sync
{
  "mode": "initial",
  "syncOptions": {
    "contacts": true,
    "deals": true,
    "companies": true
  }
}
```

**Características:**

- Sincroniza todos os dados históricos
- Pode demorar vários minutos
- Usa Bulk API quando disponível
- Executado apenas uma vez

**Quando usar:**

- Primeira conexão
- Após reset completo
- Recuperação de desastre

### 2. Incremental Sync

Sincroniza apenas alterações desde o último sync.

```typescript
POST /api/integrations/hubspot/sync
{
  "mode": "incremental",
  "syncOptions": {
    "contacts": true
  }
}
```

**Características:**

- Rápido (apenas deltas)
- Usa timestamps/cursors
- Executa automaticamente
- Eficiente em recursos

**Quando usar:**

- Syncs automáticos (a cada 30 min)
- Após initial sync
- Manutenção regular

### 3. Real-time Sync (Webhook)

Atualização instantânea via webhooks.

```typescript
// Webhook recebido
POST /api/integrations/hubspot/webhook
{
  "event": "contact.created",
  "objectId": "123456"
}
```

**Características:**

- Latência <1 segundo
- Push do provider
- Mais eficiente
- Requer configuração

**Quando usar:**

- Dados críticos
- Ações em tempo real
- Melhor UX

### 4. Manual Sync

Sync sob demanda pelo usuário.

```typescript
// Botão "Sync Now" no UI
POST /api/integrations/hubspot/sync
{
  "mode": "manual",
  "syncOptions": { "contacts": true }
}
```

**Características:**

- Imediato
- User-triggered
- Pode causar rate limiting
- Útil para debug

---

## 📊 Fluxo de Dados

### Fluxo Completo de Sync

```
1. USER/SCHEDULER
   │
   ├─> Inicia Sync Request
   │
   v
2. SYNC SERVICE
   │
   ├─> Cria Job no Database
   ├─> Adiciona à Queue
   │
   v
3. JOB WORKER
   │
   ├─> Pega Job da Queue
   ├─> Valida Access Token
   ├─> Busca dados do Provider
   │   │
   │   ├─> Rate Limiter (aguarda se necessário)
   │   ├─> HTTP Request
   │   └─> Retry em caso de erro
   │
   v
4. DATA MAPPING
   │
   ├─> Transforma formato Provider → Lumio
   ├─> Valida dados
   ├─> Enriquece (ex: lead score)
   │
   v
5. DATABASE
   │
   ├─> Upsert (insert ou update)
   ├─> Mantém metadata (lastSync, source, etc)
   │
   v
6. POST-PROCESSING
   │
   ├─> Atualiza Job status (completed/failed)
   ├─> Notifica frontend (via webhook/polling)
   ├─> Agenda próximo sync incremental
   │
   v
7. COMPLETE
```

### Código do Fluxo

```typescript
// src/lib/integrations/integration-sync-service.ts

async processSingleJob(userId: string, integrationId: string, jobId: string) {
  // 1. Get job from database
  const job = await prisma.integrationSyncJob.findUnique({ where: { id: jobId } });

  // 2. Update status to running
  await prisma.integrationSyncJob.update({
    where: { id: jobId },
    data: { status: 'running', startedAt: new Date() }
  });

  try {
    // 3. Get valid access token
    const accessToken = await getValidAccessToken(userId, integrationId);

    // 4. Execute sync based on integration type
    let result;
    switch (integrationId) {
      case 'hubspot':
        result = await this.syncHubSpot(userId, job.syncType);
        break;
      // ... outros providers
    }

    // 5. Update job as completed
    await prisma.integrationSyncJob.update({
      where: { id: jobId },
      data: {
        status: 'completed',
        progress: 100,
        processedRecords: result.recordsProcessed,
        completedAt: new Date()
      }
    });

    // 6. Update connection last sync
    await prisma.integrationConnection.updateMany({
      where: { userId, integrationId },
      data: { lastSync: new Date() }
    });

  } catch (error) {
    // 7. Handle errors
    await prisma.integrationSyncJob.update({
      where: { id: jobId },
      data: {
        status: 'failed',
        errors: JSON.stringify([error.message]),
        completedAt: new Date()
      }
    });
  }
}
```

---

## 🗺️ Mapeamento de Dados

### Exemplo: HubSpot Contact → Lumio Lead

```typescript
async function mapHubSpotContactToLead(
  contact: HubSpotContact,
  userId: string
): Promise<Lead> {
  return {
    // Identity
    userId,
    email: contact.email,
    firstName: contact.firstname || "Unknown",
    lastName: contact.lastname || "",

    // Company Info
    company: contact.company,
    jobTitle: contact.jobtitle,
    phone: contact.phone,

    // Integration Metadata
    source: "hubspot",
    externalId: contact.id,
    lastSyncedAt: new Date(),
    syncMetadata: JSON.stringify({
      lifecyclestage: contact.lifecyclestage,
      hubspotOwnerId: contact.hubspot_owner_id,
      createdate: contact.createdate,
    }),

    // Lumio-specific
    status: mapHubSpotStageToLeadStatus(contact.lifecyclestage),
    score: calculateLeadScore(contact),
    tags: extractTags(contact),
  };
}
```

### Mapeamento Bidirecional (Lumio ↔ Provider)

Para integrações bidirecionais (ex: Salesforce), também mapeamos ao contrário:

```typescript
async function mapLeadToSalesforceContact(
  lead: Lead
): Promise<SalesforceContact> {
  return {
    FirstName: lead.firstName,
    LastName: lead.lastName,
    Email: lead.email,
    Title: lead.jobTitle,
    Phone: lead.phone,
    Company: lead.company,
    LeadSource: "Lumio",
    Lumio_ID__c: lead.id, // Custom field
    Status: mapLeadStatusToSalesforce(lead.status),
  };
}
```

### Conflict Resolution

Quando há conflito (dado alterado em ambos os sistemas):

```typescript
enum ConflictStrategy {
  PROVIDER_WINS = "provider", // Provider tem prioridade
  LUMIO_WINS = "lumio", // Lumio tem prioridade
  LAST_MODIFIED = "last", // Mais recente ganha
  MANUAL = "manual", // Usuário decide
}

async function resolveConflict(
  lumioLead: Lead,
  providerContact: any,
  strategy: ConflictStrategy
): Promise<Lead> {
  switch (strategy) {
    case ConflictStrategy.PROVIDER_WINS:
      return mapProviderToLead(providerContact);

    case ConflictStrategy.LUMIO_WINS:
      await updateProviderContact(lumioLead);
      return lumioLead;

    case ConflictStrategy.LAST_MODIFIED:
      if (providerContact.updatedAt > lumioLead.updatedAt) {
        return mapProviderToLead(providerContact);
      }
      return lumioLead;

    case ConflictStrategy.MANUAL:
      await flagForManualReview(lumioLead.id, providerContact.id);
      return lumioLead; // Mantém Lumio até resolução
  }
}
```

---

## ⚡ Performance

### Otimizações

#### 1. Batch Processing

```typescript
// Processar em lotes ao invés de um por um
const BATCH_SIZE = 100;

for (let i = 0; i < contacts.length; i += BATCH_SIZE) {
  const batch = contacts.slice(i, i + BATCH_SIZE);

  await prisma.lead.createMany({
    data: batch.map(mapContactToLead),
    skipDuplicates: true,
  });
}
```

#### 2. Parallel Processing

```typescript
// Processar múltiplos tipos em paralelo
await Promise.all([
  syncHubSpotContacts(userId),
  syncHubSpotDeals(userId),
  syncHubSpotCompanies(userId),
]);
```

#### 3. Cursor-based Pagination

```typescript
// Mais eficiente que offset pagination
let cursor = null;

do {
  const response = await hubspot.getContacts({
    limit: 100,
    after: cursor,
  });

  await processContacts(response.results);
  cursor = response.paging?.next?.after;
} while (cursor);
```

#### 4. Caching

```typescript
// Cache de dados raramente alterados
const cachedCompanies = await cache.get(`companies:${userId}`);

if (cachedCompanies) {
  return cachedCompanies;
}

const companies = await fetchCompanies();
await cache.set(`companies:${userId}`, companies, 3600); // 1 hora
```

#### 5. Delta Queries

```typescript
// Buscar apenas alterações desde último sync
const lastSyncTime = await getLastSyncTime(userId, "hubspot", "contacts");

const contacts = await hubspot.getContacts({
  properties: ["email", "firstname", "lastname"],
  filterGroups: [
    {
      filters: [
        {
          propertyName: "hs_lastmodifieddate",
          operator: "GTE",
          value: lastSyncTime.getTime().toString(),
        },
      ],
    },
  ],
});
```

---

## 📊 Monitoring

### Métricas de Sync

```typescript
interface SyncMetrics {
  jobId: string;
  integrationId: string;
  syncType: string;

  // Performance
  startTime: Date;
  endTime: Date;
  duration: number; // ms

  // Data
  totalRecords: number;
  processedRecords: number;
  createdRecords: number;
  updatedRecords: number;
  failedRecords: number;

  // Quality
  successRate: number; // %
  errors: ErrorLog[];

  // Resources
  apiCallsUsed: number;
  cacheHitRate: number; // %
}
```

### Dashboard de Sync

Acesse: `Dashboard → Integrações → Sync Status`

Informações disponíveis:

- Status de cada integração (verde/amarelo/vermelho)
- Último sync bem-sucedido
- Próximo sync agendado
- Taxa de sucesso histórica
- Erros recentes

### Alertas

```typescript
// Alertas automáticos
const alerts = {
  syncFailed: {
    condition: 'status === "failed"',
    action: "notify_admin",
    channels: ["email", "slack"],
  },
  syncSlow: {
    condition: "duration > 300000", // >5 min
    action: "log_warning",
  },
  highErrorRate: {
    condition: "failedRecords / totalRecords > 0.1", // >10%
    action: "notify_admin",
  },
};
```

---

## 🐛 Troubleshooting

### Sync está travado

```bash
# 1. Verificar status do job
GET /api/integrations/hubspot/sync?jobId=sync_123

# 2. Ver logs
GET /api/integrations/hubspot/logs?jobId=sync_123

# 3. Cancelar se necessário
DELETE /api/integrations/hubspot/sync?jobId=sync_123

# 4. Reiniciar
POST /api/integrations/hubspot/sync
{
  "mode": "incremental",
  "syncOptions": { "contacts": true }
}
```

### Dados duplicados

```typescript
// Ferramenta de deduplicação
POST /api/integrations/deduplicate
{
  "integrationId": "hubspot",
  "type": "contacts",
  "strategy": "keep_latest" // ou "keep_provider", "manual"
}
```

### Sync lento

Causas comuns:

1. **Rate limiting**: Provider limitando requests
2. **Volume alto**: Muitos dados para sincronizar
3. **Network**: Latência de rede alta

Soluções:

- Aumentar batch size
- Usar parallel processing
- Configurar syncs em horários de baixo tráfego

---

## 💡 Melhores Práticas

### 1. Sync Incremental Regular

```typescript
// Agendar syncs incrementais frequentes
{
  "schedule": "*/30 * * * *", // A cada 30 min
  "mode": "incremental"
}
```

### 2. Webhooks para Dados Críticos

Configure webhooks para dados que precisam de baixa latência.

### 3. Monitoring Proativo

- Configure alertas antes de problemas
- Revise métricas semanalmente
- Teste recovery procedures

### 4. Data Hygiene

```typescript
// Limpeza periódica
await cleanupOldSyncJobs(); // Remover jobs >30 dias
await removeOrphanedRecords(); // Remover registros sem integração
await updateStaleData(); // Atualizar dados desatualizados
```

### 5. Documentação de Mapeamentos

Mantenha documentado como cada campo é mapeado:

```typescript
/**
 * Field Mapping: HubSpot → Lumio
 *
 * | HubSpot Field    | Lumio Field | Transform |
 * |------------------|-------------|-----------|
 * | firstname        | firstName   | None      |
 * | lastname         | lastName    | None      |
 * | lifecyclestage   | status      | mapStage()|
 * | hs_lead_status   | tags        | split(',') |
 */
```

---

## 🔗 Recursos

- [Integration Sync Service Code](../src/lib/integrations/integration-sync-service.ts)
- [HubSpot Client Code](../src/lib/integrations/providers/hubspot/hubspot-client.ts)
- [Sync API Endpoints](../src/app/api/integrations/[integrationId]/sync/route.ts)

---

**Versão**: 1.0.0  
**Mantido por**: Equipe Lumio  
**Contato**: dev@lumio.com
