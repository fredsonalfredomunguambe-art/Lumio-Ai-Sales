# 🔧 Guia Completo de Configuração para Desenvolvedores - Lumio Integrations

> **Versão:** 2.0.0  
> **Última atualização:** Janeiro 2025  
> **Audiência:** Desenvolvedores e DevOps  
> **Tempo estimado de setup:** 2-4 horas

---

## 📋 Índice

1. [Pré-requisitos](#pré-requisitos)
2. [Variáveis de Ambiente](#variáveis-de-ambiente)
3. [Configuração por Integração](#configuração-por-integração)
4. [Webhooks](#webhooks)
5. [Testes](#testes)
6. [Troubleshooting](#troubleshooting)

---

## 🎯 Pré-requisitos

### Ferramentas Necessárias

```bash
- Node.js >= 18.0.0
- npm ou yarn
- PostgreSQL ou SQLite
- Redis (opcional, para rate limiting)
- Conta Clerk (autenticação)
```

### Dependências do Projeto

```bash
npm install @hubspot/api-client @shopify/shopify-api @mailchimp/mailchimp_marketing \
  @slack/web-api jsforce bottleneck p-queue p-retry lru-cache
```

---

## 🔐 Variáveis de Ambiente

### Arquivo `.env.local`

Crie um arquivo `.env.local` na raiz do projeto com todas as credenciais:

```bash
# ==================== HUBSPOT ====================
HUBSPOT_CLIENT_ID=your_hubspot_client_id
HUBSPOT_CLIENT_SECRET=your_hubspot_client_secret
HUBSPOT_REDIRECT_URI=https://seu-dominio.com/api/integrations/hubspot/oauth/callback

# ==================== SHOPIFY ====================
SHOPIFY_CLIENT_ID=your_shopify_api_key
SHOPIFY_CLIENT_SECRET=your_shopify_api_secret_key
SHOPIFY_REDIRECT_URI=https://seu-dominio.com/api/integrations/shopify/oauth/callback
SHOPIFY_WEBHOOK_SECRET=your_shopify_webhook_secret

# ==================== SALESFORCE ====================
SALESFORCE_CLIENT_ID=your_salesforce_consumer_key
SALESFORCE_CLIENT_SECRET=your_salesforce_consumer_secret
SALESFORCE_REDIRECT_URI=https://seu-dominio.com/api/integrations/salesforce/oauth/callback

# ==================== WHATSAPP ====================
WHATSAPP_APP_ID=your_whatsapp_app_id
WHATSAPP_APP_SECRET=your_whatsapp_app_secret
WHATSAPP_WEBHOOK_VERIFY_TOKEN=your_custom_verify_token_here

# ==================== MAILCHIMP ====================
MAILCHIMP_CLIENT_ID=your_mailchimp_client_id
MAILCHIMP_CLIENT_SECRET=your_mailchimp_client_secret
MAILCHIMP_REDIRECT_URI=https://seu-dominio.com/api/integrations/mailchimp/oauth/callback

# ==================== SLACK ====================
SLACK_CLIENT_ID=your_slack_client_id
SLACK_CLIENT_SECRET=your_slack_client_secret
SLACK_REDIRECT_URI=https://seu-dominio.com/api/integrations/slack/oauth/callback

# ==================== PIPEDRIVE ====================
PIPEDRIVE_CLIENT_ID=your_pipedrive_client_id
PIPEDRIVE_CLIENT_SECRET=your_pipedrive_client_secret
PIPEDRIVE_REDIRECT_URI=https://seu-dominio.com/api/integrations/pipedrive/oauth/callback

# ==================== ENCRYPTION ====================
ENCRYPTION_KEY=generate_32_byte_hex_key_here

# ==================== APP URLS ====================
NEXT_PUBLIC_APP_URL=https://seu-dominio.com
```

### Como Gerar ENCRYPTION_KEY

```bash
# Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Ou online:
# https://www.random.org/strings/
```

---

## 🔧 Configuração por Integração

### 1. HubSpot

#### Passo 1: Criar App no HubSpot

1. Acesse [HubSpot Developer Portal](https://developers.hubspot.com/)
2. Vá em **Apps** → **Create app**
3. Preencha informações básicas

#### Passo 2: Configurar OAuth

```
Auth → Settings:
- Redirect URL: https://seu-dominio.com/api/integrations/hubspot/oauth/callback
- Scopes:
  ✓ crm.objects.contacts.read
  ✓ crm.objects.contacts.write
  ✓ crm.objects.deals.read
  ✓ crm.objects.companies.read
```

#### Passo 3: Obter Credenciais

```
Basic Info → App credentials:
- Client ID: Copie para HUBSPOT_CLIENT_ID
- Client Secret: Copie para HUBSPOT_CLIENT_SECRET
```

#### Passo 4: Testar Conexão

```bash
# No browser, acesse:
https://seu-dominio.com/dashboard/settings?tab=integrations

# Clique em "Connect HubSpot"
# Autorize o app
# Verifique se aparece "Connected" com badge verde
```

---

### 2. Shopify

#### Passo 1: Criar App no Shopify Partners

1. Acesse [Shopify Partners](https://partners.shopify.com/)
2. **Apps** → **Create app** → **Public app**
3. Nome: "Lumio Integration"

#### Passo 2: Configurar App

```
Configuration → URLs:
- App URL: https://seu-dominio.com
- Allowed redirection URL(s):
  https://seu-dominio.com/api/integrations/shopify/oauth/callback
```

#### Passo 3: API Scopes

```
API access scopes:
✓ read_products
✓ read_orders
✓ read_customers
✓ write_products (opcional)
✓ write_customers (opcional)
```

#### Passo 4: Webhooks

```
Webhooks → Create webhook:
- orders/create → https://seu-dominio.com/api/integrations/shopify/webhook
- orders/updated → https://seu-dominio.com/api/integrations/shopify/webhook
- customers/create → https://seu-dominio.com/api/integrations/shopify/webhook
- customers/updated → https://seu-dominio.com/api/integrations/shopify/webhook
- checkouts/create → https://seu-dominio.com/api/integrations/shopify/webhook
```

#### Passo 5: Obter Credenciais

```
Overview → App credentials:
- API key: Copie para SHOPIFY_CLIENT_ID
- API secret key: Copie para SHOPIFY_CLIENT_SECRET
```

#### Passo 6: Testar com Loja de Desenvolvimento

```bash
# Crie uma loja de desenvolvimento:
# https://shopify.dev/docs/apps/tools/development-stores

# Instale o app na loja:
https://SHOP_NAME.myshopify.com/admin/apps

# Conecte no Lumio:
# Settings → Integrations → Shopify → Connect
# Informe: SHOP_NAME.myshopify.com
```

---

### 3. Salesforce

#### Passo 1: Criar Connected App

1. Acesse Salesforce **Setup**
2. **Platform Tools** → **Apps** → **App Manager**
3. **New Connected App**

#### Passo 2: Configurar OAuth

```
API (Enable OAuth Settings):
✓ Enable OAuth Settings

Callback URL:
https://seu-dominio.com/api/integrations/salesforce/oauth/callback

Selected OAuth Scopes:
✓ Access and manage your data (api)
✓ Perform requests on your behalf at any time (refresh_token, offline_access)
✓ Access your basic information (id, profile, email, address, phone)
```

#### Passo 3: Obter Credenciais

```
Após salvar, volte à Connected App:
- Consumer Key → SALESFORCE_CLIENT_ID
- Consumer Secret → SALESFORCE_CLIENT_SECRET
```

#### Passo 4: Configurar Permissões

```
OAuth Policies:
- Permitted Users: All users may self-authorize
- IP Relaxation: Relax IP restrictions
- Refresh Token Policy: Refresh token is valid until revoked
```

---

### 4. WhatsApp Business

#### Passo 1: Criar App no Meta for Developers

1. Acesse [Meta for Developers](https://developers.facebook.com/)
2. **My Apps** → **Create App** → **Business**
3. Nome: "Lumio WhatsApp Integration"

#### Passo 2: Adicionar WhatsApp Product

```
Dashboard → Add Product → WhatsApp → Set Up
```

#### Passo 3: Configurar Número de Telefone

```
WhatsApp → Getting Started:
1. Adicionar número de telefone
2. Verificar número
3. Obter Phone Number ID
```

#### Passo 4: Configurar Webhook

```
WhatsApp → Configuration:
- Callback URL: https://seu-dominio.com/api/integrations/whatsapp/webhook
- Verify token: Gere um token único e adicione em WHATSAPP_WEBHOOK_VERIFY_TOKEN

Subscribe to fields:
✓ messages
✓ message_status
✓ contacts
```

#### Passo 5: Obter Token de Acesso

```
WhatsApp → API Setup:
- Temporary access token (para testes)
- OU configure System User para token permanente:

Business Settings → System Users → Add:
- Role: Admin
- Assets → Assign: WhatsApp Business Account
- Generate token com scopes: whatsapp_business_management, whatsapp_business_messaging
```

#### Passo 6: Credenciais no .env

```bash
# Não é OAuth, é token direto
# Configure manualmente no WorldClassIntegrationManager
# Ou armazene no banco via API
```

---

### 5. Mailchimp

#### Passo 1: Criar App no Mailchimp

1. Acesse [Mailchimp Developers](https://admin.mailchimp.com/account/oauth2/)
2. **Register an App**
3. App name: "Lumio Integration"

#### Passo 2: Configurar OAuth

```
Redirect URI:
https://seu-dominio.com/api/integrations/mailchimp/oauth/callback
```

#### Passo 3: Obter Credenciais

```
App Details:
- Client ID → MAILCHIMP_CLIENT_ID
- Client Secret → MAILCHIMP_CLIENT_SECRET
```

#### Passo 4: Configurar Webhooks

```
# Webhooks são configurados por audience
# Será feito automaticamente após conexão
```

---

### 6. Slack

#### Passo 1: Criar App no Slack

1. Acesse [Slack API](https://api.slack.com/apps)
2. **Create New App** → **From scratch**
3. Nome: "Lumio"
4. Workspace: Escolha seu workspace de desenvolvimento

#### Passo 2: Configurar OAuth & Permissions

```
OAuth & Permissions → Redirect URLs:
https://seu-dominio.com/api/integrations/slack/oauth/callback

Bot Token Scopes:
✓ chat:write
✓ chat:write.public
✓ channels:read
✓ users:read
✓ im:write

User Token Scopes:
✓ identity.basic
```

#### Passo 3: Obter Credenciais

```
Basic Information → App Credentials:
- Client ID → SLACK_CLIENT_ID
- Client Secret → SLACK_CLIENT_SECRET
```

#### Passo 4: Ativar Event Subscriptions (Opcional)

```
Event Subscriptions → Enable Events:
- Request URL: https://seu-dominio.com/api/integrations/slack/events

Subscribe to bot events:
✓ message.channels
✓ message.groups
✓ message.im
```

---

### 7. Pipedrive

#### Passo 1: Criar App no Pipedrive Marketplace

1. Acesse [Pipedrive Developer Hub](https://developers.pipedrive.com/)
2. **Create an app**
3. App name: "Lumio Integration"

#### Passo 2: Configurar OAuth

```
OAuth & access scopes:
- Callback URL: https://seu-dominio.com/api/integrations/pipedrive/oauth/callback

Scopes:
✓ deals:read
✓ deals:write
✓ contacts:read
✓ contacts:write
✓ organizations:read
```

#### Passo 3: Obter Credenciais

```
Basic information:
- Client ID → PIPEDRIVE_CLIENT_ID
- Client Secret → PIPEDRIVE_CLIENT_SECRET
```

---

## 🎣 Configuração de Webhooks

### Webhooks que Precisam de Configuração Manual

#### Shopify Webhooks

Após primeira conexão OAuth, execute:

```bash
POST /api/integrations/shopify/webhooks/setup
{
  "shop": "mystore.myshopify.com"
}

# Isso criará automaticamente todos os webhooks necessários
```

#### WhatsApp Webhooks

```bash
# Na Meta for Developers:
1. WhatsApp → Configuration
2. Webhook → Edit
3. Callback URL: https://seu-dominio.com/api/integrations/whatsapp/webhook
4. Verify token: [Seu WHATSAPP_WEBHOOK_VERIFY_TOKEN]
5. Verify and save
6. Subscribe to: messages, message_status, contacts
```

#### Mailchimp Webhooks

```bash
# Automático após conexão
# Ou manual via API:
POST https://us1.api.mailchimp.com/3.0/lists/{list_id}/webhooks
{
  "url": "https://seu-dominio.com/api/integrations/mailchimp/webhook",
  "events": {
    "subscribe": true,
    "unsubscribe": true,
    "profile": true,
    "cleaned": true,
    "campaign": true
  }
}
```

---

## 🧪 Testes

### Testar Cada Integração

#### HubSpot

```bash
# 1. Testar OAuth
curl https://seu-dominio.com/api/integrations/hubspot/oauth

# 2. Testar Sync
POST /api/integrations/hubspot/sync
{
  "syncOptions": { "contacts": true },
  "mode": "manual"
}

# 3. Verificar leads
GET /api/leads?source=hubspot
```

#### Shopify

```bash
# 1. Testar conexão (precisa de shop)
GET /api/integrations/shopify/oauth?shop=mystore.myshopify.com

# 2. Testar webhook
curl -X POST https://seu-dominio.com/api/integrations/shopify/webhook \
  -H "X-Shopify-Topic: orders/create" \
  -H "X-Shopify-Shop-Domain: mystore.myshopify.com" \
  -H "X-Shopify-Hmac-Sha256: test" \
  -d '{"id": 123, "email": "test@example.com"}'
```

#### WhatsApp

```bash
# 1. Testar verificação de webhook
GET /api/integrations/whatsapp/webhook?hub.mode=subscribe&hub.verify_token=SEU_TOKEN&hub.challenge=test

# Deve retornar: test

# 2. Enviar mensagem de teste
POST /api/integrations/whatsapp/send
{
  "to": "5511999999999",
  "type": "text",
  "text": { "body": "Teste Lumio" }
}
```

#### Salesforce

```bash
# 1. Testar OAuth
curl https://seu-dominio.com/api/integrations/salesforce/oauth

# 2. Testar query
# Após conectar, verificar se busca leads:
GET /api/leads?source=salesforce
```

#### Mailchimp

```bash
# 1. Testar OAuth
curl https://seu-dominio.com/api/integrations/mailchimp/oauth

# 2. Testar sync de campanhas
POST /api/integrations/mailchimp/sync
{
  "syncOptions": { "campaigns": true },
  "mode": "manual"
}
```

#### Slack

```bash
# 1. Testar OAuth
curl https://seu-dominio.com/api/integrations/slack/oauth

# 2. Testar notificação
POST /api/integrations/slack/test
{
  "channel": "#geral",
  "message": "Teste de integração Lumio"
}
```

#### Pipedrive

```bash
# 1. Testar OAuth
curl https://seu-dominio.com/api/integrations/pipedrive/oauth

# 2. Testar sync
POST /api/integrations/pipedrive/sync
{
  "syncOptions": { "contacts": true, "deals": true },
  "mode": "manual"
}
```

---

## 🚀 Deployment em Produção

### Checklist Pré-Deploy

- [ ] Todas as variáveis de ambiente configuradas
- [ ] URLs de callback apontam para domínio de produção
- [ ] Webhooks configurados para HTTPS (não HTTP)
- [ ] ENCRYPTION_KEY gerada e segura
- [ ] Rate limiters configurados
- [ ] Logs funcionando (Winston, Sentry)
- [ ] Database migrations aplicadas
- [ ] Redis configurado (se usar)

### Atualizar URLs para Produção

```bash
# Em cada provider, atualizar redirect URIs:
# DE:  https://localhost:3000/api/...
# PARA: https://app.lumio.com/api/...

# Exemplos:
HUBSPOT_REDIRECT_URI=https://app.lumio.com/api/integrations/hubspot/oauth/callback
SHOPIFY_REDIRECT_URI=https://app.lumio.com/api/integrations/shopify/oauth/callback
# ... etc
```

### Configurar Domínio de Webhooks

```bash
# Certifique-se que webhooks apontam para produção:
https://app.lumio.com/api/integrations/shopify/webhook
https://app.lumio.com/api/integrations/whatsapp/webhook
https://app.lumio.com/api/integrations/mailchimp/webhook
```

---

## 🐛 Troubleshooting

### Erro: "Invalid redirect_uri"

**Solução:**

1. Verifique se a URL está EXATAMENTE igual no provider
2. Deve ser HTTPS em produção
3. Não pode ter trailing slash (/)
4. Aguarde 5-10 minutos após salvar no provider

### Erro: "Invalid client_id"

**Solução:**

1. Verifique se copiou corretamente do provider
2. Não deve ter espaços ou quebras de linha
3. Verifique se o app está aprovado/publicado

### Erro: "Webhook verification failed"

**Solução:**

```bash
# Verifique signature verification:
# 1. WHATSAPP_APP_SECRET está correto
# 2. SHOPIFY_CLIENT_SECRET está correto
# 3. Body do webhook está sendo lido como string
# 4. Não há middleware alterando o body
```

### Erro: "Token expired"

**Solução:**

```bash
# HubSpot, Salesforce, outros OAuth:
# O sistema renova automaticamente com refresh_token

# WhatsApp (token permanente):
# Gere um novo token no Meta for Developers

# Mailchimp API Key:
# Gere uma nova API key no Mailchimp
```

### Erro: "Rate limit exceeded"

**Solução:**

```typescript
// Sistema já tem rate limiting automático
// Mas você pode configurar limites customizados:

// src/lib/integrations/core/rate-limiter.ts
const customLimits = {
  hubspot: { requestsPerSecond: 10 },
  shopify: { requestsPerSecond: 2 },
  salesforce: { requestsPerDay: 15000 },
};
```

---

## 📊 Monitoramento

### Logs Importantes

```bash
# Ver logs de integração
GET /api/integrations/logs?integration=hubspot&limit=100

# Ver status de sync
GET /api/integrations/hubspot/sync?jobId=xxx

# Ver conexões ativas
GET /api/integrations?status=connected
```

### Métricas para Monitorar

- Taxa de sucesso OAuth (>95%)
- Taxa de sucesso de sync (>98%)
- Latência média de webhooks (<2s)
- Erros de autenticação
- Rate limit hits

### Alertas Recomendados

```typescript
// Configure alertas para:
- OAuth failures (>5% em 1h)
- Sync failures (>10% em 1h)
- Webhook delivery failures (>5%)
- Token expiration sem refresh
- API rate limits atingidos
```

---

## 🔒 Segurança

### Melhores Práticas

1. **Nunca commite .env files**

   ```bash
   # Adicione ao .gitignore:
   .env
   .env.local
   .env.production
   ```

2. **Rotacione secrets regularmente**

   ```bash
   # A cada 90 dias:
   - Gere novos Client Secrets
   - Atualize ENCRYPTION_KEY
   - Force reconexão de usuários
   ```

3. **Use HTTPS obrigatório**

   ```typescript
   // Em middleware.ts
   if (
     process.env.NODE_ENV === "production" &&
     !request.url.startsWith("https")
   ) {
     return NextResponse.redirect(
       `https://${request.headers.get("host")}${request.url}`
     );
   }
   ```

4. **Valide todos os webhooks**
   ```typescript
   // SEMPRE verifique assinaturas
   if (!verifyWebhookSignature(signature, body, secret)) {
     return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
   }
   ```

---

## 📚 Recursos Adicionais

### Documentação Oficial

- [HubSpot API](https://developers.hubspot.com/docs/api/overview)
- [Shopify API](https://shopify.dev/docs/api)
- [Salesforce API](https://developer.salesforce.com/docs/atlas.en-us.api.meta/api/)
- [WhatsApp Cloud API](https://developers.facebook.com/docs/whatsapp/cloud-api)
- [Mailchimp API](https://mailchimp.com/developer/marketing/api/)
- [Slack API](https://api.slack.com/)
- [Pipedrive API](https://developers.pipedrive.com/)

### Ferramentas Úteis

- [Postman Collections](https://www.postman.com/) - Testar APIs
- [ngrok](https://ngrok.com/) - Testar webhooks localmente
- [Webhook.site](https://webhook.site/) - Debug webhooks
- [JWT.io](https://jwt.io/) - Decodificar tokens

---

## 🆘 Suporte

### Canais

- **Issues**: GitHub Issues do projeto
- **Email**: dev@lumio.com
- **Slack**: #lumio-dev (para equipe interna)

### Processo de Suporte

1. Verifique os logs: `GET /api/integrations/logs`
2. Confira a documentação acima
3. Teste em ambiente de desenvolvimento
4. Se persistir, abra issue com:
   - Logs completos
   - Variáveis de ambiente (SEM valores sensíveis)
   - Passos para reproduzir
   - Versão do Node/npm

---

## ✅ Checklist Final

Antes de considerar setup completo:

### Ambiente de Desenvolvimento

- [ ] Todas as 7 integrações com credenciais configuradas
- [ ] OAuth funcionando para cada uma
- [ ] Webhooks testados localmente (ngrok)
- [ ] Sync manual funciona
- [ ] Dados aparecem no dashboard com filtros

### Ambiente de Produção

- [ ] Domínio configurado (app.lumio.com)
- [ ] SSL/TLS ativo
- [ ] Redirect URIs atualizadas para produção
- [ ] Webhooks apontam para produção
- [ ] Secrets armazenados em vault (não .env files)
- [ ] Monitoring ativo (Sentry, New Relic, etc)
- [ ] Backup de database configurado
- [ ] Rate limits testados com carga

---

**Versão:** 2.0.0  
**Última atualização:** Janeiro 2025  
**Mantido por:** Equipe Lumio Dev  
**Licença:** Proprietary

**🎉 Parabéns! Você configurou um sistema de integrações de nível mundial!**
