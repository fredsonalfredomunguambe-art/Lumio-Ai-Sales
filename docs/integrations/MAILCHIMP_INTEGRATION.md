# Integração Mailchimp - Guia Completo

> **Versão:** 1.0.0  
> **Última atualização:** Janeiro 2025

---

## 🎯 Visão Geral

Conecte Mailchimp ao Lumio para gerenciar email marketing, sincronizar audiências e rastrear performance de campanhas.

### Benefícios

- 📧 **Sync de Audiências**: Leads do Lumio → Listas Mailchimp
- 📊 **Campaign Analytics**: Métricas de email no dashboard
- 🎯 **Segmentação**: Segmentos Lumio → Tags Mailchimp
- 🤖 **Automação**: Jornadas baseadas em comportamento

---

## ✨ Funcionalidades

| Funcionalidade   | Descrição                   | Status      |
| ---------------- | --------------------------- | ----------- |
| Sync de Contatos | Lumio → Mailchimp           | ✅ Ativo    |
| Import Campaigns | Mailchimp → Lumio Analytics | ✅ Ativo    |
| Segmentação      | Sync de segmentos como tags | ✅ Ativo    |
| Templates        | Usar templates Mailchimp    | 🚧 Em breve |
| Automations      | Criar automações            | 🚧 Em breve |

---

## 🚀 Configuração Rápida

### Conectar via OAuth

1. **Lumio**: Configurações → Integrações → Mailchimp
2. Clique em **Conectar**
3. **Mailchimp Login**: Autorize o acesso
4. **Selecionar Audience**: Escolha a lista padrão
5. **Sync**: Configure sincronização

### Configuração de Audiência

```typescript
{
  "defaultAudience": "lista_principal",
  "syncSegments": true,
  "doubleOptIn": false,
  "mergeFields": {
    "FNAME": "firstName",
    "LNAME": "lastName",
    "COMPANY": "company"
  }
}
```

---

## 🔄 Sincronização de Dados

### Lumio Lead → Mailchimp Contact

```typescript
{
  // Lumio
  "firstName": "Maria",
  "lastName": "Santos",
  "email": "maria@example.com",
  "company": "StartupXYZ",
  "tags": ["VIP", "Tech"],

  // Mailchimp
  "email_address": "maria@example.com",
  "status": "subscribed",
  "merge_fields": {
    "FNAME": "Maria",
    "LNAME": "Santos",
    "COMPANY": "StartupXYZ"
  },
  "tags": ["VIP", "Tech", "Lumio"]
}
```

### Mailchimp Campaign → Lumio Analytics

```typescript
{
  // Campaign data importado
  "type": "EMAIL_CAMPAIGN",
  "data": {
    "source": "mailchimp",
    "campaignId": "abc123",
    "subject": "Newsletter Janeiro",
    "sentDate": "2025-01-10",
    "stats": {
      "sent": 1000,
      "opens": 250,
      "clicks": 75,
      "bounces": 5
    }
  }
}
```

---

## 📊 Métricas

### KPIs Disponíveis

- **Open Rate**: Taxa de abertura média
- **Click Rate**: Taxa de cliques
- **Subscribers**: Total de inscritos
- **Growth Rate**: Taxa de crescimento da lista
- **Top Campaigns**: Campanhas com melhor performance

### Dashboard

Acesse: `Dashboard → Campaigns → Email Analytics`

---

## 🎣 Webhooks

Mailchimp notifica Lumio sobre:

- `subscribe` - Novo inscrito
- `unsubscribe` - Descadastro
- `profile` - Atualização de perfil
- `cleaned` - Email removido (bounce)
- `campaign` - Status de campanha

---

## ⚡ Limites de Taxa

| Plano    | Limite API     |
| -------- | -------------- |
| Free     | 500 req/min    |
| Standard | 1.000 req/min  |
| Premium  | 10.000 req/min |

Lumio respeita automaticamente esses limites.

---

## 💡 Melhores Práticas

### 1. Segmentação Eficaz

```typescript
// Sincronize segmentos como tags
const segment = {
  name: "High Value Leads",
  criteria: { score: { $gte: 80 } },
  mailchimpTag: "HVL",
};
```

### 2. GDPR Compliance

- ✅ Use double opt-in para conformidade
- ✅ Sincronize unsubscribes bidirecionalmente
- ✅ Respeite preferências de contato

### 3. Email Hygiene

- Remova bounces automaticamente
- Mantenha listas limpas
- Monitore engagement

---

## 🐛 Solução de Problemas

### Contatos não sincronizam

```bash
# Verificar audiência
GET /api/integrations/mailchimp/audiences

# Testar sync
POST /api/integrations/mailchimp/sync
{
  "syncOptions": { "contacts": true },
  "audienceId": "abc123"
}
```

### Erro: "Member Exists"

Contato já existe na lista. Use merge/update:

```typescript
{
  "status_if_new": "subscribed",
  "merge_fields": { ... }
}
```

---

## 🔗 Recursos

- [Mailchimp API v3.0](https://mailchimp.com/developer/marketing/api/)
- [OAuth Guide](https://mailchimp.com/developer/marketing/guides/access-user-data-oauth-2/)
- [Webhooks](https://mailchimp.com/developer/marketing/guides/sync-audience-data-webhooks/)

---

**Suporte**: suporte@lumio.com  
**Versão**: 1.0.0
